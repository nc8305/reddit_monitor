from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.session import Base
# --- [QUAN TRỌNG] Import từ file associations ---
from backend.models.associations import parent_child_link

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    reddit_username = Column(String, nullable=False)
    avatar_url = Column(String, default="default_avatar.png")
    
    # Quan hệ Many-to-Many với User
    parents = relationship("User", secondary=parent_child_link, back_populates="children")