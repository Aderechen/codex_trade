from __future__ import annotations
import os
import threading

import json
import math
import time
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


PORT = 4173
SINA_MARKET_URL = (
    "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/"
    "Market_Center.getHQNodeData"
)
SINA_KLINE_URL = "https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData"
EASTMONEY_QUOTE_URL = (
    "https://push2.eastmoney.com/api/qt/clist/get"
)
EASTMONEY_FIELDS = "f12,f14,f2,f3,f6,f10,f8,f15,f16,f17,f184,f100"


def fetch_json(url: str, timeout: int = 5):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json,text/plain,*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = response.read().decode("gbk", errors="ignore")
        return json.loads(payload)
    except Exception:
        return None


def detect_board(code: str) -> str:
    if code.startswith(("688", "689")):
        return "star"
    if code.startswith(("300", "301")):
        return "chinext"
    if code.startswith(("8", "4", "920")):
        return "bse"
    return "main"


def limit_rate(code: str, name: str = "") -> float:
    board = detect_board(code)
    is_st = "ST" in name.upper()
    if is_st and board == "main":
        return 0.05
    if board in {"star", "chinext"}:
        return 0.2
    if board == "bse":
        return 0.3
    return 0.1


def sina_symbol(symbol: str, code: str) -> str:
    if symbol:
        return symbol
    if code.startswith(("6", "9")):
        return f"sh{code}"
    if code.startswith(("8", "4")):
        return f"bj{code}"
    return f"sz{code}"


def sigmoid(value: float) -> float:
    if value >= 0:
        z = math.exp(-value)
        return 1 / (1 + z)
    z = math.exp(value)
    return z / (1 + z)


def round2(value: float) -> float:
    return round(value + 1e-9, 2)


def clamp(value: float, low: float, high: float) -> float:
    return min(max(value, low), high)


def to_float(value, default: float = 0.0) -> float:
    try:
        if value in (None, "", "-"):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def current_quotes(limit: int = 80):
    query = urllib.parse.urlencode(
        {
            "num": limit,
            "sort": "changepercent",
            "asc": 0,
            "node": "hs_a",
            "symbol": "",
            "_s_r_a": "page",
            "page": 1,
        }
    )
    rows = fetch_json(f"{SINA_MARKET_URL}?{query}")
    if not isinstance(rows, list):
        return []
    output = []
    for row in rows:
        code = str(row.get("code", "")).strip()
        name = str(row.get("name", "")).strip()
        if not code or not name or name[0] in {"N", "C"}:
            continue
        try:
            trade = float(row["trade"])
            settlement = float(row["settlement"])
            high = float(row["high"])
            low = float(row["low"])
            turnover = float(row.get("turnoverratio") or 0)
            amount = float(row.get("amount") or 0)
            change_pct = float(row["changepercent"])
        except (KeyError, TypeError, ValueError):
            continue
        if trade <= 0 or settlement <= 0 or change_pct > 31:
            continue
        output.append(
            {
                "symbol": row.get("symbol", sina_symbol("", code)),
                "code": code,
                "name": name,
                "board": detect_board(code),
                "prevClose": round2(settlement),
                "lastPrice": round2(trade),
                "high": high,
                "low": low,
                "turnover": turnover,
                "amount": amount,
                "changePct": change_pct,
                "limitRate": limit_rate(code, name),
            }
        )
    return output


