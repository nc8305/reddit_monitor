# backend/db/models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class RedditPost(Base):
    __tablename__ = "reddit_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    # Lưu ý: Tuyệt đối không lưu password thô, chỉ lưu chuỗi đã mã hóa (hashed)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)