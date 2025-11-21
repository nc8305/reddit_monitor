from pydantic import BaseModel, EmailStr

# Input khi Đăng ký
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

# Input khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Output khi trả về Token
class Token(BaseModel):
    access_token: str
    token_type: str