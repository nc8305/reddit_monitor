import sys
import os
from backend.db.session import engine, Base
# Import 2 bảng quan trọng này để Python biết cần tạo gì
from backend.models.child import Child, parent_child_link 
from backend.models.user import User

def fix_db_structure():
    print("--- BẮT ĐẦU NÂNG CẤP DATABASE ---")
    
    # 1. Xóa bảng cũ (để tránh lỗi trùng lặp)
    print("1. Đang xóa bảng 'parent_child_link' và 'children' cũ (nếu có)...")
    try:
        parent_child_link.drop(engine, checkfirst=True)
        Child.__table__.drop(engine, checkfirst=True)
        print("-> Đã dọn dẹp xong.")
    except Exception as e:
        print(f"-> Lưu ý (không sao): {e}")

    # 2. Tạo lại bảng mới
    print("2. Đang gửi lệnh tạo bảng lên Supabase...")
    try:
        Base.metadata.create_all(bind=engine)
        print("-> THÀNH CÔNG! Đã tạo xong bảng 'children' và 'parent_child_link'.")
    except Exception as e:
        print(f"-> LỖI: {e}")
        print("Gợi ý: Kiểm tra lại file .env xem kết nối DB đúng chưa.")

if __name__ == "__main__":
    fix_db_structure()