def kline(symbol: str, days: int = 260):
    query = urllib.parse.urlencode({"symbol": symbol, "scale": 240, "ma": "no", "datalen": days})
    try:
        rows = fetch_json(f"{SINA_KLINE_URL}?{query}")
    except Exception:
        return []
    if not rows:
        return []
    parsed = []
    for row in rows:
        try:
            parsed.append(
                {
                    "day": row["day"],
                    "open": float(row["open"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "close": float(row["close"]),
                    "volume": float(row["volume"]),
                }
            )
        except (KeyError, TypeError, ValueError):
            continue
    return parsed


def feature_from_bar(code: str, name: str, prev_bar: dict, bar: dict, history: list[dict]):
    rate = limit_rate(code, name)
    prev_close = prev_bar["close"]
    change_pct = (bar["close"] / prev_close - 1) * 100
    limit_price = prev_close * (1 + rate)
    distance_pct = (limit_price - bar["close"]) / limit_price * 100
    avg_volume = sum(item["volume"] for item in history[-5:]) / max(len(history[-5:]), 1)
    volume_ratio = bar["volume"] / max(avg_volume, 1)
    daily_range = (bar["high"] - bar["low"]) / max(prev_close, 0.01) * 100
    close_position = (bar["close"] - bar["low"]) / max(bar["high"] - bar["low"], 0.01)
    return [change_pct, -distance_pct, volume_ratio, daily_range, close_position]




def current_quotes_eastmoney(limit: int = 50, fid: str = "f3", page: int = 1):
    params = urllib.parse.urlencode({
        "pn": page, "pz": limit, "po": 1, "np": 1, "fltt": 2, "invt": 2,
        "fid": fid,
        "fs": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048",
        "fields": EASTMONEY_FIELDS,
    })
    try:
        rows = fetch_json(f"{EASTMONEY_QUOTE_URL}?{params}")
    except Exception:
        return []
    raw = rows.get("data", {}).get("diff", []) if isinstance(rows, dict) else rows
    if not isinstance(raw, list):
        return []
    output = []
    for item in raw:
        code = str(item.get("f12", "")).strip()
        name = str(item.get("f14", "")).strip()
        trade = to_float(item.get("f2"))
        change_pct = to_float(item.get("f3"))
        amount = to_float(item.get("f6"))
        volume_ratio = to_float(item.get("f10"))
        turnover = to_float(item.get("f8"))
        high = to_float(item.get("f15"))
        low = to_float(item.get("f16"))
        capital_inflow = to_float(item.get("f184"))
        industry = str(item.get("f100", "") or "").strip()
        if not code or not name or trade <= 0 or name[0] in {"N", "C"} or change_pct > 31:
            continue
        settlement = round(trade / (1 + change_pct / 100), 2)
        if settlement <= 0:
            continue
        if high <= 0:
            high = trade
        if low <= 0:
            low = min(trade, settlement)
        output.append({
            "symbol": f"sz{code}" if code.startswith(("0", "3")) else f"sh{code}" if code.startswith(("6", "9")) else f"bj{code}",
            "code": code, "name": name, "board": detect_board(code),
            "prevClose": settlement, "lastPrice": trade, "high": high,
            "low": low, "turnover": turnover, "changePct": change_pct,
            "volumeRatio": volume_ratio, "capitalInflow": capital_inflow, "amount": amount,
            "industry": industry,
            "limitRate": limit_rate(code, name),
        })
    return output


def prediction_universe(limit: int = 160):
    """Build a forward-looking pool instead of only today's gainers."""
    pools = []
    for fid, page_limit in (("f3", 160), ("f6", 160), ("f10", 120)):
        pools.extend(current_quotes_eastmoney(page_limit, fid=fid))
        time.sleep(0)
    if not pools:
        pools = current_quotes(max(limit, 120))

    seen = {}
    for stock in pools:
        code = stock["code"]
        if code not in seen:
            seen[code] = stock
            continue
        old = seen[code]
        if stock.get("amount", 0) > old.get("amount", 0):
            seen[code] = {**old, **stock}

    candidates = []
    for stock in seen.values():
        if is_forward_candidate(stock):
            candidates.append(stock)

    candidates.sort(
        key=lambda item: (
            item.get("amount", 0),
            item.get("volumeRatio", 0),
            item.get("turnover", 0),
            item.get("changePct", 0),
        ),
        reverse=True,
    )
    return candidates[:limit]


def is_forward_candidate(stock: dict) -> bool:
    """Keep stocks that have not already finished the limit-up move."""
    name = str(stock.get("name", "")).upper()
    if "退市" in name or "ST" in name:
        return False
    prev_close = stock.get("prevClose", 0)
    last_price = stock.get("lastPrice", 0)
    if prev_close <= 0 or last_price <= 0:
        return False
    rate = stock.get("limitRate") or limit_rate(stock.get("code", ""), stock.get("name", ""))
    limit_price = prev_close * (1 + rate)
    distance_pct = (limit_price - last_price) / limit_price * 100
    change_pct = stock.get("changePct", 0)
    turnover = stock.get("turnover", 0)
    volume_ratio = stock.get("volumeRatio", 0)
    amount = stock.get("amount", 0)
    if distance_pct <= 0.8:
        return False
    if change_pct < 1.0:
        return False
    if change_pct >= rate * 100 - 0.6:
        return False
    if amount and amount < 80_000_000:
        return False
    if turnover < 1.5 and volume_ratio < 1.2:
        return False
    return True


def current_features(stock: dict):
    rate = stock["limitRate"]
    prev_close = stock["prevClose"]
    last_price = stock["lastPrice"]
    limit_price = prev_close * (1 + rate)
    distance_pct = (limit_price - last_price) / limit_price * 100
    daily_range = (stock["high"] - stock["low"]) / max(prev_close, 0.01) * 100
    close_position = clamp((last_price - stock["low"]) / max(stock["high"] - stock["low"], 0.01), 0, 1)
    volume_ratio = stock.get("volumeRatio")
    if not isinstance(volume_ratio, (int, float)) or volume_ratio <= 0:
        volume_ratio = stock["turnover"] / 3 + (stock["changePct"] >= 9.8) * 1.2
    volume_ratio = clamp(volume_ratio, 0.6, 5.8)
    return [stock["changePct"], -distance_pct, volume_ratio, daily_range, close_position]


def build_dataset(stocks: list[dict], days: int):
    samples = []
    skipped = []
    for stock in stocks:
        symbol = sina_symbol(stock.get("symbol", ""), stock["code"])
        try:
            bars = kline(symbol, days)
        except Exception as exc:
            skipped.append({"code": stock["code"], "reason": str(exc)})
            continue
        if len(bars) < 40:
            skipped.append({"code": stock["code"], "reason": "history too short"})
            continue
        for index in range(6, len(bars) - 1):
            prev_bar = bars[index - 1]
            bar = bars[index]
            next_bar = bars[index + 1]
            x = feature_from_bar(stock["code"], stock["name"], prev_bar, bar, bars[index - 5 : index])
            next_limit = bar["close"] * (1 + limit_rate(stock["code"], stock["name"]))
            y = 1 if next_bar["high"] >= next_limit * 0.998 else 0
            samples.append({"date": bar["day"], "code": stock["code"], "x": x, "y": y})
        time.sleep(0)
    samples.sort(key=lambda item: item["date"])
    return samples, skipped


def standardize(train_x: list[list[float]], all_x: list[list[float]]):
    size = len(train_x[0])
    means = [sum(row[i] for row in train_x) / len(train_x) for i in range(size)]
    stds = []
    for i in range(size):
        variance = sum((row[i] - means[i]) ** 2 for row in train_x) / len(train_x)
        stds.append(max(math.sqrt(variance), 1e-6))
    scaled = [[(row[i] - means[i]) / stds[i] for i in range(size)] for row in all_x]
    return scaled, means, stds


def train_logistic(samples: list[dict]):
    positives = [i for i, item in enumerate(samples) if item["y"]]
    negatives = [i for i, item in enumerate(samples) if not item["y"]]
    if len(positives) >= 2 and len(negatives) >= 2:
        pos_split = max(1, int(len(positives) * 0.8))
        neg_split = max(1, int(len(negatives) * 0.8))
        train_indices = set(positives[:pos_split] + negatives[:neg_split])
        test_indices = [i for i in range(len(samples)) if i not in train_indices]
        train = [samples[i] for i in range(len(samples)) if i in train_indices]
        test = [samples[i] for i in test_indices] or samples[:]
    else:
        split = max(1, int(len(samples) * 0.8))
        train = samples[:split]
        test = samples[split:] or samples[:]
        train_indices = set(range(len(train)))
    raw_x = [item["x"] for item in samples]
    scaled_x, means, stds = standardize([item["x"] for item in train], raw_x)
    y = [item["y"] for item in samples]
    weights = [0.0] * (len(raw_x[0]) + 1)
    lr = 0.045
    reg = 0.003
    train_rows = [(i, scaled_x[i], y[i]) for i in range(len(samples)) if i in train_indices]
    train_count = len(train_rows)
    train_positives = sum(label for _, _, label in train_rows)
    train_negatives = train_count - train_positives
    positive_weight = clamp(train_negatives / max(train_positives, 1), 1.0, 8.0)
    weight_sum = train_negatives + train_positives * positive_weight
    for _ in range(1200):
        grad = [0.0] * len(weights)
        for _, row, label in train_rows:
            z = weights[0] + sum(weights[i + 1] * row[i] for i in range(len(row)))
            pred = sigmoid(z)
            sample_weight = positive_weight if label else 1.0
            err = (pred - label) * sample_weight
            grad[0] += err
            for i, value in enumerate(row):
                grad[i + 1] += err * value
        for i in range(len(weights)):
            penalty = reg * weights[i] if i else 0
            weights[i] -= lr * (grad[i] / max(weight_sum, 1) + penalty)

    preds = []
    for sample, row in zip(samples, scaled_x):
        z = weights[0] + sum(weights[i + 1] * row[i] for i in range(len(row)))
        preds.append({**sample, "score": sigmoid(z)})

    return {
        "weights": weights,
        "means": means,
        "stds": stds,
        "train": [preds[i] for i in range(len(preds)) if i in train_indices],
        "test": [preds[i] for i in range(len(preds)) if i not in train_indices] or preds,
    }


def hit_rate(rows: list[dict]) -> float:
    if not rows:
        return 0.0
    return sum(row["y"] for row in rows) / len(rows)


def top_hit(rows: list[dict], key, size: int):
    selected = sorted(rows, key=key, reverse=True)[: min(size, len(rows))]
    return {"size": len(selected), "hits": sum(row["y"] for row in selected), "rate": hit_rate(selected)}


def technical_adjustment(stock: dict, raw: list[float]) -> float:
    change_pct, near_limit, volume_ratio, daily_range, close_position = raw
    distance_pct = -near_limit
    rate_pct = float(stock.get("limitRate") or limit_rate(stock.get("code", ""), stock.get("name", ""))) * 100
    ideal_low = 1.2 if rate_pct <= 10 else 2.0
    ideal_high = 4.8 if rate_pct <= 10 else min(9.0, rate_pct * 0.48)
    score = 0.0
    if distance_pct <= 0.8:
        score -= 14
    elif ideal_low <= distance_pct <= ideal_high:
        score += 8
    elif distance_pct <= ideal_high + 3:
        score += 3
    elif distance_pct > rate_pct * 0.72:
        score -= 10
    if close_position >= 0.92:
        score += 7
    elif close_position < 0.68:
        score -= 7
    if 1.5 <= volume_ratio <= 5.2:
        score += 6
    elif volume_ratio > 5.6:
        score -= 2
    if daily_range > 18 and close_position < 0.88:
        score -= 8
    if 2.0 <= change_pct <= rate_pct * 0.72:
        score += 5
    elif change_pct < 1.0:
        score -= 9
    elif change_pct >= rate_pct - 0.6:
        score -= 12
    if stock.get("amount", 0) >= 300_000_000:
        score += 3
    name = str(stock.get("name", "")).upper()
    if "退市" in name or "ST" in name:
        score -= 14
    return score


def score_current(stocks: list[dict], model: dict):
    scored = []
    for stock in stocks:
        raw = current_features(stock)
        scaled = [(raw[i] - model["means"][i]) / model["stds"][i] for i in range(len(raw))]
        z = model["weights"][0] + sum(model["weights"][i + 1] * scaled[i] for i in range(len(scaled)))
        raw_model_score = sigmoid(z) * 100
        rank_score = round(clamp(raw_model_score + technical_adjustment(stock, raw), 1, 99))
        stock = {**stock, "modelScore": rank_score, "rawModelScore": round(raw_model_score, 2)}
        scored.append(stock)
    return sorted(scored, key=lambda item: item["modelScore"], reverse=True)


def train_model():
    stocks = prediction_universe(180)[:32]
    samples, skipped = build_dataset(stocks, 80)
    if len(samples) < 120:
        raise RuntimeError("not enough historical samples")
    model = train_logistic(samples)
    test = model["test"]
    model_top10 = top_hit(test, lambda row: row["score"], 10)
    change_top10 = top_hit(test, lambda row: row["x"][0], 10)
    distance_top10 = top_hit(test, lambda row: row["x"][1], 10)
    base_rate = hit_rate(test)
    scored = score_current(stocks, model)
    return {
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "sampleCount": len(samples),
        "trainCount": len(model["train"]),
        "testCount": len(test),
        "positiveRate": base_rate,
        "metrics": {
            "modelTop10": model_top10,
            "changeTop10": change_top10,
            "distanceTop10": distance_top10,
            "lift": model_top10["rate"] / base_rate if base_rate else 0,
        },
        "weights": {
            "changePct": model["weights"][1],
            "nearLimit": model["weights"][2],
            "volumeRatio": model["weights"][3],
            "dailyRange": model["weights"][4],
            "closePosition": model["weights"][5],
        },
        "skipped": skipped[:8],
        "stocks": scored[:50],
    }



_cache = {"quotes": None, "quotes_ts": 0, "model": None, "model_ts": 0}
_cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")
PREDICTIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "predictions")


def save_predictions(stocks):
    """Save top 10 predictions for today."""
    today = time.strftime("%Y-%m-%d")
    os.makedirs(PREDICTIONS_DIR, exist_ok=True)
    path = os.path.join(PREDICTIONS_DIR, f"{today}.json")
    if os.path.exists(path):
        with open(path) as f:
            existing = json.load(f)
        if existing.get("verified"):
            return
    top10 = sorted(stocks, key=lambda s: float(s.get("modelScore", 0) or 0), reverse=True)[:10]
    record = {
        "date": today,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "predictions": [
            {"code": s["code"], "name": s.get("name", ""), "score": s.get("modelScore", 0),
             "rawScore": s.get("rawModelScore", 0), "price": s.get("lastPrice", 0),
             "board": s.get("board", "")}
            for s in top10
        ],
        "verified": False, "hits": 0, "total": len(top10), "accuracy": 0.0,
    }
    with open(path, "w") as f:
        json.dump(record, f, ensure_ascii=False)


def _latest_unverified_prediction_date():
    today = time.strftime("%Y-%m-%d")
    if not os.path.isdir(PREDICTIONS_DIR):
        return None
    candidates = []
    for fname in sorted(os.listdir(PREDICTIONS_DIR)):
        if not fname.endswith(".json") or fname == "tracking.json":
            continue
        date_str = fname[:-5]
        if date_str >= today:
            continue
        try:
            with open(os.path.join(PREDICTIONS_DIR, fname)) as f:
                rec = json.load(f)
        except Exception:
            continue
        if not rec.get("verified"):
            candidates.append(date_str)
    return candidates[-1] if candidates else None


def _next_bar_after(symbol: str, date_str: str):
    bars = kline(symbol, 12)
    for bar in bars:
        if str(bar.get("day", "")) > date_str:
            return bar
    return None


def verify_predictions(date_str=None):
    """Check if predictions hit limit prices on the next trading day."""
    if date_str is None:
        date_str = _latest_unverified_prediction_date()
        if not date_str:
            return None
    path = os.path.join(PREDICTIONS_DIR, f"{date_str}.json")
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            record = json.load(f)
    except Exception:
        return None
    if record.get("verified"):
        return record
    
    hits = 0
    checked = 0
    for pred in record["predictions"]:
        code = pred["code"]
        symbol = (f"sh{code}" if code.startswith(("6", "9")) else f"sz{code}" if code.startswith(("0", "3")) else f"bj{code}")
        try:
            next_bar = _next_bar_after(symbol, date_str)
            if next_bar:
                rate = limit_rate(code, pred.get("name", ""))
                limit_price = pred["price"] * (1 + rate) if pred.get("price", 0) > 0 else next_bar["close"] * (1 + rate)
                pred["hit"] = bool(next_bar["high"] >= limit_price * 0.997)
                pred["nextHigh"] = round(next_bar["high"], 2)
                pred["limitPrice"] = round(limit_price, 2)
                pred["verifiedDate"] = next_bar.get("day")
                checked += 1
                if pred["hit"]:
                    hits += 1
            else:
                pred["hit"] = None
        except Exception:
            pred["hit"] = None
        time.sleep(0)
    
    record["hits"] = hits
    record["total"] = checked
    acc = round(hits / max(checked, 1), 4)
    record["accuracy"] = acc
    record["verified"] = checked > 0
    if checked > 0:
        record["verifiedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(path, "w") as f:
            json.dump(record, f, ensure_ascii=False)
    except Exception:
        pass
    return record


def get_tracking_summary():
    """Get accuracy summary across all tracked days."""
    os.makedirs(PREDICTIONS_DIR, exist_ok=True)
    days = []
    total_preds = 0
    total_hits = 0
    for fname in sorted(os.listdir(PREDICTIONS_DIR)):
        if not fname.endswith(".json") or fname == "tracking.json":
            continue
        try:
            with open(os.path.join(PREDICTIONS_DIR, fname)) as f:
                rec = json.load(f)
        except Exception:
            continue
        days.append({
            "date": rec["date"], "total": rec["total"],
            "hits": rec["hits"], "accuracy": rec.get("accuracy", 0),
            "verified": rec.get("verified", False),
        })
        total_preds += rec["total"]
        total_hits += rec.get("hits", 0)
    overall_acc = round(total_hits / max(total_preds, 1), 4)
    recent = [d for d in days if d.get("verified")][-5:]
    recent_acc = round(sum(d["accuracy"] for d in recent) / max(len(recent), 1), 4)
    return {
        "totalDays": len(days), "totalPredictions": total_preds,
        "totalHits": total_hits, "overallAccuracy": overall_acc,
        "recentAccuracy": recent_acc,
        "days": days[-10:],
    }


_training_lock = threading.Lock()
_sina_failures = 0
QUOTES_TTL = 180
MODEL_TTL = 900


def _disk_cache(name):
    path = os.path.join(_cache_dir, f"{name}.json")
    if os.path.exists(path):
        try:
            with open(path) as f:
                c = json.load(f)
            return c
        except Exception:
            pass
    return None


def _save_disk(name, data):
    try:
        os.makedirs(_cache_dir, exist_ok=True)
        path = os.path.join(_cache_dir, f"{name}.json")
        with open(path, "w") as f:
            json.dump({"ts": time.time(), "data": data}, f, ensure_ascii=False)
    except Exception:
        pass


def _load_disk_cache(target, name, ttl):
    """Load from disk into memory if memory cache is empty."""
    global _cache
    if not _cache.get(target):
        saved = _disk_cache(name)
        if saved and time.time() - saved["ts"] < ttl * 3:
            _cache[target] = saved["data"]
            _cache[target + "_ts"] = saved["ts"]


def get_cached_quotes():
    now = time.time()
    if _cache["quotes"] and now - _cache["quotes_ts"] < QUOTES_TTL:
        return _cache["quotes"], True
    data = prediction_universe(180)
    if not data:
        raise RuntimeError("行情接口全部不可用，请检查网络")
    _cache["quotes"] = data
    _cache["quotes_ts"] = time.time()
    return data, False


def live_quotes(limit: int = 80):
    data = prediction_universe(limit)
    if data:
        return data
    return current_quotes_eastmoney(min(limit, 80))


def get_cached_model(quotes):
    now = time.time()
    if _cache["model"] and now - _cache["model_ts"] < MODEL_TTL:
        return _cache["model"], True
    stocks = quotes[:12]
    samples, skipped = build_dataset(stocks, 80)
    if len(samples) < 120:
        raise RuntimeError("历史样本不足，无法训练模型")
    result = train_logistic(samples)
    result["skipped"] = skipped[:8]
    _cache["model"] = result
    _cache["model_ts"] = time.time()
    return result, False


def auto_pipeline():
    quotes, quotes_cached = get_cached_quotes()
    model = None
    model_cached = False
    model_error = None
    try:
        model, model_cached = get_cached_model(quotes)
    except Exception as exc:
        model_error = str(exc)
    if model:
        scored = score_current(quotes, model)
        save_predictions(scored)
        test = model.get("test", [])
        train = model.get("train", [])
        model_top10 = top_hit(test, lambda row: row["score"], 10)
        change_top10 = top_hit(test, lambda row: row["x"][0], 10)
        distance_top10 = top_hit(test, lambda row: row["x"][1], 10)
        base_rate = hit_rate(test)
        return {
            "stocks": scored[:50],
            "hasModel": True,
            "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "quotesCached": quotes_cached,
            "modelCached": model_cached,
            "sampleCount": len(train) + len(test),
            "trainCount": len(train),
            "testCount": len(test),
            "positiveRate": base_rate,
            "metrics": {
                "modelTop10": model_top10,
                "changeTop10": change_top10,
                "distanceTop10": distance_top10,
                "lift": model_top10["rate"] / base_rate if base_rate else 0,
            },
            "weights": {
                "changePct": model["weights"][1],
                "nearLimit": model["weights"][2],
                "volumeRatio": model["weights"][3],
                "dailyRange": model["weights"][4],
                "closePosition": model["weights"][5],
            },
            "skipped": model.get("skipped", []),
        }
    return {
        "stocks": quotes[:50],
        "hasModel": False,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "quotesCached": quotes_cached,
        "modelCached": False,
        "modelError": model_error,
    }




# Industry chain definitions - institutional grade mapping
# Each chain has upstream -> midstream -> downstream layers with segments

INDUSTRY_CHAINS = {
    "AI产业链": {
        "desc": "芯片·算力·模型·应用",
        "hotTopic": "英伟达Rubin架构推进，1.6T光模块需求爆发，HBM4先进封装产能紧缺",
        "layers": [
            {"name": "上游·芯片基建",
             "segments": [
                 {"name": "GPU/AI芯片", "codes": ["688256","688041","300474","688099","300223"]},
                 {"name": "先进封装", "codes": ["600584","002156","002185","300604","688262"]},
                 {"name": "HBM/存储", "codes": ["603986","300223","688110","688728"]},
                 {"name": "EDA/IP", "codes": ["301269","688206","688508"]},
             ]},
            {"name": "中游·算力网络",
             "segments": [
                 {"name": "光模块", "codes": ["300308","300502","300394","002281","688205"]},
                 {"name": "高速PCB", "codes": ["002913","002916","300476","603228"]},
                 {"name": "服务器", "codes": ["601138","000977","603019","688041"]},
                 {"name": "散热/液冷", "codes": ["002837","300499","688305","600185"]},
                 {"name": "数据中心", "codes": ["300383","600845","603881","688158"]},
             ]},
            {"name": "下游·场景应用",
             "segments": [
                 {"name": "大模型", "codes": ["002230","300624","688111"]},
                 {"name": "AI+办公", "codes": ["688111","300624","300364"]},
                 {"name": "AI+金融", "codes": ["600570","300033","300059"]},
                 {"name": "AI+医疗", "codes": ["300015","300253","600718"]},
                 {"name": "AI+汽车", "codes": ["300496","002920","002405"]},
                 {"name": "AI+机器人", "codes": ["002747","688017","300124","002230"]},
             ]},
        ]
    },
    "新能源汽车": {
        "desc": "锂矿·电池·材料·整车·智能驾驶",
        "hotTopic": "固态电池突破在即，智能驾驶L3加速落地，出海+以旧换新政策",
        "layers": [
            {"name": "上游·矿产资源",
             "segments": [
                 {"name": "锂矿", "codes": ["002460","002466","002756","300750"]},
                 {"name": "钴镍", "codes": ["603799","300618","002340"]},
                 {"name": "稀土永磁", "codes": ["600111","000970","600392","300748"]},
             ]},
            {"name": "中游·电池材料",
             "segments": [
                 {"name": "电池", "codes": ["300750","300014","002074","300450"]},
                 {"name": "正极材料", "codes": ["688005","300073","688275"]},
                 {"name": "负极材料", "codes": ["603659","600884","835185"]},
                 {"name": "电解液", "codes": ["002709","300037"]},
                 {"name": "隔膜", "codes": ["002812","300568"]},
                 {"name": "结构件", "codes": ["002850"]},
             ]},
            {"name": "下游·整车零部件",
             "segments": [
                 {"name": "整车", "codes": ["002594","601633","600104","000625"]},
                 {"name": "热管理", "codes": ["002050","002126"]},
                 {"name": "智能驾驶", "codes": ["002920","300496","603786"]},
                 {"name": "一体化压铸", "codes": ["002547","603348","600933"]},
                 {"name": "充电桩", "codes": ["300001","300693","002276"]},
             ]},
        ]
    },
    "半导体": {
        "desc": "设备·材料·制造·封测·芯片设计",
        "hotTopic": "国产替代加速，先进制程突破，AI推理芯片需求爆发",
        "layers": [
            {"name": "上游·设备材料",
             "segments": [
                 {"name": "刻蚀/薄膜", "codes": ["002371","688012","688072"]},
                 {"name": "检测/清洗", "codes": ["688200","300604","300567"]},
                 {"name": "硅片/气体", "codes": ["688126","600703","002409"]},
                 {"name": "光刻胶/试剂", "codes": ["300655","002643","300236"]},
             ]},
            {"name": "中游·制造封测",
             "segments": [
                 {"name": "晶圆制造", "codes": ["688981","688347","600667"]},
                 {"name": "封测", "codes": ["600584","002156","002185","688362"]},
                 {"name": "IP设计服务", "codes": ["688521","300613"]},
             ]},
            {"name": "下游·芯片设计",
             "segments": [
                 {"name": "CPU/GPU", "codes": ["688041","688256","603893"]},
                 {"name": "存储/MCU", "codes": ["603986","300223","300327"]},
                 {"name": "模拟芯片", "codes": ["300661","688536","688052"]},
                 {"name": "射频/连接", "codes": ["300782","002475","300115"]},
                 {"name": "CIS/图像", "codes": ["603501","688498"]},
                 {"name": "FPGA", "codes": ["688385","688107"]},
             ]},
        ]
    },
    "光伏储能": {
        "desc": "硅料·硅片·电池·组件·逆变器·储能",
        "hotTopic": "产能出清接近尾声，BC/HJT技术迭代，中东+美国储能需求爆发",
        "layers": [
            {"name": "上游·材料设备",
             "segments": [
                 {"name": "硅料", "codes": ["600438","688303","688599"]},
                 {"name": "硅片/拉晶", "codes": ["601012","002129","600481"]},
                 {"name": "光伏设备", "codes": ["300316","300450","688556"]},
             ]},
            {"name": "中游·电池组件",
             "segments": [
                 {"name": "电池片", "codes": ["600732","002865","600438"]},
                 {"name": "组件", "codes": ["002459","688599","688223","601012"]},
                 {"name": "胶膜/玻璃", "codes": ["603806","601865","688560"]},
                 {"name": "背板/焊带", "codes": ["300393","603212"]},
             ]},
            {"name": "下游·系统集成",
             "segments": [
                 {"name": "逆变器", "codes": ["300274","300763","688390"]},
                 {"name": "电站运营", "codes": ["600905","601877","600886"]},
                 {"name": "储能系统", "codes": ["300274","300750","300693","688063"]},
             ]},
        ]
    },
    "消费电子": {
        "desc": "手机链·MR/VR·智能穿戴·IoT",
        "hotTopic": "苹果Vision Pro量产带动供应链，AI手机换机周期开启",
        "layers": [
            {"name": "上游·核心零部件",
             "segments": [
                 {"name": "面板", "codes": ["000725","000100","002387"]},
                 {"name": "摄像头模组", "codes": ["002475","002241","300433"]},
                 {"name": "声学/马达", "codes": ["002241","002600","300136"]},
                 {"name": "连接器", "codes": ["002475","300136","603005"]},
             ]},
            {"name": "中游·组装制造",
             "segments": [
                 {"name": "EMS代工", "codes": ["002475","601138","002241"]},
                 {"name": "精密结构件", "codes": ["300433","002600","300115"]},
                 {"name": "PCB/FPC", "codes": ["002384","300476","600183"]},
             ]},
            {"name": "下游·终端品牌",
             "segments": [
                 {"name": "MR/VR", "codes": ["002241","300433","300115"]},
                 {"name": "智能穿戴", "codes": ["002241","300115","002475"]},
                 {"name": "IoT芯片", "codes": ["603986","300327","300456"]},
             ]},
        ]
    },
    "医药生物": {
        "desc": "创新药·CXO·器械·医疗服务",
        "hotTopic": "GLP-1减肥药爆发，创新药出海里程碑，医疗设备更新改造",
        "layers": [
            {"name": "上游·研发外包",
             "segments": [
                 {"name": "CXO", "codes": ["603259","300347","300759","002821"]},
                 {"name": "生命科学", "codes": ["300529","300244","688101"]},
             ]},
            {"name": "中游·药品器械",
             "segments": [
                 {"name": "创新药", "codes": ["600276","300122","688180","002317"]},
                 {"name": "中药", "codes": ["600436","000538","600085","600332"]},
                 {"name": "医疗器械", "codes": ["300760","300003","688271","300633"]},
             ]},
            {"name": "下游·医疗服务",
             "segments": [
                 {"name": "医疗服务", "codes": ["300015","600763","002044","301267"]},
                 {"name": "医药商业", "codes": ["601607","000028","603939"]},
             ]},
        ]
    },
    "军工航天": {
        "desc": "主机厂·发动机·电子·材料",
        "hotTopic": "C919量产加速，军品订单恢复，商业航天元年",
        "layers": [
            {"name": "上游·材料器件",
             "segments": [
                 {"name": "高温合金", "codes": ["600456","002149","600399"]},
                 {"name": "钛合金", "codes": ["600456","002149","000962"]},
                 {"name": "碳纤维", "codes": ["600862","300699","000547"]},
             ]},
            {"name": "中游·分系统",
             "segments": [
                 {"name": "航空发动机", "codes": ["600893","600391","000738"]},
                 {"name": "航电系统", "codes": ["600118","002179","600879"]},
                 {"name": "雷达/电子", "codes": ["002179","600879","600990"]},
             ]},
            {"name": "下游·总装集成",
             "segments": [
                 {"name": "战斗机", "codes": ["600760","000768"]},
                 {"name": "运输机/C919", "codes": ["600862","000768","600118"]},
                 {"name": "船舶/火箭", "codes": ["600150","600893","600118"]},
             ]},
        ]
    },
    "金融地产": {
        "desc": "银行·证券·保险·地产",
        "hotTopic": "降准降息预期，化债推进，券商并购重组",
        "layers": [
            {"name": "银行",
             "segments": [
                 {"name": "国有大行", "codes": ["601398","601939","601288","601988"]},
                 {"name": "股份行", "codes": ["600036","601166","600016"]},
                 {"name": "城商行", "codes": ["002142","601009","600919"]},
             ]},
            {"name": "非银金融",
             "segments": [
                 {"name": "券商", "codes": ["600030","601211","601688","600837"]},
                 {"name": "保险", "codes": ["601318","601628","601601","601336"]},
                 {"name": "金融科技", "codes": ["600570","300033","300059"]},
             ]},
            {"name": "地产基建",
             "segments": [
                 {"name": "地产开发", "codes": ["000002","001979","600048","600383"]},
                 {"name": "建筑工程", "codes": ["601668","601390","601186","600170"]},
             ]},
        ]
    },
    "消费复苏": {
        "desc": "白酒·食品·旅游·免税·电商",
        "hotTopic": "消费刺激政策加码，端午假期消费复苏，跨境电商出海",
        "layers": [
            {"name": "白酒饮品",
             "segments": [
                 {"name": "高端白酒", "codes": ["600519","000858","000568"]},
                 {"name": "次高端白酒", "codes": ["002304","600809","603369","000596"]},
                 {"name": "啤酒/饮料", "codes": ["600600","000729","002568"]},
             ]},
            {"name": "食品农业",
             "segments": [
                 {"name": "调味品", "codes": ["603288","600882","002507"]},
                 {"name": "乳品", "codes": ["600887","002714","002311"]},
                 {"name": "预制菜", "codes": ["002568","603345","002847"]},
             ]},
            {"name": "消费服务",
             "segments": [
                 {"name": "免税零售", "codes": ["601888","600859","002251"]},
                 {"name": "旅游酒店", "codes": ["000888","600754","301073"]},
                 {"name": "跨境电商", "codes": ["002640","301558","300792"]},
                 {"name": "医美", "codes": ["000963","300896","600763"]},
             ]},
        ]
    },
}

def batch_quotes(codes: list[str]):
    """Fetch real-time quotes for specific stocks via Sina batch API."""
    symbols = []
    for c in codes:
        if c.startswith(("6", "9")):
            symbols.append(f"sh{c}")
        elif c.startswith(("0", "3")):
            symbols.append(f"sz{c}")
        elif c.startswith(("8", "4")):
            symbols.append(f"bj{c}")
        else:
            symbols.append(f"sz{c}")
    url = "https://hq.sinajs.cn/list=" + ",".join(symbols)
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://finance.sina.com.cn",
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            raw = resp.read().decode("gbk", errors="ignore")
    except Exception:
        return {}
    result = {}
    for line in raw.split("\n"):
        line = line.strip()
        if not line or not line.startswith("var hq_str_"):
            continue
        try:
            # Parse: var hq_str_CODE="fields..."
            eq_pos = line.index("=")
            code_var = line[:eq_pos]
            code = code_var.replace("var hq_str_", "").strip()
            if code.startswith(("sh", "sz", "bj")):
                code = code[2:]
            quoted = line[eq_pos + 1:]
            if quoted.startswith('"') and quoted.endswith('";'):
                quoted = quoted[1:-2]
            elif quoted.startswith('"'):
                quoted = quoted[1:]
            fields = quoted.split(",")
            name = fields[0]
            prev_close = float(fields[2]) if fields[2] else 0
            price = float(fields[3]) if fields[3] else 0
            high = float(fields[4]) if fields[4] else 0
            low = float(fields[5]) if fields[5] else 0
            vol = float(fields[8]) if len(fields) > 8 and fields[8] else 0
            if prev_close <= 0:
                continue
            change_pct = round((price - prev_close) / prev_close * 100, 2)
            result[code] = {
                "code": code, "name": name, "price": price,
                "changePct": change_pct, "prevClose": prev_close,
                "high": high, "low": low, "volume": int(vol),
            }
        except (IndexError, ValueError, AttributeError):
            continue
    return result


def chain_analysis():
    """Build detailed industry chain data with layers and segments."""
    all_codes = []
    for chain in INDUSTRY_CHAINS.values():
        for layer in chain["layers"]:
            for seg in layer["segments"]:
                all_codes.extend(seg["codes"])
    quotes = batch_quotes(list(set(all_codes)))
    chains = []
    for chain_name, chain_info in INDUSTRY_CHAINS.items():
        layers_data = []
        for layer in chain_info["layers"]:
            segments_data = []
            for seg in layer["segments"]:
                stocks = []
                for code in seg["codes"]:
                    q = quotes.get(code)
                    if q:
                        stocks.append(q)
                if stocks:
                    seg_avg = round(sum(s["changePct"] for s in stocks) / len(stocks), 2)
                    segments_data.append({
                        "name": seg["name"],
                        "stocks": stocks,
                        "avgChange": seg_avg,
                    })
            if segments_data:
                all_s = [s for seg in segments_data for s in seg["stocks"]]
                layer_avg = round(sum(s["changePct"] for s in all_s) / len(all_s), 2) if all_s else 0
                layers_data.append({
                    "name": layer["name"],
                    "segments": segments_data,
                    "avgChange": layer_avg,
                    "positive": sum(1 for s in all_s if s["changePct"] > 0),
                    "total": len(all_s),
                })
        if layers_data:
            chains.append({
                "name": chain_name, "desc": chain_info["desc"],
                "hotTopic": chain_info.get("hotTopic", ""),
                "layers": layers_data,
            })
    return {"chains": chains, "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S")}

def concept_search(keyword):
    """Search INDUSTRY_CHAINS by keyword. Supports English+Chinese compound keywords."""
    def _score(k, cname, layer, seg, cinfo):
        scores = []
        scores.append(3 if k in cname.lower() else 0)
        scores.append(2 if k in layer["name"].lower() else 0)
        scores.append(2 if k in seg["name"].lower() else 0)
        scores.append(1 if k in cinfo.get("desc", "").lower() else 0)
        scores.append(1 if k in cinfo.get("hotTopic", "").lower() else 0)
        return max(scores)

    def _fragment_search(k):
        results, seen = [], set()
        for cname, cinfo in INDUSTRY_CHAINS.items():
            matched = []
            for layer in cinfo["layers"]:
                for seg in layer["segments"]:
                    if _score(k, cname, layer, seg, cinfo) > 0:
                        matched.append(seg)
                        for code in seg["codes"]:
                            seen.add(code)
            if matched:
                results.append({
                    "name": cname,
                    "desc": cinfo["desc"],
                    "hotTopic": cinfo.get("hotTopic", ""),
                    "segments": [{"name": s["name"], "codes": s["codes"]} for s in matched],
                })
        return results, seen

    # Build known-name index once (lazy init)
    if not hasattr(concept_search, '_known_idx'):
        idx = set()
        for cname, cinfo in INDUSTRY_CHAINS.items():
            idx.add(cname.lower())
            for layer in cinfo["layers"]:
                idx.add(layer["name"].lower())
                for seg in layer["segments"]:
                    idx.add(seg["name"].lower())
            idx.add(cinfo.get("desc", "").lower())
            idx.add(cinfo.get("hotTopic", "").lower())
        concept_search._known_idx = idx

    def _tokenize(kw):
        import re
        tokens = set()
        eng = re.findall(r'[a-zA-Z]+', kw)
        tokens.update(eng)
        cn = re.sub(r'[a-zA-Z\s]+', '', kw)
        if len(cn) >= 2:
            tokens.add(cn)
            for known in concept_search._known_idx:
                if len(known) >= 2 and known in cn and known not in tokens:
                    tokens.add(known)
            if len(cn) >= 4:
                for i in range(len(cn) - 1):
                    tokens.add(cn[i:i+2])
        return list(tokens)

    kw = keyword.lower().strip()
    results, seen_codes = _fragment_search(kw)

    # Keyword alias mapping for common terms not in chain names
    _KW_ALIASES = {
        "低空": "军工航天", "低空经济": "军工航天",
        "机器人": "机器人", "氢能": "氢能", "人工智能": "人工智能",
    }
    
    # Try alias matching before giving up
    if not results:
        alias = _KW_ALIASES.get(kw)
        if alias:
            results, seen_codes = _fragment_search(alias)
    if not results:
        fragments = [f for f in _tokenize(kw) if len(f) >= 2]
        if len(fragments) >= 2:
            frag_matches = {}
            all_sc = set()
            for frag in fragments:
                r, s = _fragment_search(frag)
                for cd in r:
                    name = cd["name"]
                    if name not in frag_matches:
                        frag_matches[name] = {"frags": set(), "data": cd}
                    else:
                        # Merge segments from all fragment matches
                        existing_seg_names = {sg["name"] for sg in frag_matches[name]["data"]["segments"]}
                        for sg in cd["segments"]:
                            if sg["name"] not in existing_seg_names:
                                frag_matches[name]["data"]["segments"].append(sg)
                                existing_seg_names.add(sg["name"])
                    frag_matches[name]["frags"].add(frag)
                all_sc.update(s)
            seen_codes.update(all_sc)
            # Require at least min(2, total_fragments) fragment matches
            total_frags = len(fragments)
            min_required = 2 if total_frags >= 2 else 1
            filtered = {n: v for n, v in frag_matches.items() if len(v["frags"]) >= min_required}
            results = [c["data"] for c in sorted(filtered.values(),
                                                  key=lambda x: -len(x["frags"]))]
        else:
            for frag in fragments:
                r, s = _fragment_search(frag)
                results.extend(r)
                seen_codes.update(s)
            seen_names = set()
            deduped = []
            for r in results:
                if r["name"] not in seen_names:
                    seen_names.add(r["name"])
                    deduped.append(r)
            results = deduped

    if not results:
        return {"chains": [], "keyword": keyword,
                "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S")}

    quotes = batch_quotes(list(seen_codes))
    for chain in results:
        for seg in chain["segments"]:
            seg["stocks"] = [quotes.get(code) for code in seg["codes"] if quotes.get(code)]
    return {"chains": results, "keyword": keyword,
            "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S")}



