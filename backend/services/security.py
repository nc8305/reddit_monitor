from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

# CẤU HÌNH (Nên để trong file .env nhưng tạm viết đây cho gọn)
SECRET_KEY = "chuoi_bi_mat_sieu_kho_doan_cua_ban"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Hàm băm mật khẩu (Dùng khi Đăng ký)
def get_password_hash(password):
    return pwd_context.hash(password)

# 2. Hàm kiểm tra mật khẩu (Dùng khi Đăng nhập)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3. Hàm tạo Token JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt