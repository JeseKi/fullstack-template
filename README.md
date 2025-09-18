# Backend Template (Auth + DB + Example)

一个极简、可直接运行的 FastAPI 后端模板，只保留核心能力：认证与数据库，并附带最小示例模块。以中文注释与统一规范示范模块开发方式。

## 技术栈
- FastAPI / Uvicorn
- SQLAlchemy (SQLite)
- Pydantic / pydantic-settings
- python-jose[jwt] / bcrypt
- pytest / pytest-asyncio
- loguru

## 结构
```
./
├── main.py                # 应用入口（初始化DB，挂载 auth/example）
├── run.py                 # 本地启动
├── config.py              # 全局配置（APP_ENV/CORS/DB路径）
├── database.py            # Base/engine/SessionLocal/get_db/init_database
├── schemas.py             # 跨模块轻量模型（DatabaseInfo）
├── auth/                  # 认证最小实现
│   ├── config.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── router.py
└── example_module/        # 示例模块（演示规范）
    ├── models.py
    ├── schemas.py
    └── router.py
```

## 运行
```bash
# 建议使用 conda 管理环境
conda create -n backend-template python=3.11 -y
conda activate backend-template

pip install -r requirements.txt

# 开发运行
python run.py
# 或
uvicorn main:app --reload --port 4000

# 初始化数据库（可选）
python -m scripts.initdb --check
python -m scripts.initdb --reset
```

## 环境变量（.env）
```ini
APP_ENV=dev
APP_SECRET_KEY=change-me
ALLOWED_ORIGINS=["http://localhost:3000"]
DATABASE_PATH=database.db
```

## 新增模块步骤
1) 新建目录 `<module>/models.py, schemas.py, router.py`
2) 在 `database.init_database()` 中导入 `<module>.models`（确保建表）
3) 在 `main.py` 中 `app.include_router(<module>.router)`

## 规范要点
- 文件头注释需包含：功能、公开接口、内部方法、说明。
- 所有注释与日志均使用中文。
- 仅测试模块公开接口，包含边界条件与错误路径。
- 数据库访问在路由中使用 `asyncio.to_thread` 包裹同步 ORM 调用。

## DAO 层最佳实践
- 何时使用 DAO：当服务层中出现复用的持久化逻辑或单元测试需要隔离数据库访问细节时。
- 放置位置：`dao/dao_base.py` 提供基类与线程池工具；各模块在自身目录下定义 `dao.py`。
- 约定：
  - DAO 类继承 `BaseDAO`，构造函数接收 `Session`。
  - DAO 方法只做持久化操作，不承载业务规则（业务在 service 层）。
  - 路由不可直接调用 DAO，应由 service 统一编排。
- 线程池：在路由层通过 `run_in_thread` 执行 service 的同步方法，避免事件循环阻塞。

示例（节选）：
```python
# example_module/dao.py
class ExampleItemDAO(BaseDAO):
    def create(self, name: str) -> Item: ...

# example_module/service.py
def create_item(db: Session, name: str) -> Item:
    dao = ExampleItemDAO(db)
    return dao.create(name)

# example_module/router.py
@router.post("/items")
async def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    return await run_in_thread(lambda: service.create_item(db, payload.name))
```
