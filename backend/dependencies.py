from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.models.user import User
# Import SECRET_KEY từ file security của bạn
from backend.services.security import SECRET_KEY, ALGORITHM

# --- 1. KHAI BÁO SCHEME (Quan trọng) ---
# Dòng này sẽ báo cho FastAPI biết: "Tôi dùng Token, hãy hiện nút Authorize!"
# tokenUrl chỉ là đường dẫn gợi ý cho Swagger, không ảnh hưởng logic login JSON của bạn
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 2. HÀM KIỂM TRA TOKEN ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Tìm user trong DB
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user