const boardRules = {
  main: { label: "沪深主板", limit: 0.1 },
  star: { label: "科创板", limit: 0.2 },
  chinext: { label: "创业板", limit: 0.2 },
  bse: { label: "北交所", limit: 0.3 },
};

const moodMap = {
  cold: { label: "低迷", score: 38 },
  neutral: { label: "中性", score: 58 },
  hot: { label: "活跃", score: 78 },
};

const demoStocks = [
  {
    code: "300750",
    name: "宁德时代",
    board: "chinext",
    prevClose: 198.42,
    lastPrice: 226.1,
    volumeRatio: 3.8,
    turnover: 4.9,
    changePct: 13.95,
    capitalInflow: 6.2,
    themeHeat: 82,
    limitStreak: 0,
    isSt: false,
  },
  {
    code: "603019",
    name: "中科曙光",
    board: "main",
    prevClose: 48.2,
    lastPrice: 52.52,
    volumeRatio: 2.9,
    turnover: 9.4,
    changePct: 8.96,
    capitalInflow: 7.4,
    themeHeat: 88,
    limitStreak: 1,
    isSt: false,
  },
  {
    code: "688256",
    name: "寒武纪",
    board: "star",
    prevClose: 520.0,
    lastPrice: 602.4,
    volumeRatio: 2.3,
    turnover: 6.1,
    changePct: 15.85,
    capitalInflow: 4.8,
    themeHeat: 91,
    limitStreak: 0,
    isSt: false,
  },
  {
    code: "833427",
    name: "华维设计",
    board: "bse",
    prevClose: 16.8,
    lastPrice: 20.35,
    volumeRatio: 4.6,
    turnover: 18.2,
    changePct: 21.13,
    capitalInflow: 8.1,
    themeHeat: 76,
    limitStreak: 2,
    isSt: false,
  },
];

const marketSnapshotQuotes = [
  { symbol: "sh688108", code: "688108", name: "赛诺医疗", trade: "22.300", changepercent: 20.022, settlement: "18.580", high: "22.300", low: "18.570", amount: 1232045733, turnoverratio: 13.80381 },
  { symbol: "sz300486", code: "300486", name: "东杰智能", trade: "24.940", changepercent: 20.019, settlement: "20.780", high: "24.940", low: "20.900", amount: 1316611837, turnoverratio: 11.63719 },
  { symbol: "sz301360", code: "301360", name: "荣旗科技", trade: "87.700", changepercent: 20.005, settlement: "73.080", high: "87.700", low: "80.200", amount: 331693533, turnoverratio: 11.43253 },
  { symbol: "sh688622", code: "688622", name: "*ST禾信", trade: "116.980", changepercent: 20.004, settlement: "97.480", high: "116.980", low: "98.000", amount: 300561074, turnoverratio: 3.7865 },
  { symbol: "sz301439", code: "301439", name: "泓淋电力", trade: "19.570", changepercent: 19.988, settlement: "16.310", high: "19.570", low: "19.570", amount: 237094581, turnoverratio: 6.61141 },
  { symbol: "bj920857", code: "920857", name: "泓禧科技", trade: "18.200", changepercent: 17.723, settlement: "15.460", high: "20.090", low: "15.700", amount: 79988498, turnoverratio: 5.86219 },
  { symbol: "sz301373", code: "301373", name: "凌玮科技", trade: "138.600", changepercent: 17.448, settlement: "118.010", high: "141.610", low: "118.510", amount: 1894809248, turnoverratio: 34.37838 },
  { symbol: "bj920161", code: "920161", name: "龙辰科技", trade: "45.800", changepercent: 15.657, settlement: "39.600", high: "51.290", low: "40.300", amount: 1089930253, turnoverratio: 64.4368 },
  { symbol: "sz301222", code: "301222", name: "浙江恒威", trade: "35.880", changepercent: 15.37, settlement: "31.100", high: "37.300", low: "30.650", amount: 298155891, turnoverratio: 8.28432 },
  { symbol: "sz300913", code: "300913", name: "兆龙互连", trade: "59.350", changepercent: 14.332, settlement: "51.910", high: "61.600", low: "52.040", amount: 1675759260, turnoverratio: 11.18906 },
  { symbol: "sz301338", code: "301338", name: "凯格精机", trade: "248.920", changepercent: 13.974, settlement: "218.400", high: "258.880", low: "223.010", amount: 2110201273, turnoverratio: 16.07686 },
  { symbol: "sz301231", code: "301231", name: "荣信文化", trade: "33.690", changepercent: 13.358, settlement: "29.720", high: "35.400", low: "29.870", amount: 456221265, turnoverratio: 21.23045 },
  { symbol: "bj920273", code: "920273", name: "一致魔芋", trade: "20.320", changepercent: 12.514, settlement: "18.060", high: "21.500", low: "17.880", amount: 124936125, turnoverratio: 9.09839 },
  { symbol: "bj920190", code: "920190", name: "雷神科技", trade: "24.100", changepercent: 11.471, settlement: "21.620", high: "25.660", low: "23.330", amount: 210278384, turnoverratio: 8.65359 },
  { symbol: "sz301053", code: "301053", name: "远信工业", trade: "61.210", changepercent: 11.291, settlement: "55.000", high: "61.520", low: "54.900", amount: 493268128, turnoverratio: 9.84497 },
  { symbol: "sz300317", code: "300317", name: "珈伟新能", trade: "5.720", changepercent: 11.284, settlement: "5.140", high: "6.090", low: "5.050", amount: 1157286141, turnoverratio: 24.71476 },
  { symbol: "sz301038", code: "301038", name: "深水规院", trade: "20.190", changepercent: 10.449, settlement: "18.280", high: "21.500", low: "18.320", amount: 240768903, turnoverratio: 5.32341 },
  { symbol: "sz301591", code: "301591", name: "肯特股份", trade: "47.460", changepercent: 10.244, settlement: "43.050", high: "49.000", low: "41.660", amount: 862584147, turnoverratio: 42.14734 },
  { symbol: "sz000926", code: "000926", name: "福星股份", trade: "2.590", changepercent: 10.213, settlement: "2.350", high: "2.590", low: "2.360", amount: 456909653, turnoverratio: 11.63633 },
];

const validationExampleCsv = `code,name,board,prevClose,lastPrice,volumeRatio,turnover,changePct,capitalInflow,themeHeat,limitStreak,isSt,label
000767,晋控电力,main,5.07,5.58,4.8,18.2,10.06,7.8,86,1,false,1
002995,天地在线,main,20.75,22.83,4.4,14.1,10.02,7.4,82,1,false,1
688108,赛诺医疗,star,18.58,22.30,5.8,13.8,20.02,7.2,88,1,false,1
300486,东杰智能,chinext,20.78,24.94,5.1,11.6,20.02,6.9,85,1,false,1
301373,凌玮科技,chinext,118.01,138.60,5.8,34.3,17.45,5.8,78,0,false,0
301338,凯格精机,chinext,218.40,248.92,5.8,16.1,13.97,4.7,74,0,false,0
301231,荣信文化,chinext,29.72,33.69,5.8,21.2,13.36,4.2,72,0,false,0
300317,珈伟新能,chinext,5.14,5.72,5.8,24.7,11.28,4.1,70,0,false,0
301591,肯特股份,chinext,43.05,47.46,5.8,42.1,10.24,3.6,68,0,false,0
000926,福星股份,main,2.35,2.59,5.0,11.6,10.21,6.7,79,1,false,1
920857,泓禧科技,bse,15.46,18.20,3.1,5.9,17.72,3.4,66,0,false,0
920161,龙辰科技,bse,39.60,45.80,5.8,64.4,15.66,4.9,75,0,false,0`;

let watchlist = [];
let dataSource = "本地行情快照";
let lastLoadedAt = "";
let boardFilters = { main: true, star: true, chinext: true, bse: true };

