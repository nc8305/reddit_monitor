from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
from datetime import datetime, timedelta
from io import BytesIO
from backend.db.session import SessionLocal
from backend.models.child import Child
from backend.models.user import User
from backend.models.interaction import Interaction # Import model Interaction
from backend.schemas.child import ChildCreate, ChildResponse
from backend.dependencies import get_current_user, get_db
from backend.services.reddit_service import get_user_top_subreddits
from backend.kafka_producer import send_scan_request # Import producer

router = APIRouter()

@router.get("/", response_model=List[ChildResponse])
def get_my_children(current_user: User = Depends(get_current_user)):
    return current_user.children
    
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    children_stats = []
    total_activity = 0
    
    for child in current_user.children:
        # Đếm số lượng interaction của từng bé trong DB
        count = db.query(Interaction).filter(Interaction.child_id == child.id).count()
        total_activity += count
        
        children_stats.append({
            "id": child.id,
            "name": child.name,
            "username": child.reddit_username,
            "scanned_count": count
        })
        
    return {
        "total_children": len(current_user.children),
        "total_activity": total_activity,
        "details": children_stats
    }

@router.post("/", response_model=ChildResponse)
def add_child(child_in: ChildCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_child = Child(name=child_in.name, age=child_in.age, reddit_username=child_in.reddit_username)
    new_child.parents.append(current_user)
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

@router.delete("/{child_id}")
def remove_child(child_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child: raise HTTPException(status_code=404, detail="Child not found")
    current_user.children.remove(target_child)
    db.commit()
    return {"message": "Deleted"}

@router.get("/{child_id}/subreddits")
def get_child_subreddits(child_id: int, current_user: User = Depends(get_current_user)):
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child: raise HTTPException(status_code=404, detail="Child not found")
    clean_username = target_child.reddit_username.replace("u/", "").strip()
    return get_user_top_subreddits(clean_username)

@router.post("/{child_id}/scan")
def trigger_scan(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
  
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    clean_username = target_child.reddit_username.replace("u/", "").strip()
    
    # 2. Gửi message vào Kafka
    send_scan_request(target_child.id, clean_username)
    
    return {"message": "Đang quét dữ liệu ngầm..."}

# --- API MỚI 2: Lấy dữ liệu từ DB (Nhanh) ---
@router.get("/{child_id}/interactions")
def get_child_interactions_from_db(
    child_id: int,
    sentiment: Optional[str] = None,  # Thêm tham số lọc
    risk_level: Optional[str] = None, # Thêm tham số lọc
    search: Optional[str] = None,  # Search trong content
    subreddit: Optional[str] = None,  # Filter theo subreddit
    date_range: Optional[str] = None,  # Date range filter: "today", "7days", "30days", "all"
    limit: Optional[int] = 100,  # Limit số lượng kết quả
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Kiểm tra quyền truy cập
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    # 2. Xây dựng Query cơ bản
    query = db.query(Interaction).filter(Interaction.child_id == child_id)

    # 3. Áp dụng bộ lọc nếu có tham số truyền vào
    if sentiment and sentiment != "all":
        # So sánh không phân biệt hoa thường
        query = query.filter(Interaction.sentiment.ilike(sentiment))
    
    if risk_level and risk_level != "all":
        query = query.filter(Interaction.risk_level == risk_level)
    
    if search and search.strip():
        # Tìm kiếm trong content
        query = query.filter(Interaction.content.ilike(f"%{search.strip()}%"))
    
    if subreddit and subreddit != "all":
        # Filter theo subreddit
        query = query.filter(Interaction.subreddit.ilike(f"%{subreddit}%"))
    
    # Date range filter
    if date_range and date_range != "all":
        now = datetime.now()
        if date_range == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Interaction.created_at >= start_date)
        elif date_range == "7days":
            start_date = now - timedelta(days=7)
            query = query.filter(Interaction.created_at >= start_date)
        elif date_range == "30days":
            start_date = now - timedelta(days=30)
            query = query.filter(Interaction.created_at >= start_date)

    # 4. Lấy dữ liệu và sắp xếp mới nhất
    data = query.order_by(Interaction.created_at.desc()).limit(limit or 100).all()
    
    return data

@router.get("/{child_id}/report")
def generate_report(
    child_id: int,
    anonymize: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate report for child's Reddit activity"""
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Get all interactions
    interactions = db.query(Interaction).filter(
        Interaction.child_id == child_id
    ).order_by(Interaction.created_at.desc()).all()
    
    # Get subreddits data
    try:
        subreddits_data = get_user_top_subreddits(
            target_child.reddit_username.replace("u/", "").strip()
        )
    except:
        subreddits_data = []
    
    # Generate simple text-based report (PDF generation can be enhanced with reportlab later)
    report_lines = []
    report_lines.append("=" * 60)
    report_lines.append("REDDIT ACTIVITY MONITORING REPORT")
    report_lines.append("=" * 60)
    report_lines.append("")
    report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append(f"Child Name: {target_child.name}")
    if not anonymize:
        report_lines.append(f"Reddit Username: u/{target_child.reddit_username}")
    else:
        report_lines.append(f"Reddit Username: [ANONYMIZED]")
    report_lines.append(f"Age: {target_child.age}")
    report_lines.append("")
    report_lines.append("-" * 60)
    report_lines.append("SUMMARY")
    report_lines.append("-" * 60)
    report_lines.append(f"Total Interactions: {len(interactions)}")
    
    # Risk level breakdown
    risk_counts = {"high": 0, "medium": 0, "low": 0}
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    for interaction in interactions:
        if interaction.risk_level in risk_counts:
            risk_counts[interaction.risk_level] += 1
        if interaction.sentiment in sentiment_counts:
            sentiment_counts[interaction.sentiment] += 1
    
    report_lines.append(f"  - High Risk: {risk_counts['high']}")
    report_lines.append(f"  - Medium Risk: {risk_counts['medium']}")
    report_lines.append(f"  - Low Risk: {risk_counts['low']}")
    report_lines.append("")
    report_lines.append("Sentiment Breakdown:")
    report_lines.append(f"  - Positive: {sentiment_counts['Positive']}")
    report_lines.append(f"  - Neutral: {sentiment_counts['Neutral']}")
    report_lines.append(f"  - Negative: {sentiment_counts['Negative']}")
    report_lines.append("")
    
    if subreddits_data:
        report_lines.append("-" * 60)
        report_lines.append("TOP SUBREDDITS")
        report_lines.append("-" * 60)
        for idx, sub in enumerate(subreddits_data[:10], 1):
            report_lines.append(f"{idx}. r/{sub.get('name', 'N/A')}")
            report_lines.append(f"   Risk Level: {sub.get('riskLevel', 'N/A')}")
            report_lines.append(f"   Risk Score: {sub.get('riskScore', 'N/A')}")
            report_lines.append("")
    
    report_lines.append("-" * 60)
    report_lines.append("RECENT INTERACTIONS")
    report_lines.append("-" * 60)
    for idx, interaction in enumerate(interactions[:20], 1):
        report_lines.append(f"{idx}. [{interaction.type.upper()}] r/{interaction.subreddit}")
        report_lines.append(f"   Risk: {interaction.risk_level} | Sentiment: {interaction.sentiment}")
        report_lines.append(f"   Date: {interaction.created_at.strftime('%Y-%m-%d %H:%M') if interaction.created_at else 'N/A'}")
        content_preview = interaction.content[:200] + "..." if len(interaction.content) > 200 else interaction.content
        report_lines.append(f"   Content: {content_preview}")
        report_lines.append("")
    
    report_text = "\n".join(report_lines)
    
    # Return as text file (can be enhanced to PDF with reportlab)
    return Response(
        content=report_text,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=report_{target_child.name}_{datetime.now().strftime('%Y%m%d')}.txt"
        }
    )