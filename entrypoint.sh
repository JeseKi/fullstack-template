#!/bin/sh
set -e

# 确保 data 目录存在（volume 挂载时可能为空）
mkdir -p /app/data

# 运行数据库迁移
echo "正在运行数据库迁移..."
alembic upgrade head
echo "数据库迁移完成"

# 启动应用
exec python run.py
