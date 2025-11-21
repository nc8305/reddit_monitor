from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
# Lưu ý đường dẫn này: backend.db.session phải tồn tại
from backend.db.session import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    children = relationship("Child", back_populates="parent")