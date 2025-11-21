from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.session import Base

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    reddit_username = Column(String, nullable=False)
    avatar = Column(String, default="default_avatar.png")
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    parent = relationship("User", back_populates="children")
