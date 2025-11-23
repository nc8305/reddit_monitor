from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from backend.db.session import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String, primary_key=True) # ID từ Reddit (vd: t1_k8s9d)
    child_id = Column(Integer, ForeignKey("children.id"))
    type = Column(String) # "post" hoặc "comment"
    content = Column(String)
    subreddit = Column(String)
    sentiment = Column(String)
    risk_level = Column(String)
    url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())