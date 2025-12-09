from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.session import Base

class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Alert Triggers
    high_severity = Column(Boolean, default=True)
    medium_severity = Column(Boolean, default=True)
    low_severity = Column(Boolean, default=False)
    self_harm_only = Column(Boolean, default=False)
    
    # Delivery Channels
    in_app = Column(Boolean, default=True)
    email = Column(Boolean, default=True)
    
    # Frequency: "instant", "daily", "weekly"
    frequency = Column(String, default="instant")
    
    # Relationship - sử dụng back_populates thay vì backref
    user = relationship("User", back_populates="notification_settings")

