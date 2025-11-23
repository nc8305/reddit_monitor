from pydantic import BaseModel, Field
from typing import Optional

# Input
class ChildCreate(BaseModel):
    name: str
    age: int
    reddit_username: str  # Sử dụng snake_case, không cần alias

# Output
class ChildResponse(BaseModel):
    id: int
    name: str
    age: int
    reddit_username: str
    avatar_url: Optional[str] = None
    
    # --- ĐÃ XÓA DÒNG parent_id: int ---
    # Vì quan hệ Many-to-Many không lưu parent_id trong bảng child nữa

    class Config:
        from_attributes = True
        populate_by_name = True