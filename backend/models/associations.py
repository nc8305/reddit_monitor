from sqlalchemy import Table, Column, Integer, String, ForeignKey
from backend.db.session import Base

# Bảng trung gian nằm riêng ở đây để cả User và Child đều có thể gọi nó
# mà không gây lỗi vòng lặp.
parent_child_link = Table(
    "parent_child_link",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("child_id", Integer, ForeignKey("children.id"), primary_key=True),
    Column("full_name", String)  # Lưu full_name từ bảng users
)