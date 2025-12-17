# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:////tmp/tickets.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

_db_initialized = False

def init_db():
    global _db_initialized
    if not _db_initialized:
        import main  # asegura que los modelos estén cargados
        Base.metadata.create_all(bind=engine)
        _db_initialized = True
