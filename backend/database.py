from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database type from environment (default: sqlite)
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite")

if DATABASE_TYPE.lower() == "mysql":
    # MySQL configuration
    DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
    DATABASE_PORT = os.getenv("DATABASE_PORT", "3306")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "s2x3sgo2")
    DATABASE_USER = os.getenv("DATABASE_USER", "root")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "")
    
    # Create MySQL database URL
    DATABASE_URL = f"mysql+pymysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}?charset=utf8mb4"
    
    # MySQL engine configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
else:
    # SQLite configuration (default)
    DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/ai_time_management.db")
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(DATABASE_PATH) if os.path.dirname(DATABASE_PATH) else "./data", exist_ok=True)
    
    # Create SQLite database URL
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    
    # SQLite engine configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Needed for SQLite
        echo=False
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Print database info on startup
def print_db_info():
    if DATABASE_TYPE.lower() == "mysql":
        print(f"📊 Using MySQL Database: {DATABASE_NAME}")
        print(f"🔗 Host: {DATABASE_HOST}:{DATABASE_PORT}")
    else:
        print(f"📊 Using SQLite Database: {DATABASE_PATH}")
        print(f"💡 Tip: Set DATABASE_TYPE=mysql to use MySQL instead")

