import sys
import os
import uvicorn
from sqlalchemy import text
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import SecuritySchemeType
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
# Import các thành phần từ cấu trúc thư mục mới
from backend.db.session import engine, SessionLocal
from backend.models.user import User
from backend.db.session import engine, Base
from backend.models.interaction import Interaction
# from backend.db.models import Base  

# # Hàm tạo bảng tự động
# def init_db():
#     print("--- BẮT ĐẦU KHỞI TẠO ---")
#     print("1. Đang kiểm tra và tạo bảng (Tables) từ models.py...")
#     try:
#         # Lệnh này sẽ biến các Class trong models.py thành bảng SQL
#         Base.metadata.create_all(bind=engine)
#         print("-> OK: Đã tạo bảng thành công (hoặc bảng đã tồn tại).")
#     except Exception as e:
#         print(f"-> LỖI: Không thể tạo bảng. Chi tiết: {e}")

# Hàm kiểm tra kết nối

from fastapi import FastAPI
from backend.routers import auth # <--- Import router auth
from backend.routers import children  # Import children router

app = FastAPI()

# Add OAuth2PasswordBearer to enable Authorize button in docs
Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Custom OpenAPI schema to show Bearer Auth in Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Reddit Monitor API",
        version="1.0.0",
        description="API for Reddit Monitor with JWT Bearer Auth",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", []).append({"OAuth2PasswordBearer": []})
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Gắn router vào App
# Mọi API trong auth.py sẽ có đường dẫn bắt đầu là /api/auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(children.router, prefix="/api/children", tags=["Children"])

origins = [
    "http://localhost:5173",    # Frontend React (Vite mặc định)
    "http://localhost:3000",    # Frontend React (Create React App / Next.js)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Cho phép các nguồn này gọi API
    allow_credentials=True,
    allow_methods=["*"],        # Cho phép tất cả các method (GET, POST, OPTIONS, v.v.)
    allow_headers=["*"],        # Cho phép tất cả các header
)
# ... code cũ ...

if __name__ == "__main__":
    # Chạy 2 hàm trên
    # init_db()
    # test_connection_real_data()
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
