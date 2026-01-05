import sys
from pathlib import Path

import pytest

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.models import Base
import app.db.session as db_session
import app.db.init_db as init_db

TEST_DB_PATH = Path("test.db")


@pytest.fixture(scope="session")
def engine():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    engine = create_engine(
        f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)

    db_session.engine = engine
    db_session.SessionLocal = sessionmaker(
        bind=engine, autocommit=False, autoflush=False, future=True
    )
    init_db.engine = engine

    yield engine

    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture()
def db(engine):
    session_local = sessionmaker(
        bind=engine, autocommit=False, autoflush=False, future=True
    )
    db = session_local()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db):
    def _get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[db_session.get_db] = _get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
