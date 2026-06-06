#!/bin/bash
cd "$(dirname "$0")"

# 检测 Python 3.12
PYTHON=""
for cmd in /opt/homebrew/bin/python3.12 python3.12; do
    if command -v $cmd &>/dev/null; then
        V=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
        if [ "$V" = "3.12" ]; then
            PYTHON=$(command -v $cmd)
            break
        fi
    fi
done

if [ -z "$PYTHON" ]; then
    echo "错误：未找到 Python 3.12"
    echo "安装: brew install python@3.12"
    exit 1
fi

echo "==================================="
echo " A股涨停板预测器 + 交易记录"
echo "==================================="
echo " Python: $($PYTHON --version)"
echo " 端口:   4173"
echo " 地址:   http://localhost:4173"
echo "==================================="
echo ""

# 清理旧进程
for pid in $(lsof -ti :4173 2>/dev/null); do
    kill "$pid" 2>/dev/null
done
sleep 1

# 用 -u 无缓冲运行，并持续重启
while true; do
    $PYTHON -u server.py 2>&1
    echo "[$(date '+%H:%M:%S')] 服务异常退出，2秒后重启..."
    sleep 2
done &

# 等待端口就绪
for i in 1 2 3 4 5; do
    sleep 1
    if lsof -i :4173 &>/dev/null; then
        echo " 服务已启动 → http://localhost:4173"
        open http://localhost:4173 2>/dev/null
        exit 0
    fi
done

echo " 错误：服务启动失败"
exit 1
