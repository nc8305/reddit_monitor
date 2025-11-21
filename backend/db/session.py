from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# --- 1. THÊM DÒNG IMPORT NÀY ---
from sqlalchemy.ext.declarative import declarative_base 
from backend.config.env_settings import env_settings
# Lấy URL từ hàm property chúng ta vừa tạo
DATABASE_URL = env_settings.DATABASE_URL

# Tạo Engine
engine = create_engine(DATABASE_URL)

# Tạo SessionLocal (để dùng trong các nơi khác)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Hàm tiện ích để lấy db session (Dependency Injection - thường dùng trong FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()