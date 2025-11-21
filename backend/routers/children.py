from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.db.session import SessionLocal
from backend.models.child import Child
from backend.models.user import User
from backend.schemas.child_shema import ChildCreate, ChildResponse
from backend.dependencies import get_current_user # Lấy user từ token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Lấy danh sách con của user đang đăng nhập
@router.get("/", response_model=List[ChildResponse])
def get_my_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Bắt buộc phải login
):
    children = db.query(Child).filter(Child.parent_id == current_user.id).all()
    return children

# 2. Thêm con mới
@router.post("/", response_model=ChildResponse)
def add_child(
    child_in: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # (TODO: Sau này sẽ thêm code check xem reddit_username có thật không bằng PRAW)
    
    new_child = Child(
        name=child_in.name,
        age=child_in.age,
        reddit_username=child_in.reddit_username,
        parent_id=current_user.id # Gán con này cho user đang login
    )
    
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

# 3. Xóa con
@router.delete("/{child_id}")
def remove_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tìm con và đảm bảo con đó thuộc về user đang login
    child = db.query(Child).filter(
        Child.id == child_id, 
        Child.parent_id == current_user.id
    ).first()
    
    if not child:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản trẻ em này")
    
    db.delete(child)
    db.commit()
    return {"message": "Đã xóa thành công"}