from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    interaction_id = Column(String, ForeignKey("interactions.id"), nullable=True)
    
    severity = Column(String)  # high, medium
    title = Column(String)
    description = Column(String)
    status = Column(String, default="new")  # new, acknowledged
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Quan hệ
    child = relationship("Child")