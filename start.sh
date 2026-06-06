#!/bin/bash
cd "$(dirname "$0")"
echo "Starting A股涨停板预测器服务..."
/opt/homebrew/bin/python3.12 -u server.py