class Handler(SimpleHTTPRequestHandler):
    def send_json(self, payload, status: int = 200):
        try:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as _e:
            import sys, traceback
            print(f"[send_json error]", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)


    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/current":
            try:
                quotes, cached = get_cached_quotes()
                self.send_json({
                    "stocks": quotes,
                    "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "cached": cached,
                })
            except Exception as exc:
                self.send_json({"error": str(exc)}, 502)
            return
        if parsed.path == "/api/train":
            try:
                self.send_json(train_model())
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return
        if parsed.path == "/api/train/feedback":
            try:
                self.send_json(feedback_corrected_train())
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return

        if parsed.path == "/api/auto":
            try:
                self.send_json(auto_pipeline())
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return
        if parsed.path == "/api/status":
            self.send_json({
                "quotesCached": _cache["quotes"] is not None,
                "quotesAge": int(time.time() - _cache["quotes_ts"]) if _cache["quotes_ts"] else None,
                "modelCached": _cache["model"] is not None,
                "modelAge": int(time.time() - _cache["model_ts"]) if _cache["model_ts"] else None,
            })
            return
        if parsed.path == "/api/track":
            verify_predictions()
            self.send_json(get_tracking_summary())
            return

            verify_predictions()
        if parsed.path == "/api/track/detail":
            try:
                verify_predictions()
                self.send_json(get_track_detail())
            except Exception as exc:
                self.send_json({"error": str(exc), "hasData": False}, 500)
            return

            self.send_json(get_tracking_summary())
            return
        if parsed.path == "/api/health":
            now = time.time()
            self.send_json({
                "status": "ok",
                "uptime": int(now - _cache["quotes_ts"]) if _cache["quotes_ts"] else None,
                "quotes": {
                    "cached": _cache["quotes"] is not None,
                    "age": int(now - _cache["quotes_ts"]) if _cache["quotes_ts"] else None,
                    "count": len(_cache["quotes"]) if _cache["quotes"] else 0,
                },
                "model": {
                    "cached": _cache["model"] is not None,
                    "age": int(now - _cache["model_ts"]) if _cache["model_ts"] else None,
                },
                "sinaFailures": _sina_failures,
                "diskCache": os.path.isdir(_cache_dir),
            })
            return
        if parsed.path == "/api/chains":
            try:
                self.send_json(chain_analysis())
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return
        if parsed.path == "/api/concept":
            try:
                params = urllib.parse.parse_qs(parsed.query)
                keyword = params.get("keyword", [""])[0]
                self.send_json(concept_search(keyword))
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return

        if parsed.path == "/api/trades":
            try:
                params = urllib.parse.parse_qs(parsed.query)
                self.send_json(handle_trades_get(params))
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return

        try:
            return super().do_GET()
        except Exception as exc:
            import sys; print(f"[do_GET fallback] {exc}", file=sys.stderr)
            self.send_json({"error": "not found"}, 404)




    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/trades":
            try:
                params = urllib.parse.parse_qs(parsed.query)
                result = handle_trades_delete(params)
                if isinstance(result, tuple):
                    self.send_json(result[0], result[1])
                else:
                    self.send_json(result)
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return
        self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/trades":
            try:
                length = int(self.headers.get("Content-Length", 0))
                raw = self.rfile.read(length).decode("utf-8")
                body = json.loads(raw)
                result = handle_trades_post(body)
                if isinstance(result, tuple):
                    self.send_json(result[0], result[1])
                else:
                    self.send_json(result)
            except Exception as exc:
                self.send_json({"error": str(exc)}, 500)
            return
        self.send_json({"error": "not found"}, 404)





