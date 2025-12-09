from pydantic import BaseModel
from typing import Optional

class NotificationSettingsBase(BaseModel):
    in_app: bool = True
    email: bool = True
    high_severity: bool = True
    medium_severity: bool = True
    low_severity: bool = False
    self_harm_only: bool = False
    frequency: str = "instant"  # "instant", "daily", "weekly"

class NotificationSettingsResponse(NotificationSettingsBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class NotificationSettingsUpdate(NotificationSettingsBase):
    pass

