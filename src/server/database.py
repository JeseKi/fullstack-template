# -*- coding: utf-8 -*-
"""
数据库连接与初始化（极简模板版）

公开接口：
- `Base`：SQLAlchemy 声明基类
- `engine`：数据库引擎
- `SessionLocal`：会话工厂
- `get_db()`：FastAPI 依赖获取会话
- `init_database()`：创建所有表
- `get_database_info()`：返回数据库文件信息

内部方法：
- 无

说明：
- 使用 SQLite，路由中通过 `asyncio.to_thread` 调用同步 ORM，避免阻塞事件循环。
"""

from __future__ import annotations

import os
from typing import Any, Iterator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path
from loguru import logger

from src.server.config import global_config
from src.server.schemas import DatabaseInfo

Base: Any = declarative_base()
PROJECT_ROOT = Path.cwd()
DATABASE_PATH = PROJECT_ROOT / global_config.database_path

SQLALCHEMY_DATABASE_URL = f"{global_config.database_protocol}:///{DATABASE_PATH}"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 特有
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Iterator:
    """获取数据库会话（FastAPI 依赖）。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database() -> None:
    """初始化数据库并创建所有表。"""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # 测试环境清理本地文件数据库，确保干净
    try:
        if os.getenv("PYTEST_CURRENT_TEST") or global_config.app_env == "test":
            try:
                engine.dispose()
            except Exception:
                pass
            if DATABASE_PATH.exists():
                DATABASE_PATH.unlink()
                logger.info("测试环境：已删除数据库文件，确保干净环境")
    except Exception as e:
        logger.warning(f"测试环境数据库清理失败（可忽略）：{e}")

    # 延迟导入模型，避免循环依赖
    try:
        from src.server.auth import models as _1  # noqa
        from src.server.example_module import models as _2  # noqa
    except Exception as e:
        logger.warning(f"导入模型时出现警告：{e}")

    Base.metadata.create_all(bind=engine)
    logger.info(f"数据库已初始化：{DATABASE_PATH}")

    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    logger.info(f"已创建数据库表: {tables}")

    # 引导：创建初始管理员（如不存在）
    try:
        from src.server.auth.service import bootstrap_default_admin  # 延迟导入避免循环

        bootstrap_default_admin(SessionLocal())
    except Exception as e:
        logger.warning(f"引导管理员失败（可忽略开发环境）：{e}")


def import_all_models() -> None:
    """导入所有模型。"""
    from src.server.auth import models as _1  # noqa
    from src.server.example_module import models as _2  # noqa


def get_database_info() -> DatabaseInfo:
    """获取数据库信息。"""
    return DatabaseInfo(
        database_path=str(DATABASE_PATH),
        database_exists=DATABASE_PATH.exists(),
        database_size=DATABASE_PATH.stat().st_size if DATABASE_PATH.exists() else None,
    )
