import sys
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import Database & Models
from backend.db.session import engine, Base 
from backend.models.user import User
from backend.models.child import Child
from backend.models.interaction import Interaction
from backend.models.alert import Alert # Import Model để tạo bảng
from backend.models.notification_settings import NotificationSettings
from backend.routers import auth
from backend.routers import children
from backend.routers import alerts  
from backend.routers import trends 
from backend.routers import settings  

Base.metadata.create_all(bind=engine)

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(children.router, prefix="/api/children", tags=["Children"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"]) 
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
# ----------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
