from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.db.session import SessionLocal
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User
from backend.dependencies import get_current_user, get_db

router = APIRouter()

@router.get("/emerging")
def get_emerging_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Lấy danh sách con của user
    child_ids = [c.id for c in current_user.children]
    if not child_ids: return []

    # Thống kê: Category nào xuất hiện nhiều nhất?
    stats = db.query(
        Interaction.category,
        func.count(Interaction.id).label("count"),
        func.count(Interaction.subreddit.distinct()).label("communities")
    ).filter(
        Interaction.child_id.in_(child_ids),
        Interaction.category.isnot(None)
    ).group_by(Interaction.category).order_by(desc("count")).limit(5).all()

    results = []
    for cat, count, sub_count in stats:
        # Logic giả lập biểu đồ (vì chưa có dữ liệu lịch sử theo ngày)
        fake_chart = [
            {"name": "Mon", "value": int(count * 0.2)},
            {"name": "Tue", "value": int(count * 0.4)},
            {"name": "Wed", "value": int(count * 0.3)},
            {"name": "Thu", "value": int(count * 0.6)},
            {"name": "Fri", "value": int(count * 0.8)},
            {"name": "Sat", "value": count},
            {"name": "Sun", "value": int(count * 0.5)},
        ]

        results.append({
            "id": cat,
            "name": str(cat).replace("_", " & ").title(),
            "severity": "medium", # Tạm để medium
            "communities": sub_count,
            "mentions": count,
            "change": "+New",
            "description": f"Detected {count} interactions related to {cat}.",
            "data": fake_chart
        })
        
    return results