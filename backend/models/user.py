from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.db.session import Base
# --- [QUAN TRỌNG] Import từ file associations ---
from backend.models.associations import parent_child_link

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    
    # Quan hệ Many-to-Many với Child
    # secondary=parent_child_link: Dùng biến đã import ở trên
    children = relationship("Child", secondary=parent_child_link, back_populates="parents")