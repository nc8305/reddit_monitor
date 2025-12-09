from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.notification_settings import NotificationSettings
from backend.models.user import User
from backend.schemas.notification_settings import (
    NotificationSettingsResponse,
    NotificationSettingsUpdate
)
from backend.dependencies import get_current_user, get_db

router = APIRouter()

@router.get("/notifications", response_model=NotificationSettingsResponse)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notification preferences for current user"""
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()
    
    # Nếu chưa có settings, tạo mặc định
    if not settings:
        settings = NotificationSettings(
            user_id=current_user.id,
            in_app=True,
            email=True,
            high_severity=True,
            medium_severity=True,
            low_severity=False,
            self_harm_only=False,
            frequency="instant"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/notifications", response_model=NotificationSettingsResponse)
def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences for current user"""
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()
    
    # Nếu chưa có settings, tạo mới
    if not settings:
        settings = NotificationSettings(user_id=current_user.id)
        db.add(settings)
    
    # Update các fields
    settings.in_app = settings_update.in_app
    settings.email = settings_update.email
    settings.high_severity = settings_update.high_severity
    settings.medium_severity = settings_update.medium_severity
    settings.low_severity = settings_update.low_severity
    settings.self_harm_only = settings_update.self_harm_only
    settings.frequency = settings_update.frequency
    
    db.commit()
    db.refresh(settings)
    
    return settings

