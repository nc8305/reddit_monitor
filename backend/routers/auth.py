from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.auth import UserCreate, UserLogin, Token
from backend.dependencies import get_db
from backend.services.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

# --- API ĐĂNG KÝ (QUAN TRỌNG) ---
@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Kiểm tra xem email đã tồn tại chưa
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký.")
    
    # 2. Tạo đối tượng User mới (Mã hóa password)
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    
    
    db.add(new_user)  
    db.commit()       
    db.refresh(new_user)
    
    return {"message": "Tạo tài khoản thành công", "user_id": new_user.id}


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai email hoặc mật khẩu",
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}