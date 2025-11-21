from pydantic import BaseModel
from typing import Optional, List

# --- Input Models (Dữ liệu Frontend gửi lên) ---
class ChildCreate(BaseModel):
    name: str
    age: int
    redditUsername: str

# --- Output Models (Dữ liệu trả về cho Frontend) ---
class ChildResponse(BaseModel):
    id: str # hoặc int tùy DB
    name: str
    age: int
    avatar: Optional[str] = "default_avatar.png"
    redditUsername: str
    
    class Config:
        from_attributes = True # Cho phép đọc dữ liệu từ SQLAlchemy model

class ChildConnectResponse(BaseModel):
    id: str
    name: str
    status: str
    message: str