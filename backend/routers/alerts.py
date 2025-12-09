from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.alert import Alert
from backend.models.child import Child
from backend.models.user import User
from backend.dependencies import get_current_user, get_db

router = APIRouter()

@router.get("/")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    child_ids = [c.id for c in current_user.children]
    
    # Lấy alert mới nhất
    alerts = db.query(Alert).filter(Alert.child_id.in_(child_ids)).order_by(Alert.created_at.desc()).all()
    
    res = []
    for a in alerts:
        child = db.query(Child).filter(Child.id == a.child_id).first()
        res.append({
            "id": a.id,
            "childName": child.name if child else "Unknown",
            "childAvatar": child.name[0] if child else "?",
            "severity": a.severity,
            "category": "Safety",
            "title": a.title,
            "description": a.description,
            "timestamp": str(a.created_at.strftime("%Y-%m-%d %H:%M")),
            "acknowledged": a.status == "acknowledged",
            "url": "#"
        })
    return res

@router.put("/{alert_id}/ack")
def acknowledge(
    alert_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Acknowledge an alert - chỉ user có quyền với child đó mới được acknowledge"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Kiểm tra quyền: alert phải thuộc về một child của current_user
    child_ids = [c.id for c in current_user.children]
    if alert.child_id not in child_ids:
        raise HTTPException(status_code=403, detail="You don't have permission to acknowledge this alert")
    
    alert.status = "acknowledged"
    db.commit()
    return {"status": "ok"}