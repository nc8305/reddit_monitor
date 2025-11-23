from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.db.session import SessionLocal
from backend.models.child import Child
from backend.models.user import User
# Sửa import schema cho đúng tên file bạn đang dùng (child.py hoặc child_shema.py)
from backend.schemas.child import ChildCreate, ChildResponse 
from backend.dependencies import get_current_user, get_db 

router = APIRouter()

# 1. Lấy danh sách con của user đang đăng nhập
@router.get("/", response_model=List[ChildResponse])
def get_my_children(
    current_user: User = Depends(get_current_user)
):
    # Lấy trực tiếp từ quan hệ Many-to-Many
    return current_user.children

# 2. Thêm con mới
@router.post("/", response_model=ChildResponse)
def add_child(
    child_in: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tạo đối tượng Child
    new_child = Child(
        name=child_in.name,
        age=child_in.age,
        reddit_username=child_in.reddit_username, 
    )

    # --- QUAN TRỌNG: Chỉ cần dòng này là đủ ---
    # SQLAlchemy sẽ tự động insert vào bảng trung gian khi commit
    new_child.parents.append(current_user)
    
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    
    # --- ĐÃ XÓA ĐOẠN db.execute(...) GÂY LỖI ---
    
    return new_child

# 3. Xóa con
@router.delete("/{child_id}")
def remove_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tìm con trong danh sách của user hiện tại
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản trẻ em này trong danh sách của bạn")
    
    # Xóa child
    db.delete(target_child)
    db.commit()
    return {"message": "Đã xóa thành công"}