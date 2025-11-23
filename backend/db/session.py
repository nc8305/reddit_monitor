from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base 
from backend.config.env_settings import env_settings

DATABASE_URL = env_settings.DATABASE_URL

# --- SỬA DÒNG NÀY ---
# Thêm tham số pool_pre_ping=True và pool_recycle
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Tự động kiểm tra kết nối trước khi dùng (Fix lỗi connection closed)
    pool_recycle=3600,       # Tự động tái tạo kết nối mỗi 1 giờ để tránh timeout
    pool_size=20,            # Tăng kích thước pool nếu worker xử lý nhiều
    max_overflow=10
)
# --------------------

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()