const elements = {
  form: document.querySelector("#stockForm"),
  resultsBody: document.querySelector("#resultsBody"),
  emptyState: document.querySelector("#emptyState"),
  addStockBtn: document.querySelector("#addStockBtn"),
  loadDemoBtn: document.querySelector("#loadDemoBtn"),
  refreshMarketBtn: document.querySelector("#refreshMarketBtn"),
  importCsvBtn: document.querySelector("#importCsvBtn"),
  csvInput: document.querySelector("#csvInput"),
  marketMood: document.querySelector("#marketMood"),
  themeHeat: document.querySelector("#themeHeat"),
  themeHeatValue: document.querySelector("#themeHeatValue"),
  riskAppetite: document.querySelector("#riskAppetite"),
  riskAppetiteValue: document.querySelector("#riskAppetiteValue"),
  marketRegimeLabel: document.querySelector("#marketRegimeLabel"),
  watchlistCount: document.querySelector("#watchlistCount"),
  dataStatus: document.querySelector("#dataStatus"),
  trainModelBtn: document.querySelector("#trainModelBtn"),
  refreshMarketBtn2: document.querySelector("#refreshMarketBtn2"),
  modelResults: document.querySelector("#modelResults"),
  autoRefresh: document.querySelector("#autoRefresh"),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundPrice(value) {
  return Math.round(value * 100) / 100;
}

// Generate top 3 signals for a stock
function getTopSignals(s) {
  const signals = [];
  if (s.distancePct > 0.8 && s.distancePct <= 5) signals.push("攻击距离" + s.distancePct.toFixed(1) + "%");
  if (s.volumeRatio >= 2.5) signals.push("📊 放量" + s.volumeRatio.toFixed(1) + "x");
  if (s.capitalInflow >= 4) signals.push("💰 资金+" + s.capitalInflow.toFixed(1));
  if (s.themeHeat >= 75) signals.push("🔥 题材" + s.themeHeat);
  if (s.limitStreak >= 1) signals.push("⚡ " + s.limitStreak + "连板");
  if (s.turnover >= 12) signals.push("🔄 高换手" + s.turnover.toFixed(1) + "%");
  return signals.slice(0, 3);
}

function getLimitRate(stock) {
  if (stock.isSt && stock.board === "main") {
    const mainStRuleChange = new Date("2026-07-06T00:00:00+08:00");
    return new Date() >= mainStRuleChange ? 0.1 : 0.05;
  }
  return boardRules[stock.board]?.limit ?? 0.1;
}

function normalize(value, low, high) {
  return clamp(((value - low) / (high - low)) * 100, 0, 100);
}

function scoreStock(stock) {
  const limitRate = getLimitRate(stock);
  const limitPrice = roundPrice(stock.prevClose * (1 + limitRate));
  const distancePct = ((limitPrice - stock.lastPrice) / limitPrice) * 100;
  const idealLow = limitRate <= 0.1 ? 1.2 : 2.0;
  const idealHigh = limitRate <= 0.1 ? 4.8 : Math.min(9, limitRate * 100 * 0.48);
  let distanceScore = 0;
  if (distancePct <= 0.8) {
    distanceScore = 28;
  } else if (distancePct >= idealLow && distancePct <= idealHigh) {
    distanceScore = 92;
  } else if (distancePct < idealLow) {
    distanceScore = 72;
  } else {
    distanceScore = clamp(82 - (distancePct - idealHigh) * 9, 10, 82);
  }
  const volumeScore = normalize(stock.volumeRatio, 0.8, 5.2);
  const turnoverScore = normalize(stock.turnover, 2, stock.board === "bse" ? 28 : 16);
  const flowScore = normalize(stock.capitalInflow, -4, 9);
  const themeScore = clamp((stock.themeHeat * 0.7 + Number(elements.themeHeat.value) * 0.3), 0, 100);
  const streakScore = clamp(stock.limitStreak * 18 + (stock.limitStreak > 0 ? 26 : 0), 0, 100);
  const moodScore = moodMap[elements.marketMood.value].score;
  const riskAdjusted = Number(elements.riskAppetite.value) * 0.18;

  const rawScore =
    distanceScore * 0.26 +
    volumeScore * 0.16 +
    turnoverScore * 0.12 +
    flowScore * 0.15 +
    themeScore * 0.16 +
    streakScore * 0.08 +
    moodScore * 0.07 +
    riskAdjusted;

  const probability = clamp(Math.round(rawScore), 1, 96);
  const tags = [];

  if (distancePct > 0.8 && distancePct <= idealHigh) tags.push("攻击距离");
  if (stock.volumeRatio >= 2.5) tags.push("放量");
  if (stock.capitalInflow >= 4) tags.push("资金强");
  if (stock.themeHeat >= 75) tags.push("题材强");
  if (stock.limitStreak >= 1) tags.push(`${stock.limitStreak}连板`);
  if (stock.turnover >= 12) tags.push("高换手");
  if (stock.industry) tags.push(stock.industry);
  if (distancePct <= 0.8) tags.push("过度贴板");
  if (distancePct > idealHigh + 3) tags.push("距离偏远");

  return {
    ...stock,
    limitRate,
    limitPrice,
    distancePct,
    probability,
    tags,
  };
}

function render() {
  const scored = watchlist
    .map((stock) => {
      const scoredStock = scoreStock(stock);
      const modelScore = validNumber(stock.modelScore) ? stock.modelScore : 0;
      const ruleScore = scoredStock.probability;
      // Composite: use model ranking + rule-based differentiation
      const compositeScore = modelScore > 0 ? Math.round(modelScore * 0.78 + ruleScore * 0.22) : ruleScore;
      return {
        ...scoredStock,
        displayScore: compositeScore,
        topSignals: getTopSignals(scoredStock),
      };
    })
    .sort((a, b) => b.displayScore - a.displayScore)
    .filter(s => boardFilters[s.board]);
  elements.resultsBody.innerHTML = "";
  const activeCount = scored.filter(s => boardFilters[s.board]).length;
  elements.watchlistCount.textContent = `${activeCount}/${watchlist.length} 只`;
  elements.marketRegimeLabel.textContent = `情绪：${moodMap[elements.marketMood.value].label}`;
  elements.themeHeatValue.textContent = elements.themeHeat.value;
  elements.riskAppetiteValue.textContent = elements.riskAppetite.value;
  elements.dataStatus.textContent = `${dataSource}${lastLoadedAt ? ` · ${lastLoadedAt}` : ""} · 按预测分排序`;

  if (scored.length === 0) {
    elements.resultsBody.append(elements.emptyState.content.cloneNode(true));
    return;
  }

  // Show top 3 as highlighted picks
  const top3Header = document.createElement("tr");
  top3Header.innerHTML = '<td colspan="9" style="padding:6px 10px;font-size:13px;font-weight:600;color:var(--red);background:#fff0ed;">次日优先候选</td>';
  elements.resultsBody.append(top3Header);
  
  scored.slice(0, 3).forEach((stock, index) => {
    const row = document.createElement("tr");
    const tagHtml = stock.topSignals.length > 0 
      ? stock.topSignals.map(t => '<span class="tag">' + t + '</span>').join("")
      : '<span class="tag green">信号不足</span>';
    row.style.background = "#fff5f0";
    row.innerHTML = `
      <td><span class="rank" style="background:var(--red)">${index + 1}</span></td>
      <td class="code"><strong>${stock.code}</strong></td>
      <td><strong>${stock.name}</strong></td>
      <td>${boardRules[stock.board].label}${stock.isSt ? " ST" : ""}</td>
      <td class="code">${stock.limitPrice.toFixed(2)}</td>
      <td class="distance">${stock.distancePct <= 0 ? "已触板" : stock.distancePct.toFixed(2) + "%"}</td>
      <td><div class="probability"><strong>${stock.displayScore}</strong><span class="meter"><span style="width:${stock.displayScore}%"></span></span></div></td>
      <td><div class="tag-list">${tagHtml}</div></td>
      <td><button class="delete-btn" type="button" data-code="${stock.code}">x</button></td>
    `;
    elements.resultsBody.append(row);
  });

  // Separator
  const sep = document.createElement("tr");
  sep.innerHTML = '<td colspan="9" style="padding:4px 10px;font-size:12px;color:var(--muted);background:#f8fafc;">完整次日候选榜</td>';
  elements.resultsBody.append(sep);
  
  // Show the rest
  scored.slice(3).forEach((stock, index) => {
    const row = document.createElement("tr");
    const tagHtml = stock.tags
      .map((tag) => `<span class="tag ${tag === "距离偏远" ? "green" : ""}">${tag}</span>`)
      .join("");

    row.innerHTML = `
      <td><span class="rank">${index + 1}</span></td>
      <td class="code">${stock.code}</td>
      <td>${stock.name}</td>
      <td>${boardRules[stock.board].label}${stock.isSt ? " ST" : ""}</td>
      <td class="code">${stock.limitPrice.toFixed(2)}</td>
      <td class="distance">${stock.distancePct <= 0 ? "已触板" : `${stock.distancePct.toFixed(2)}%`}</td>
      <td>
        <div class="probability">
          <strong>${stock.displayScore}</strong>
          <span class="meter"><span style="width: ${stock.displayScore}%"></span></span>
        </div>
      </td>
      <td><div class="tag-list">${tagHtml || '<span class="tag green">信号不足</span>'}</div></td>
      <td><button class="delete-btn" type="button" data-code="${stock.code}" aria-label="删除 ${stock.name}">x</button></td>
    `;
    elements.resultsBody.append(row);
  });
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1" || String(value).toLowerCase() === "st";
}

function parseValidationCsv(text) {
  const rows = text
    .split(/\n+/)
    .map((row) => row.trim())
    .filter(Boolean);

  return rows
    .map((row, index) => {
      if (index === 0 && row.toLowerCase().startsWith("code,")) return null;
      const [
        code,
        name,
        board,
        prevClose,
        lastPrice,
        volumeRatio,
        turnover,
        changePct,
        capitalInflow,
        themeHeat,
        limitStreak,
        isSt = "false",
        label = "0",
      ] = row.split(",").map((cell) => cell.trim());

      if (!code || !name || !boardRules[board]) return null;

      return {
        code,
        name,
        board,
        prevClose: Number(prevClose),
        lastPrice: Number(lastPrice),
        volumeRatio: Number(volumeRatio),
        turnover: Number(turnover),
        changePct: Number(changePct),
        capitalInflow: Number(capitalInflow),
        themeHeat: Number(themeHeat),
        limitStreak: Number(limitStreak),
        isSt: parseBoolean(isSt),
        label: Number(label) === 1 ? 1 : 0,
      };
    })
    .filter(Boolean)
    .filter((row) =>
      [
        row.prevClose,
        row.lastPrice,
        row.volumeRatio,
        row.turnover,
        row.changePct,
        row.capitalInflow,
        row.themeHeat,
        row.limitStreak,
      ].every(validNumber),
    );
}

function hitRate(rows) {
  if (rows.length === 0) return 0;
  return rows.reduce((sum, row) => sum + row.label, 0) / rows.length;
}

function formatRate(value) {
  return `${Math.round(value * 1000) / 10}%`;
}

function topMetric(rows, sorter, size) {
  const selected = [...rows].sort(sorter).slice(0, Math.min(size, rows.length));
  return {
    size: selected.length,
    hits: selected.reduce((sum, row) => sum + row.label, 0),
    rate: hitRate(selected),
  };
}

function runValidation() {
  const rows = parseValidationCsv(elements.validationCsv.value).map((row) => scoreStock(row));
  if (rows.length < 5) {
    elements.validationResults.innerHTML = `
      <div class="metric-card">
        <span>验证状态</span>
        <strong>样本不足</strong>
        <small>至少导入 5 行有效历史样本</small>
      </div>
    `;
    return;
  }

  const universeRate = hitRate(rows);
  const byModel = (a, b) => b.probability - a.probability;
  const byChange = (a, b) => b.changePct - a.changePct;
  const byDistance = (a, b) => a.distancePct - b.distancePct;
  const modelTop10 = topMetric(rows, byModel, 10);
  const modelTop20 = topMetric(rows, byModel, 20);
  const changeTop10 = topMetric(rows, byChange, 10);
  const distanceTop10 = topMetric(rows, byDistance, 10);
  const lift = universeRate === 0 ? 0 : modelTop10.rate / universeRate;

  elements.validationResults.innerHTML = `
    <div class="metric-card">
      <span>样本数</span>
      <strong>${rows.length}</strong>
      <small>基础命中率 ${formatRate(universeRate)}</small>
    </div>
    <div class="metric-card">
      <span>模型 Top10</span>
      <strong>${formatRate(modelTop10.rate)}</strong>
      <small>${modelTop10.hits}/${modelTop10.size} 命中，Lift ${lift.toFixed(2)}x</small>
    </div>
    <div class="metric-card">
      <span>模型 Top20</span>
      <strong>${formatRate(modelTop20.rate)}</strong>
      <small>${modelTop20.hits}/${modelTop20.size} 命中</small>
    </div>
    <div class="metric-card">
      <span>涨幅基准 Top10</span>
      <strong>${formatRate(changeTop10.rate)}</strong>
      <small>${changeTop10.hits}/${changeTop10.size} 命中</small>
    </div>
    <div class="metric-card">
      <span>距离基准 Top10</span>
      <strong>${formatRate(distanceTop10.rate)}</strong>
      <small>${distanceTop10.hits}/${distanceTop10.size} 命中</small>
    </div>
  `;
}

function detectBoard(code) {
  if (code.startsWith("688") || code.startsWith("689")) return "star";
  if (code.startsWith("300") || code.startsWith("301")) return "chinext";
  if (code.startsWith("8") || code.startsWith("4") || code.startsWith("920")) return "bse";
  return "main";
}

function isStName(name) {
  return /(^|\*)ST/i.test(name);
}

function validNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function deriveThemeHeat(industry, industryCounts) {
  const maxCount = Math.max(...Object.values(industryCounts), 1);
  const count = industryCounts[industry] ?? 0;
  return clamp(Math.round(48 + (count / maxCount) * 42), 45, 95);
}

function normalizeEastmoneyQuote(raw, industryCounts) {
  const code = String(raw.f12 || "").trim();
  const name = String(raw.f14 || "").trim();
  const lastPrice = Number(raw.f2);
  const changePct = Number(raw.f3);
  const volumeRatio = Number(raw.f10);
  const turnover = Number(raw.f8);
  const capitalInflow = Number(raw.f184);
  const industry = String(raw.f100 || "未分类").trim();

  if (!code || !name || !validNumber(lastPrice) || !validNumber(changePct)) return null;
  if (!validNumber(volumeRatio) || !validNumber(turnover) || !validNumber(capitalInflow)) return null;
  if (/^[NC]/.test(name) || changePct > 31) return null;

  return {
    code,
    name,
    board: detectBoard(code),
    prevClose: roundPrice(lastPrice / (1 + changePct / 100)),
    lastPrice,
    volumeRatio,
    turnover,
    changePct,
    capitalInflow,
    themeHeat: deriveThemeHeat(industry, industryCounts),
    limitStreak: changePct >= 19.8 ? 1 : 0,
    isSt: isStName(name),
    industry,
  };
}

function normalizeSinaQuote(raw, industryCounts) {
  const code = String(raw.code || "").trim();
  const name = String(raw.name || "").trim();
  const lastPrice = Number(raw.trade);
  const prevClose = Number(raw.settlement);
  const high = Number(raw.high);
  const low = Number(raw.low);
  const changePct = Number(raw.changepercent);
  const turnover = Number(raw.turnoverratio);
  const amount = Number(raw.amount);
  const industry = detectBoard(code) === "bse" ? "北交所强势" : code.startsWith("30") ? "创业板强势" : code.startsWith("68") ? "科创板强势" : "主板强势";
  const range = Math.max(high - low, 0.01);
  const closePosition = clamp((lastPrice - low) / range, 0, 1);
  const amountScore = normalize(amount, 80_000_000, 1_800_000_000);

  if (!code || !name || !validNumber(lastPrice) || !validNumber(prevClose) || !validNumber(changePct)) return null;
  if (/^[NC]/.test(name) || changePct > 31) return null;

  return {
    code,
    name,
    board: detectBoard(code),
    prevClose,
    lastPrice,
    volumeRatio: clamp(turnover / 3 + (changePct >= 9.8 ? 1.2 : 0), 0.6, 5.8),
    turnover,
    changePct,
    capitalInflow: clamp(closePosition * 8 + amountScore * 0.04 - 1, -4, 9),
    themeHeat: deriveThemeHeat(industry, industryCounts),
    limitStreak: changePct >= 19.8 || (detectBoard(code) === "main" && changePct >= 9.8) ? 1 : 0,
    isSt: isStName(name),
    industry,
  };
}

function normalizeApiStock(raw, industryCounts = {}) {
  const code = String(raw.code || "").trim();
  const board = raw.board || detectBoard(code);
  const name = String(raw.name || "").trim();
  const prevClose = Number(raw.prevClose);
  const lastPrice = Number(raw.lastPrice);
  const high = Number(raw.high ?? raw.lastPrice);
  const low = Number(raw.low ?? raw.lastPrice);
  const turnover = Number(raw.turnover ?? 0);
  const amount = Number(raw.amount ?? 0);
  const apiVolumeRatio = Number(raw.volumeRatio);
  const apiCapitalInflow = Number(raw.capitalInflow);
  const changePct = Number(raw.changePct ?? ((lastPrice / prevClose - 1) * 100));
  const industry =
    raw.industry ||
    (board === "bse" ? "北交所强势" : board === "chinext" ? "创业板强势" : board === "star" ? "科创板强势" : "主板强势");
  const range = Math.max(high - low, 0.01);
  const closePosition = clamp((lastPrice - low) / range, 0, 1);
  const amountScore = normalize(amount, 80_000_000, 1_800_000_000);

  return {
    code,
    name,
    board,
    prevClose,
    lastPrice,
    volumeRatio: validNumber(apiVolumeRatio) && apiVolumeRatio > 0
      ? clamp(apiVolumeRatio, 0.6, 5.8)
      : clamp(turnover / 3 + (changePct >= 9.8 ? 1.2 : 0), 0.6, 5.8),
    turnover,
    changePct,
    capitalInflow: validNumber(apiCapitalInflow)
      ? clamp(apiCapitalInflow, -4, 9)
      : clamp(closePosition * 8 + amountScore * 0.04 - 1, -4, 9),
    themeHeat: deriveThemeHeat(industry, industryCounts),
    limitStreak: changePct >= 19.8 || (board === "main" && changePct >= 9.8) ? 1 : 0,
    isSt: isStName(name),
    industry,
    amount,
    modelScore: validNumber(Number(raw.modelScore)) ? Number(raw.modelScore) : undefined,
    rawModelScore: validNumber(Number(raw.rawModelScore)) ? Number(raw.rawModelScore) : undefined,
  };
}

function normalizeSnapshotQuotes() {
  const industryCounts = marketSnapshotQuotes.reduce((counts, quote) => {
    const industry = detectBoard(quote.code) === "bse" ? "北交所强势" : quote.code.startsWith("30") ? "创业板强势" : quote.code.startsWith("68") ? "科创板强势" : "主板强势";
    counts[industry] = (counts[industry] ?? 0) + 1;
    return counts;
  }, {});

  return marketSnapshotQuotes.map((quote) => normalizeSinaQuote(quote, industryCounts)).filter(Boolean);
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `marketCallback_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";

    window[callbackName] = (payload) => {
      delete window[callbackName];
      script.remove();
      resolve(payload);
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("行情接口加载失败"));
    };

    script.src = `${url}${separator}cb=${callbackName}`;
    document.head.append(script);
  });
}

function setLoading(isLoading) {
  elements.refreshMarketBtn.disabled = isLoading;
  elements.refreshMarketBtn.classList.toggle("loading", isLoading);
  elements.refreshMarketBtn.textContent = isLoading ? "加载中" : "更新行情";
}

function applyMarketMood(stocks) {
  const strongCount = stocks.filter((stock) => stock.changePct >= 9.5).length;
  const averageTurnover =
    stocks.reduce((sum, stock) => sum + stock.turnover, 0) / Math.max(stocks.length, 1);

  if (strongCount >= 18 || averageTurnover >= 12) {
    elements.marketMood.value = "hot";
  } else if (strongCount <= 5 && averageTurnover < 6) {
    elements.marketMood.value = "cold";
  } else {
    elements.marketMood.value = "neutral";
  }
}

async function loadMarketData() {
  setLoading(true);
  elements.dataStatus.textContent = "正在加载公开行情";

  try {
    const apiResponse = await fetch("/api/current");
    if (apiResponse.ok) {
      const payload = await apiResponse.json();
      const quotes = payload.stocks ?? [];
      const industryCounts = quotes.reduce((counts, quote) => {
        const board = quote.board || detectBoard(String(quote.code || ""));
        const industry = board === "bse" ? "北交所强势" : board === "chinext" ? "创业板强势" : board === "star" ? "科创板强势" : "主板强势";
        counts[industry] = (counts[industry] ?? 0) + 1;
        return counts;
      }, {});
      const stocks = quotes.map((quote) => normalizeApiStock(quote, industryCounts)).slice(0, 50);
      if (stocks.length >= 8) {
        watchlist = stocks;
        dataSource = "本地后端公开行情";
        lastLoadedAt = new Date().toLocaleString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        applyMarketMood(stocks);
        return;
      }
    }

    const url =
      "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?num=80&sort=changepercent&asc=0&node=hs_a&symbol=&_s_r_a=page&page=1";
    const response = await fetch(url);
    if (!response.ok) throw new Error("行情接口响应异常");
    const quotes = await response.json();
    const industryCounts = quotes.reduce((counts, quote) => {
      const code = String(quote.code || "");
      const industry = detectBoard(code) === "bse" ? "北交所强势" : code.startsWith("30") ? "创业板强势" : code.startsWith("68") ? "科创板强势" : "主板强势";
      counts[industry] = (counts[industry] ?? 0) + 1;
      return counts;
    }, {});
    const stocks = quotes
      .map((quote) => normalizeSinaQuote(quote, industryCounts))
      .filter(Boolean)
      .filter((stock) => stock.changePct >= 3 && stock.volumeRatio >= 1 && stock.turnover >= 2)
      .slice(0, 50);

    if (stocks.length < 8) throw new Error("有效行情候选不足");

    watchlist = stocks;
    dataSource = "新浪财经公开行情";
    lastLoadedAt = new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    applyMarketMood(stocks);
  } catch (error) {
    watchlist = normalizeSnapshotQuotes();
    dataSource = "本地行情快照";
    lastLoadedAt = "在线更新失败";
  } finally {
    setLoading(false);
    render();
  }
}


let chainsCache = null;
let chainsLoading = false;



async function loadTracking() {
  const panel = document.querySelector("#trackingPanel");
  if (!panel) return;
  panel.innerHTML = '<div class="metric-card"><span>预测追踪</span><strong>加载中</strong><small>验证历史预测</small></div>';
  try {
    const resp = await fetch("/api/track");
    const data = await resp.json();
    renderTracking(panel, data);
  } catch (e) {
    panel.innerHTML = '<div class="metric-card"><span>预测追踪</span><strong>暂不可用</strong><small>' + e.message + '</small></div>';
  }
}

function renderTracking(panel, data) {
  const fmtPct = (v) => (v * 100).toFixed(1) + "%";
  const overall = data.overallAccuracy || 0;
  const recent = data.recentAccuracy || 0;
  const overallClass = overall >= 0.3 ? "price-up" : overall >= 0.15 ? "price-flat" : "price-down";
  const recentClass = recent >= 0.3 ? "price-up" : recent >= 0.15 ? "price-flat" : "price-down";
  
  panel.innerHTML = '<div class="metric-card">'
    + '<span>总准确率</span><strong class="' + overallClass + '">' + fmtPct(overall) + '</strong>'
    + '<small>' + data.totalHits + '/' + data.totalPredictions + ' 命中</small>'
    + '</div>'
    + '<div class="metric-card">'
    + '<span>近5日均值</span><strong class="' + recentClass + '">' + fmtPct(recent) + '</strong>'
    + '<small>' + data.totalDays + ' 个交易日</small>'
    + '</div>'
    + '<div class="metric-card">'
    + '<span>日收益率</span><strong>' + data.totalDays + '</strong>'
    + '<small>总预测 ' + data.totalPredictions + ' 次</small>'
    + '</div>';
  
  if (data.days && data.days.length > 0) {
    const verified = data.days.filter(d => d.verified);
    if (verified.length > 0) {
      const list = verified.slice(-7).reverse().map(d => {
        const cls = d.accuracy >= 0.3 ? "price-up" : d.accuracy >= 0.15 ? "price-flat" : "price-down";
        return '<div class="track-day"><span class="date">' + d.date + '</span>'
          + '<span class="acc ' + cls + '">' + fmtPct(d.accuracy) + '</span>'
          + '<span class="hits">' + d.hits + '/' + d.total + '</span>'
          + '</div>';
      }).join("");
      panel.innerHTML += '<div class="tracking-history">' + list + '</div>';
    }
  }
}


async function loadChains(retries = 1) {
  if (chainsLoading) return;
  chainsLoading = true;
  const btn = document.querySelector("#loadChainsBtn");
  const panel = document.querySelector("#chainsPanel");
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      if (panel) panel.innerHTML = '<div class="metric-card"><span>产业链分析</span><strong>重试中</strong><small>第' + attempt + '次</small></div>';
      await new Promise(r => setTimeout(r, 2000));
    } else {
      if (btn) btn.textContent = "加载中...";
      if (panel) panel.innerHTML = '<div class="metric-card"><span>产业链分析</span><strong>加载中</strong><small>获取实时行情</small></div>';
    }
    
    try {
      const resp = await fetch("/api/chains");
      const data = await resp.json();
      chainsCache = data;
      renderChains(data);
    } catch (e) {
      if (attempt < retries) continue;
      if (panel) panel.innerHTML = '<div class="metric-card"><span>产业链分析</span><strong>失败</strong><small>' + e.message + '</small></div>';
    } finally {
      chainsLoading = false;
      if (btn) btn.textContent = "产业链分析";
    }
    return;  // Success
  }
}

function renderChains(data) {
  const panel = document.querySelector("#chainsPanel");
  if (!panel || !data.chains) return;
  
  panel.innerHTML = data.chains.map(chain => {
    const layersHtml = chain.layers.map(layer => {
      const lDir = layer.avgChange > 0 ? "up" : "down";
      const lSign = layer.avgChange > 0 ? "+" : "";
      const segmentsHtml = layer.segments.map(seg => {
        const stocksHtml = seg.stocks.map(s => {
          const sDir = s.changePct > 0 ? "up" : (s.changePct < 0 ? "down" : "flat");
          const sSign = s.changePct > 0 ? "+" : "";
          return `<span class="chip chip-${sDir}" title="${s.code} ${sSign}${s.changePct.toFixed(2)}%">${s.name} ${sSign}${s.changePct.toFixed(2)}%</span>`;
        }).join(" ");
        return `<div class="chain-segment">
          <div class="segment-label">${seg.name} <span class="seg-change price-${lDir}">${lSign}${seg.avgChange.toFixed(2)}%</span></div>
          <div class="segment-stocks">${stocksHtml}</div>
        </div>`;
      }).join("");
      return `<div class="chain-layer">
        <div class="layer-header">
          <strong>${layer.name}</strong>
          <span class="price-${lDir}">${lSign}${layer.avgChange.toFixed(2)}% (${layer.positive}/${layer.total})</span>
        </div>
        ${segmentsHtml}
      </div>`;
    }).join("");
    
    return `<div class="chain-card">
      <div class="chain-header">
        <div>
          <strong class="chain-title">${chain.name}</strong>
          <small class="chain-desc">${chain.desc}</small>
        </div>
        ${chain.hotTopic ? `<div class="hot-topic" title="当前催化剂">${chain.hotTopic}</div>` : ""}
      </div>
      <div class="chain-body">${layersHtml}</div>
    </div>`;
  }).join("");
}


function setTraining(isTraining) {
  elements.trainModelBtn.disabled = isTraining;
  elements.trainModelBtn.classList.toggle("loading", isTraining);
  elements.trainModelBtn.textContent = isTraining ? "训练中" : "自动训练模型";
}

function formatPct(value) {
  return `${Math.round(Number(value) * 1000) / 10}%`;
}

function renderModelResults(payload) {
  const metrics = payload.metrics;
  const weights = payload.weights;
  elements.modelResults.innerHTML = `
    <div class="metric-card">
      <span>历史样本</span>
      <strong>${payload.sampleCount}</strong>
      <small>训练 ${payload.trainCount}，测试 ${payload.testCount}</small>
    </div>
    <div class="metric-card">
      <span>模型 Top10</span>
      <strong>${formatPct(metrics.modelTop10.rate)}</strong>
      <small>${metrics.modelTop10.hits}/${metrics.modelTop10.size} 命中，Lift ${metrics.lift.toFixed(2)}x</small>
    </div>
    <div class="metric-card">
      <span>涨幅基准 Top10</span>
      <strong>${formatPct(metrics.changeTop10.rate)}</strong>
      <small>${metrics.changeTop10.hits}/${metrics.changeTop10.size} 命中</small>
    </div>
    <div class="metric-card">
      <span>距离基准 Top10</span>
      <strong>${formatPct(metrics.distanceTop10.rate)}</strong>
      <small>${metrics.distanceTop10.hits}/${metrics.distanceTop10.size} 命中</small>
    </div>
    <div class="metric-card">
      <span>权重最强</span>
      <strong>${Object.entries(weights).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}</strong>
      <small>${Object.entries(weights)
        .map(([key, value]) => `${key}:${Number(value).toFixed(2)}`)
        .join(" ")}</small>
    </div>
  `;
}

async function trainModel() {
  setTraining(true);
  elements.modelResults.innerHTML = `
    <div class="metric-card">
      <span>建模状态</span>
      <strong>训练中</strong>
      <small>正在抓取当前候选和历史日 K</small>
    </div>
  `;

  try {
    const response = await fetch("/api/train");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "训练失败");
    const industryCounts = payload.stocks.reduce((counts, quote) => {
      const board = quote.board || detectBoard(String(quote.code || ""));
      const industry = board === "bse" ? "北交所强势" : board === "chinext" ? "创业板强势" : board === "star" ? "科创板强势" : "主板强势";
      counts[industry] = (counts[industry] ?? 0) + 1;
      return counts;
    }, {});

    watchlist = payload.stocks.map((stock) => normalizeApiStock(stock, industryCounts));
    dataSource = "自动训练模型";
    lastLoadedAt = new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    applyMarketMood(watchlist);
    renderModelResults(payload);
    render();
  } catch (error) {
    elements.modelResults.innerHTML = `
      <div class="metric-card">
        <span>建模状态</span>
        <strong>失败</strong>
        <small>${error.message}</small>
      </div>
    `;
  } finally {
    setTraining(false);
  }
}


let isAutoLoading = false;

function setAutoLoading(loading) {
  isAutoLoading = loading;
  elements.refreshMarketBtn.disabled = loading;
  elements.trainModelBtn.disabled = loading;
  elements.refreshMarketBtn.classList.toggle('loading', loading);
  elements.refreshMarketBtn.textContent = loading ? '加载中...' : '手动刷新';
  const dot = document.querySelector('.status-dot');
  if (dot) dot.classList.toggle('loading', loading);
}

async function autoLoad(retries = 2) {
  if (isAutoLoading) return;
  setAutoLoading(true);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      elements.dataStatus.textContent = `获取行情失败，第${attempt}次重试...`;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    } else {
      elements.dataStatus.textContent = '正在自动获取行情并训练模型...';
    }
    
    try {
      const response = await fetch('/api/auto');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || '自动加载失败');
      }
      const payload = await response.json();
    
    const industryCounts = payload.stocks.reduce((counts, stock) => {
      const board = stock.board || detectBoard(String(stock.code || ''));
      const label = board === 'bse' ? '北交所强势' : board === 'chinext' ? '创业板强势' : board === 'star' ? '科创板强势' : '主板强势';
      counts[label] = (counts[label] ?? 0) + 1;
      return counts;
    }, {});
    
    watchlist = payload.stocks.map((stock) => normalizeApiStock(stock, industryCounts)).slice(0, 50);
    
    if (payload.hasModel) {
      dataSource = payload.modelCached ? '模型缓存命中' : '自动训练完成';
      renderModelResults(payload);
    } else {
      dataSource = '行情已加载（模型暂不可用）';
      elements.modelResults.innerHTML = '<div class="metric-card"><span>建模状态</span><strong>失败</strong><small>' + (payload.modelError || '未知错误') + '</small></div>';
    }
    
    lastLoadedAt = new Date().toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
    applyMarketMood(watchlist);
    render();
    } catch (error) {
      console.error('autoLoad failed:', error);
      if (attempt < retries) continue;  // Retry
      // Final fallback
      watchlist = normalizeSnapshotQuotes();
      dataSource = '本地行情快照';
      lastLoadedAt = '自动加载失败: ' + error.message;
      render();
    } finally {
      setAutoLoading(false);
    }
    return;  // Success, exit retry loop
  }
}

function isMarketHours() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  // 9:15 - 15:05
  return minutes >= 555 && minutes <= 905;
}

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes
let autoRefreshTimer = null;

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshTimer = setInterval(() => {
    if (!isAutoLoading && elements.autoRefresh?.checked && isMarketHours()) {
      autoLoad();
    }
  }, AUTO_REFRESH_MS);
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}


function readFormStock() {
  return {
    code: document.querySelector("#code").value.trim(),
    name: document.querySelector("#name").value.trim(),
    board: document.querySelector("#board").value,
    prevClose: Number(document.querySelector("#prevClose").value),
    lastPrice: Number(document.querySelector("#lastPrice").value),
    volumeRatio: Number(document.querySelector("#volumeRatio").value),
    turnover: Number(document.querySelector("#turnover").value),
    changePct: Number(document.querySelector("#changePct").value),
    capitalInflow: Number(document.querySelector("#capitalInflow").value),
    themeHeat: Number(document.querySelector("#stockThemeHeat").value),
    limitStreak: Number(document.querySelector("#limitStreak").value),
    isSt: document.querySelector("#isSt").checked,
  };
}

function upsertStock(stock) {
  const existingIndex = watchlist.findIndex((item) => item.code === stock.code);
  if (existingIndex >= 0) {
    watchlist[existingIndex] = stock;
  } else {
    watchlist.push(stock);
  }
}

function importCsvRows(text) {
  const rows = text
    .split(/\n+/)
    .map((row) => row.trim())
    .filter(Boolean);

  rows.forEach((row, index) => {
    if (index === 0 && row.toLowerCase().startsWith("code,")) return;
    const [
      code,
      name,
      board,
      prevClose,
      lastPrice,
      volumeRatio,
      turnover,
      changePct,
      capitalInflow,
      themeHeat,
      limitStreak,
      isSt = "false",
    ] = row.split(",").map((cell) => cell.trim());

    if (!code || !name || !boardRules[board]) return;

    upsertStock({
      code,
      name,
      board,
      prevClose: Number(prevClose),
      lastPrice: Number(lastPrice),
      volumeRatio: Number(volumeRatio),
      turnover: Number(turnover),
      changePct: Number(changePct),
      capitalInflow: Number(capitalInflow),
      themeHeat: Number(themeHeat),
      limitStreak: Number(limitStreak),
      isSt: parseBoolean(isSt),
    });
  });
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  upsertStock(readFormStock());
  render();
});

elements.loadDemoBtn.addEventListener("click", () => {
  watchlist = normalizeSnapshotQuotes();
  dataSource = "本地行情快照";
  lastLoadedAt = "";
  render();
});

// Manual refresh handled by autoLoad binding above

elements.refreshMarketBtn2.addEventListener("click", loadMarketData);

elements.trainModelBtn.addEventListener("click", trainModel);

elements.addStockBtn.addEventListener("click", () => {
  document.querySelector("#code").focus();
});

elements.importCsvBtn.addEventListener("click", () => {
  importCsvRows(elements.csvInput.value);
  elements.csvInput.value = "";
  render();
});

elements.resultsBody.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;
  watchlist = watchlist.filter((stock) => stock.code !== button.dataset.code);
  render();
});

[elements.marketMood, elements.themeHeat, elements.riskAppetite].forEach((control) => {
  control.addEventListener("input", render);
});

// Auto-load on page open
autoLoad();
startAutoRefresh();
// Load chains and tracking after a delay
setTimeout(loadChains, 2000);
setTimeout(loadTracking, 4000);

// Bind auto-refresh toggle
elements.autoRefresh?.addEventListener('change', (event) => {
  if (event.target.checked) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// Keep manual refresh available
elements.refreshMarketBtn.addEventListener('click', () => {
  autoLoad();
});

// Board filter checkboxes
document.querySelectorAll('.board-filter').forEach(cb => {
  cb.addEventListener('change', () => {
    boardFilters[cb.dataset.board] = cb.checked;
    render();
  });
});

// Concept search
document.querySelector('#searchConceptBtn').addEventListener('click', searchConcept);
document.querySelector('#conceptKeyword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchConcept();
});

async function searchConcept() {
  const input = document.querySelector('#conceptKeyword');
  const btn = document.querySelector('#searchConceptBtn');
  const keyword = input.value.trim();
  if (!keyword || keyword.length > 100) return;
  const resultsEl = document.querySelector('#conceptResults');
  btn.disabled = true;
  btn.textContent = '搜索中...';
  resultsEl.innerHTML = '<div class="metric-card"><span>搜索</span><strong>搜索中</strong><small>' + keyword + '</small></div>';
  try {
    const resp = await fetch('/api/concept?keyword=' + encodeURIComponent(keyword));
    if (!resp.ok) throw new Error('搜索失败');
    const data = await resp.json();
    renderConceptResults(data, keyword);
  } catch (e) {
    resultsEl.innerHTML = '<div class="metric-card"><span>搜索</span><strong>失败</strong><small>' + e.message + '</small></div>';
  } finally {
    document.querySelector('#searchConceptBtn').disabled = false;
    document.querySelector('#searchConceptBtn').textContent = '搜索';
  }
}

function renderConceptResults(data, keyword) {
  const el = document.querySelector('#conceptResults');
  if (!data.chains || data.chains.length === 0) {
    el.innerHTML = '<div class="metric-card"><span>搜索</span><strong>无结果</strong><small>未找到与"' + keyword + '"相关的产业链</small></div>';
    return;
  }
  el.innerHTML = data.chains.map(chain => {
    const segmentsHtml = chain.segments.map(seg => {
      const chipsHtml = seg.stocks.map(s => {
        const dir = s.changePct > 0 ? 'up' : (s.changePct < 0 ? 'down' : '');
        const sign = s.changePct > 0 ? '+' : '';
        return '<span class="concept-chip ' + dir + '">' + s.name + ' <span class="chip-code">' + s.code + '</span> ' + sign + s.changePct.toFixed(2) + '%</span>';
      }).join(' ');
      return '<div style="margin-bottom:8px"><small style="color:var(--muted)">' + seg.name + '</small><div class="concept-segments">' + chipsHtml + '</div></div>';
    }).join('');
    return '<div class="concept-chain">' +
      '<div class="concept-chain-header"><strong>' + chain.name + '</strong><small>' + (chain.desc || '') + '</small></div>' +
      (chain.hotTopic ? '<div class="concept-chain-topic">HOT ' + chain.hotTopic + '</div>' : '') +
      segmentsHtml + '</div>';
  }).join('');
}

/* ==========================================
   交易记录 & 盈亏统计
   第一性原理：记录每一笔交易，识别亏损模式
   ========================================== */

// ── Tab 切换 ──
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    this.classList.add('active');
    document.getElementById('tab' + this.dataset.tab.charAt(0).toUpperCase() + this.dataset.tab.slice(1)).classList.add('active');
      loadReflection();

    if (this.dataset.tab === 'trades') {
      loadTrades();
    }
  });
});

// ── 设置今天日期为买入日期的默认值 ──
document.addEventListener('DOMContentLoaded', function() {
  var today = new Date().toISOString().slice(0, 10);
  var buyDate = document.getElementById('tradeBuyDate');
  if (buyDate) buyDate.value = today;
});

// ── 交易记录 CRUD ──
function loadTrades() {
  fetch('/api/trades')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      renderTradesList(data.trades || []);
      return fetch('/api/trades?action=stats');
    })
    .then(function(r) { return r.json(); })
    .then(function(stats) {
      renderTradeStats(stats);
    })
    .catch(function(err) {
      console.error('加载交易记录失败', err);
    });
}

function renderTradesList(trades) {
  var container = document.getElementById('tradesList');
  var label = document.getElementById('tradeCountLabel');
  if (!container) return;
  if (label) label.textContent = trades.length + ' 笔';
  if (!trades.length) {
    container.innerHTML = '<div class="metric-card"><span>暂无记录</span><strong>0</strong><small>录入第一笔交易开始追踪</small></div>';
    return;
  }
  container.innerHTML = trades.map(function(t) {
    var pnl = '';
    if (t.closePrice && t.closeDate) {
      var calcPnl = ((Number(t.closePrice) - Number(t.buyPrice)) * Number(t.quantity)).toFixed(2);
      var pct = ((Number(t.closePrice) / Number(t.buyPrice) - 1) * 100).toFixed(1);
      var cls = Number(calcPnl) >= 0 ? 'positive' : 'negative';
      var sign = Number(calcPnl) >= 0 ? '+' : '';
      pnl = '<span class="trade-item-pnl ' + cls + '">' + sign + calcPnl + ' (' + sign + pct + '%)</span>';
    } else {
      pnl = '<span class="trade-item-pnl" style="color:var(--blue)">持仓中</span>';
    }
    var reasonBuy = t.buyReason ? ('<div class="trade-item-reason">买入理由：' + escHtml(t.buyReason) + '</div>') : '';
    var reasonClose = t.closeReason && t.closeDate ? '<div class="trade-item-reason">卖出原因：' + escHtml(t.closeReason) + '</div>' : '';
    return (
      '<div class="trade-item" data-id="' + t.id + '">' +
        '<div class="trade-item-header">' +
          '<div>' +
            '<span class="trade-item-code">' + escHtml(t.code) + '</span>' +
            '<span class="trade-item-name">' + escHtml(t.name) + '</span>' +
            '<span style="margin-left:6px;font-size:11px;color:var(--muted)">' + escHtml(t.concept || '') + '</span>' +
          '</div>' +
          pnl +
        '</div>' +
        '<div class="trade-item-meta">' +
          '<span>买入 ' + escHtml(t.buyDate) + ' @ ' + Number(t.buyPrice).toFixed(2) + '</span>' +
          (t.closeDate ? '<span>卖出 ' + escHtml(t.closeDate) + ' @ ' + Number(t.closePrice).toFixed(2) + '</span>' : '') +
          '<span>' + Number(t.quantity) + ' 股</span>' +
          '<button class="delete-btn" onclick="deleteTrade(\'' + t.id + '\')">删除</button>' +
        '</div>' +
        reasonBuy + reasonClose +
      '</div>'
    );
  }).join('');
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function deleteTrade(id) {
  if (!confirm('确认删除这条交易记录？')) return;
  fetch('/api/trades?id=' + encodeURIComponent(id), { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function() { loadTrades(); })
    .catch(function(err) { console.error(err); });
}

function renderTradeStats(stats) {
  var container = document.getElementById('tradesStats');
  if (!container) return;
  if (!stats.closedTrades) {
    container.innerHTML = '<div class="metric-card"><span>盈亏看板</span><strong>暂无数据</strong><small>完成第一笔卖出后自动统计</small></div>';
    return;
  }

  var pnlClass = stats.totalPnl >= 0 ? 'positive' : 'negative';
  var pnlSign = stats.totalPnl >= 0 ? '+' : '';

  var html = (
    '<div class="stats-grid">' +
      '<div class="metric-card"><span>总交易</span><strong>' + stats.totalTrades + '</strong><small>' + stats.closedTrades + ' 笔已平仓</small></div>' +
      '<div class="metric-card"><span>总盈亏</span><strong class="' + pnlClass + '">' + pnlSign + stats.totalPnl.toFixed(2) + '</strong><small>累计</small></div>' +
      '<div class="metric-card"><span>胜率</span><strong>' + stats.winRate + '%</strong><small>' + stats.winTrades + ' 胜 / ' + stats.lossTrades + ' 负</small></div>' +
      '<div class="metric-card"><span>最大单笔亏损</span><strong class="negative">' + stats.maxLoss.toFixed(2) + '</strong><small>⚠ 注意风控</small></div>' +
    '</div>'
  );

  // 亏损原因分析（芒格：反过来想）
  var lossReasons = stats.lossReasons || {};
  var lossKeys = Object.keys(lossReasons);
  if (lossKeys.length) {
    html += '<div class="stats-section-title">🔻 亏损原因分布（反过来想：亏在哪？）</div>';
    html += lossKeys.map(function(k) {
      return '<div class="loss-reason-item"><span class="reason-label">' + escHtml(k) + '</span><span class="reason-count">' + lossReasons[k] + ' 次</span></div>';
    }).join('');
  }

  // 按概念统计
  var byConcept = stats.byConcept || {};
  var conceptKeys = Object.keys(byConcept);
  if (conceptKeys.length) {
    // 按盈亏排序（亏损最多的排在前面——哪些概念在亏钱）
    conceptKeys.sort(function(a, b) { return byConcept[a].pnl - byConcept[b].pnl; });
    html += '<div class="stats-section-title">📌 概念盈亏排名（亏损在前）</div>';
    html += conceptKeys.map(function(k) {
      var c = byConcept[k];
      var cls = c.pnl >= 0 ? 'positive' : 'negative';
      var sign = c.pnl >= 0 ? '+' : '';
      var rate = c.trades > 0 ? (c.wins / c.trades * 100).toFixed(0) : 0;
      return '<div class="concept-row"><span class="cname">' + escHtml(k) + '</span><span><span class="crate">' + c.trades + '笔 ' + rate + '%胜率 </span><span class="cpnl ' + cls + '">' + sign + c.pnl.toFixed(0) + '</span></span></div>';
    }).join('');
  }

  // 按月统计
  var byMonth = stats.byMonth || {};
  var monthKeys = Object.keys(byMonth);
  if (monthKeys.length) {
    monthKeys.sort();
    html += '<div class="stats-section-title">📅 月度盈亏</div>';
    html += monthKeys.map(function(k) {
      var m = byMonth[k];
      var cls = m.pnl >= 0 ? 'positive' : 'negative';
      var sign = m.pnl >= 0 ? '+' : '';
      return '<div class="concept-row"><span class="cname">' + escHtml(k) + '</span><span><span class="crate">' + m.trades + '笔 </span><span class="cpnl ' + cls + '">' + sign + m.pnl.toFixed(0) + '</span></span></div>';
    }).join('');
  }

  container.innerHTML = html;
}

// ── 保存交易记录 ──
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('tradeForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var body = {
      code: document.getElementById('tradeCode').value.trim(),
      name: document.getElementById('tradeName').value.trim(),
      concept: document.getElementById('tradeConcept').value.trim() || '未分类',
      board: document.getElementById('tradeBoard').value,
      buyDate: document.getElementById('tradeBuyDate').value,
      buyPrice: parseFloat(document.getElementById('tradeBuyPrice').value),
      quantity: parseInt(document.getElementById('tradeQuantity').value, 10),
      buyReason: document.getElementById('tradeBuyReason').value.trim() || '',
      closeDate: document.getElementById('tradeCloseDate').value || '',
      closePrice: document.getElementById('tradeClosePrice').value ? parseFloat(document.getElementById('tradeClosePrice').value) : '',
      closeReason: document.getElementById('tradeCloseReason').value || '',
    };

    if (!body.code || !body.name || !body.buyDate || !body.buyPrice || !body.quantity) {
      alert('请填写必填项：代码、名称、买入日期、买入价格、数量');
      return;
    }

    var btn = document.getElementById('saveTradeBtn');
    btn.disabled = true;
    btn.textContent = '保存中...';

    fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.ok) {
          form.reset();
          document.getElementById('tradeBuyDate').value = new Date().toISOString().slice(0, 10);
          loadTrades();
        } else {
          alert('保存失败：' + (result.error || '未知错误'));
        }
      })
      .catch(function(err) {
        alert('保存失败：' + err.message);
      })
      .finally(function() {
        btn.disabled = false;
        btn.textContent = '保存记录';
      });
  });

  var resetBtn = document.getElementById('resetTradeBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      form.reset();
      document.getElementById('tradeBuyDate').value = new Date().toISOString().slice(0, 10);
    });
  }
});

// ── 预测反思：昨日预测 TOP10 实际表现 ──
function loadReflection() {
  var container = document.getElementById('reflectionContent');
  if (!container) return;

  container.innerHTML = '<div class="metric-card"><span>预测反思</span><strong>加载中...</strong><small>验证昨日预测</small></div>';

  fetch('/api/track/detail')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.hasData) {
        container.innerHTML = '<div class="metric-card"><span>预测反思</span><strong>暂无数据</strong><small>' + (data.message || '请先训练模型产生预测') + '</small></div>';
        return;
      }
      renderReflection(container, data);
    })
    .catch(function(err) {
      container.innerHTML = '<div class="metric-card"><span>预测反思</span><strong>加载失败</strong><small>' + err.message + '</small></div>';
    });
}

function renderReflection(container, data) {
  var fmtPct = function(v) { return (v * 100).toFixed(1) + '%'; };
  var acc = data.accuracy || 0;
  var accClass = acc >= 0.3 ? 'price-up' : acc >= 0.15 ? 'price-flat' : 'price-down';

  // 摘要卡片
  var html = (
    '<div class="reflection-date">📅 预测日期：' + escHtml(data.date) + ' &nbsp;|&nbsp; 验证时间：' + escHtml(data.verifiedAt || data.generatedAt || '') + '</div>' +
    '<div class="reflection-summary">' +
      '<div class="metric-card"><span>命中数</span><strong>' + data.hits + '/' + data.totalPredictions + '</strong><small>昨日 TOP10</small></div>' +
      '<div class="metric-card"><span>准确率</span><strong class="' + accClass + '">' + fmtPct(acc) + '</strong><small>越高说明模型越可靠</small></div>' +
    '</div>'
  );

  // 预测列表表头
  html += '<div class="reflection-header">' +
    '<span>排名</span><span>股票</span><span>评分</span><span>涨幅</span><span>结果</span>' +
  '</div>';

  // 逐条预测
  html += '<div class="reflection-list">';
  data.predictions.forEach(function(p, i) {
    var cls = '';
    var statusText = '';
    if (p.hit === true) {
      cls = 'hit';
      statusText = '✅ 涨停';
    } else if (p.hit === false) {
      cls = 'miss';
      statusText = '❌ 未触及';
    } else {
      cls = 'pending';
      statusText = '⏳ 待验证';
    }

    var pctCls = 'flat';
    var pctText = '—';
    if (p.actualPct !== null && p.actualPct !== undefined) {
      if (p.actualPct > 0) pctCls = 'up';
      else if (p.actualPct < 0) pctCls = 'down';
      pctText = (p.actualPct > 0 ? '+' : '') + p.actualPct.toFixed(1) + '%';
    }

    html += (
      '<div class="reflection-item ' + cls + '">' +
        '<span class="ri-rank">#' + (i + 1) + '</span>' +
        '<span class="ri-name">' + escHtml(p.name) + '<span style="color:var(--muted);font-size:11px;margin-left:4px">' + escHtml(p.code) + '</span></span>' +
        '<span class="ri-score">' + Number(p.score).toFixed(1) + '</span>' +
        '<span class="ri-pct ' + pctCls + '">' + pctText + '</span>' +
        '<span class="ri-status ' + cls + '">' + statusText + '</span>' +
      '</div>'
    );
  });
  html += '</div>';

  // 错误原因简析
  var misses = data.predictions.filter(function(p) { return p.hit === false; });
  if (misses.length > 0) {
    html += '<div class="stats-section-title">🔻 未命中分析（反过来想）</div>';
    html += '<div style="font-size:12px;color:var(--muted);line-height:1.6">';
    html += '<p>昨日预测 TOP10 中有 <strong>' + misses.length + '</strong> 只未触及涨停价。常见原因：</p>';
    html += '<ul style="margin:4px 0 0 16px">';
    html += '  <li><strong>评分高但量能不足</strong> — 模型可能高估了量价配合的信号</li>';
    html += '  <li><strong>题材热度退潮</strong> — 盘后消息面或板块情绪降温</li>';
    html += '  <li><strong>大盘拖累</strong> — 当日指数走弱压制了封板意愿</li>';
    html += '  <li><strong>竞争标的太多</strong> — 同概念多只票同时拉升，资金分散</li>';
    html += '</ul>';
    html += '<p style="margin-top:6px">💡 芒格：先搞清为什么错，比搞清为什么对更重要。</p>';
    html += '</div>';
  }

  container.innerHTML = html;
}

// ── 反馈校正：用昨日误差修正今日模型 ──
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('runFeedbackBtn');
  if (!btn) return;

  btn.addEventListener('click', function() {
    var statusEl = document.getElementById('feedbackStatus');
    var resultEl = document.getElementById('feedbackResult');
    btn.disabled = true;
    btn.textContent = '训练中...';
    statusEl.textContent = '读取昨日误差、修正权重...';

    fetch('/api/train/feedback')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        btn.disabled = false;
        btn.textContent = '运行反馈校正训练';
        
        if (data.error) {
          statusEl.textContent = '错误';
          resultEl.innerHTML = '<div class="metric-card"><span>反馈校正</span><strong>失败</strong><small>' + escHtml(data.error) + '</small></div>';
          return;
        }

        statusEl.textContent = '';

        var methodLabel = data.method === 'feedback_corrected' ? '反馈校正' : '基准训练';
        var methodClass = data.feedbackApplied ? 'price-up' : 'price-flat';
        var feedbackInfo = '';

        if (data.feedbackApplied) {
          feedbackInfo = (
            '<div class="feedback-detail">' +
              '<strong>误差反馈详情</strong><br/>' +
              '假阳性（高分未涨停）：<strong>' + (data.falsePositives || 0) + '</strong> 只<br/>' +
              '假阴性（低分涨停了）：<strong>' + (data.falseNegatives || 0) + '</strong> 只<br/>' +
              '反馈样本数：<strong>' + (data.feedbackSamples || 0) + '</strong> 条<br/>' +
              '训练样本数：<strong>' + (data.samples || 0) + '</strong> 条<br/>' +
              'TOP10命中率：<strong>' + ((data.top10_hit_rate || 0) * 100).toFixed(1) + '%</strong><br/>' +
              '<br/>' +
              '💡 自动控制原理：误差信号 → 加权梯度下降 → 权重修正<br/>' +
              '假阳性样本权重1.5x，假阴性样本权重2.0x'
          );
        } else {
          var reason = data.method === 'base (no feedback)' ? '暂无已验证的预测误差数据' : '无法获取反馈样本行情';
          feedbackInfo = (
            '<div class="feedback-detail">' +
              '<strong>未应用反馈校正</strong><br/>' +
              '原因：' + reason + '<br/>' +
              '训练样本数：<strong>' + (data.samples || 0) + '</strong> 条<br/>' +
              'TOP10命中率：<strong>' + ((data.top10_hit_rate || 0) * 100).toFixed(1) + '%</strong>'
          );
        }

        resultEl.innerHTML = (
          '<div class="feedback-metrics">' +
            '<div class="metric-card"><span>训练模式</span><strong class="' + methodClass + '">' + methodLabel + '</strong><small>' + data.method + '</small></div>' +
            '<div class="metric-card"><span>训练样本</span><strong>' + (data.samples || 0) + '</strong><small>历史K线特征</small></div>' +
            '<div class="metric-card"><span>TOP10命中率</span><strong>' + ((data.top10_hit_rate || 0) * 100).toFixed(1) + '%</strong><small>测试集评估</small></div>' +
            (data.feedbackApplied ? '<div class="metric-card"><span>反馈样本</span><strong>' + (data.feedbackSamples || 0) + '</strong><small>FP:' + (data.falsePositives || 0) + ' FN:' + (data.falseNegatives || 0) + '</small></div>' : '') +
          '</div>' +
          feedbackInfo
        );
      })
      .catch(function(err) {
        btn.disabled = false;
        btn.textContent = '运行反馈校正训练';
        statusEl.textContent = '请求失败';
        resultEl.innerHTML = '<div class="metric-card"><span>反馈校正</span><strong>请求失败</strong><small>' + escHtml(err.message) + '</small></div>';
      });
  });
});