TRADES_FILE = os.path.join(_cache_dir, "trades.json")

def _load_trades():
    if not os.path.exists(TRADES_FILE):
        return []
    with open(TRADES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_trades(trades):
    os.makedirs(os.path.dirname(TRADES_FILE), exist_ok=True)
    with open(TRADES_FILE, "w", encoding="utf-8") as f:
        json.dump(trades, f, ensure_ascii=False, indent=2)

def _trades_stats(trades):
    """统计盈亏数据，重点关注亏损模式"""
    total_trades = len(trades)
    if total_trades == 0:
        return {
            "totalTrades": 0, "winTrades": 0, "lossTrades": 0,
            "winRate": 0, "totalPnl": 0, "maxLoss": 0,
            "byConcept": {}, "byMonth": {}, "lossReasons": {},
        }

    closed = [t for t in trades if t.get("closePrice") and t.get("closeDate")]
    if not closed:
        return {
            "totalTrades": total_trades, "winTrades": 0, "lossTrades": 0,
            "winRate": 0, "totalPnl": 0, "maxLoss": 0,
            "byConcept": {}, "byMonth": {}, "lossReasons": {},
        }

    win = 0
    loss = 0
    total_pnl = 0.0
    max_loss = 0.0
    by_concept = {}
    by_month = {}
    loss_reasons = {}

    for t in closed:
        qty = t.get("quantity", 0)
        buy_price = t.get("buyPrice", 0)
        close_price = t.get("closePrice", 0)
        pnl = round((close_price - buy_price) * qty, 2)
        total_pnl += pnl
        if pnl >= 0:
            win += 1
        else:
            loss += 1
            if pnl < max_loss:
                max_loss = pnl
            # 亏损原因统计
            reason = t.get("closeReason", "未记录")
            loss_reasons[reason] = loss_reasons.get(reason, 0) + 1

        # 按概念统计
        concept = t.get("concept", "未分类")
        if concept not in by_concept:
            by_concept[concept] = {"trades": 0, "wins": 0, "losses": 0, "pnl": 0.0}
        by_concept[concept]["trades"] += 1
        by_concept[concept]["pnl"] += pnl
        if pnl >= 0:
            by_concept[concept]["wins"] += 1
        else:
            by_concept[concept]["losses"] += 1

        # 按月统计
        month = t.get("closeDate", "")[:7]  # "2026-06"
        if month < "2020-01":
            month = t.get("buyDate", "")[:7]
        if month not in by_month:
            by_month[month] = {"trades": 0, "wins": 0, "losses": 0, "pnl": 0.0}
        by_month[month]["trades"] += 1
        by_month[month]["pnl"] += pnl
        if pnl >= 0:
            by_month[month]["wins"] += 1
        else:
            by_month[month]["losses"] += 1

    # 格式化输出
    win_rate = round(win / len(closed) * 100, 1) if closed else 0

    # 按亏损金额排序亏损原因
    sorted_loss_reasons = dict(sorted(loss_reasons.items(), key=lambda x: x[1], reverse=True))

    return {
        "totalTrades": total_trades,
        "closedTrades": len(closed),
        "winTrades": win,
        "lossTrades": loss,
        "winRate": win_rate,
        "totalPnl": round(total_pnl, 2),
        "maxLoss": round(max_loss, 2),
        "byConcept": by_concept,
        "byMonth": by_month,
        "lossReasons": sorted_loss_reasons,
    }

def handle_trades_get(params):
    trades = _load_trades()
    action = params.get("action", [""])[0]
    if action == "stats":
        return _trades_stats(trades)
    # 默认返回全部交易记录（按时间倒序）
    trades.reverse()
    return {"trades": trades, "total": len(trades)}

def handle_trades_post(body):
    trades = _load_trades()
    if "id" in body and body["id"]:
        # 更新已有记录
        for i, t in enumerate(trades):
            if t.get("id") == body["id"]:
                trades[i] = body
                _save_trades(trades)
                return {"ok": True, "id": body["id"]}
        return {"error": "未找到该记录"}, 404
    else:
        # 新增记录
        import uuid
        body["id"] = str(uuid.uuid4())[:8]
        body["createdAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
        trades.append(body)
        _save_trades(trades)
        return {"ok": True, "id": body["id"]}

def handle_trades_delete(params):
    tid = params.get("id", [""])[0]
    if not tid:
        return {"error": "缺少 id"}, 400
    trades = _load_trades()
    trades = [t for t in trades if t.get("id") != tid]
    _save_trades(trades)
    return {"ok": True}
def get_track_detail():
    """返回最新的预测验证详情，包括每条预测的个股表现"""
    os.makedirs(PREDICTIONS_DIR, exist_ok=True)
    # 取最近有 verified 的记录
    records = []
    for fname in sorted(os.listdir(PREDICTIONS_DIR)):
        if not fname.endswith(".json") or fname == "tracking.json":
            continue
        try:
            with open(os.path.join(PREDICTIONS_DIR, fname)) as f:
                rec = json.load(f)
            if rec.get("verified"):
                records.append(rec)
        except Exception:
            continue
    
    if not records:
        return {"hasData": False, "message": "暂无已验证的预测记录，请先训练模型"}
    
    latest = records[-1]
    predictions = latest.get("predictions", [])
    
    # 对每条预测补充分析
    analyzed = []
    for pred in predictions:
        hit = pred.get("hit")
        next_high = pred.get("nextHigh")
        limit_price = pred.get("limitPrice")
        price = pred.get("price", 0)
        
        # 估算涨幅
        if next_high and price and price > 0:
            actual_pct = round((next_high - price) / price * 100, 2)
        else:
            actual_pct = None
        
        analyzed.append({
            "code": pred.get("code", ""),
            "name": pred.get("name", ""),
            "score": pred.get("score", 0),
            "predictedPrice": round(price, 2) if price else None,
            "limitPrice": round(limit_price, 2) if limit_price else None,
            "nextHigh": round(next_high, 2) if next_high else None,
            "actualPct": actual_pct,
            "hit": hit,
            "board": pred.get("board", ""),
        })
    
    # 按分数降序排列
    analyzed.sort(key=lambda x: float(x.get("score", 0) or 0), reverse=True)
    
    hits = sum(1 for a in analyzed if a.get("hit"))
    total = len(analyzed)
    
    return {
        "hasData": True,
        "date": latest.get("date", ""),
        "generatedAt": latest.get("generatedAt", ""),
        "verifiedAt": latest.get("verifiedAt", ""),
        "totalPredictions": total,
        "hits": hits,
        "accuracy": round(hits / max(total, 1), 4),
        "predictions": analyzed,
        "message": None,
    }
def collect_feedback():
    """读取昨天已验证的预测结果，返回反馈样本（预测错误的数据）"""
    verify_predictions()  # 确保昨天的预测已验证
    os.makedirs(PREDICTIONS_DIR, exist_ok=True)
    
    feedback = {"falsePositives": 0, "falseNegatives": 0, "samples": []}
    
    # 找最近有 verified 的记录
    records = []
    for fname in sorted(os.listdir(PREDICTIONS_DIR)):
        if not fname.endswith(".json") or fname == "tracking.json":
            continue
        try:
            with open(os.path.join(PREDICTIONS_DIR, fname)) as f:
                rec = json.load(f)
            if rec.get("verified"):
                records.append(rec)
        except Exception:
            continue
    
    if not records:
        return feedback
    
    # 取最新的2条已验证记录（昨天和前天）
    recent = records[-2:]
    for rec in recent:
        for pred in rec.get("predictions", []):
            hit = pred.get("hit")
            score = float(pred.get("score", 0) or 0)
            name = pred.get("name", "")
            code = pred.get("code", "")
            
            if hit is None:
                continue
                
            # 评分高但没涨停 → 假阳性（false positive）
            # 评分低但涨停了 → 假阴性（false negative）
            if hit is False and score >= 60:
                feedback["falsePositives"] += 1
                feedback["samples"].append({
                    "code": code,
                    "name": name,
                    "score": score,
                    "error": "false_positive",
                    "date": rec.get("date", ""),
                    "weight": 1.5,  # 错误样本加权
                })
            elif hit is True and score < 45:
                feedback["falseNegatives"] += 1
                feedback["samples"].append({
                    "code": code,
                    "name": name,
                    "score": score,
                    "error": "false_negative",
                    "date": rec.get("date", ""),
                    "weight": 2.0,  # 漏掉的涨停更珍贵
                })
    
    return feedback


def feedback_corrected_train():
    """在标准训练后，用反馈样本做二次校正（自动控制中的误差反馈）"""
    # 第一步: 正常训练
    stocks = live_quotes(80)[:24]
    samples, skipped = build_dataset(stocks, 80)
    if len(samples) < 120:
        raise RuntimeError("not enough historical samples")
    
    base_model = train_logistic(samples)
    feedback = collect_feedback()
    
    if feedback["falsePositives"] + feedback["falseNegatives"] == 0:
        test = base_model["test"]
        top10 = top_hit(test, lambda row: row["score"], 10)
        scored = score_current(stocks, base_model)
        return {
            "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "method": "base (no feedback)",
            "samples": len(samples),
            "top10_hit_rate": top10["rate"],
            "baseRate": hit_rate(test),
            "feedbackApplied": False,
            "model": base_model,
        }
    
    feedback_samples = []
    codes_to_fetch = [s["code"] for s in feedback["samples"]]
    
    if codes_to_fetch:
        quotes = batch_quotes(codes_to_fetch)
        for f_sample in feedback["samples"]:
            code = f_sample["code"]
            match = quotes.get(code) if isinstance(quotes, dict) else None
            if not match:
                continue
            match["lastPrice"] = match.get("price", match.get("lastPrice", 0))
            match["limitRate"] = limit_rate(match.get("code", ""), match.get("name", ""))
            match["turnover"] = match.get("turnover", match.get("volume", 0) / 1e6)
            feats = current_features(match)
            if not feats:
                continue
            if f_sample["error"] == "false_positive":
                label = 0
                weight = 1.5
            else:
                label = 1
                weight = 2.0
            feedback_samples.append({
                "x": feats, "y": label, "weight": weight,
                "code": code, "name": f_sample["name"],
                "error_type": f_sample["error"],
            })
    
    if not feedback_samples:
        test = base_model["test"]
        top10 = top_hit(test, lambda row: row["score"], 10)
        scored = score_current(stocks, base_model)
        return {
            "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "method": "base (no quote data)",
            "samples": len(samples),
            "top10_hit_rate": top10["rate"],
            "baseRate": hit_rate(test),
            "feedbackApplied": False,
            "feedback": {"samples": len(feedback_samples), "fp": feedback["falsePositives"], "fn": feedback["falseNegatives"]},
            "model": base_model,
        }
    
    corrected_samples = list(samples)
    corrected_samples.extend(feedback_samples)
    raw_x = [item["x"] for item in corrected_samples]
    all_scaled_x, means, stds = standardize([item["x"] for item in corrected_samples], raw_x)
    y = [item["y"] for item in corrected_samples]
    weights = list(base_model["weights"])
    lr = 0.03
    reg = 0.001
    n = len(corrected_samples)
    for _ in range(300):
        grad = [0.0] * len(weights)
        for row, label, sample in zip(all_scaled_x, y, corrected_samples):
            w = sample.get("weight", 1.0)
            z = weights[0] + sum(weights[i + 1] * row[i] for i in range(len(row)))
            pred = sigmoid(z)
            err = (pred - label) * w
            grad[0] += err
            for i, value in enumerate(row):
                grad[i + 1] += err * value
        for i in range(len(weights)):
            penalty = reg * weights[i] if i else 0
            weights[i] -= lr * (grad[i] / n + penalty)
    
    corrected_model = {"weights": weights, "means": means, "stds": stds, "train": [], "test": []}
    scored = score_current(stocks, corrected_model)
    split = max(1, int(len(corrected_samples) * 0.8))
    test_samples = corrected_samples[split:]
    if test_samples:
        test_x = [[(item["x"][i] - means[i]) / max(stds[i], 1e-8) for i in range(len(item["x"]))] for item in test_samples]
        test_preds = []
        for sample, row in zip(test_samples, test_x):
            z = weights[0] + sum(weights[i + 1] * row[i] for i in range(len(row)))
            test_preds.append({**sample, "score": sigmoid(z)})
        corrected_top10 = top_hit(test_preds, lambda row: row["score"], 10)
    else:
        corrected_top10 = {"size": 0, "hits": 0, "rate": 0}
    
    return {
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "method": "feedback_corrected",
        "samples": len(samples),
        "feedbackSamples": len(feedback_samples),
        "falsePositives": feedback["falsePositives"],
        "falseNegatives": feedback["falseNegatives"],
        "top10_hit_rate": corrected_top10["rate"],
        "baseRate": hit_rate([s for s in samples[:int(len(samples)*0.8)]][int(len(samples)*0.2):] or samples[:1]) if len(samples) > 5 else 0,
        "feedbackApplied": True,
        "model": corrected_model,
    }
if __name__ == '__main__':
    server = ThreadingHTTPServer(('', PORT), Handler)
    print(f"Serving on http://localhost:{PORT}")
    server.serve_forever()

# ──────────────────────────────────────────────
# 交易记录 & 盈亏统计 (第一性原理: 记录每一笔买卖)
# ──────────────────────────────────────────────


# ──────────────────────────────────────────────
# 自动控制反馈闭环: 用昨日错误修正今日模型
# 核心思想: 误差 = 预测值 - 真实值 → 调整权重
# ──────────────────────────────────────────────
