import json
import sys
import os
from kafka import KafkaConsumer
from sqlalchemy.orm import Session

# 1. Setup đường dẫn để Python tìm thấy module backend
sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.services.reddit_service import get_user_interactions

# --- QUAN TRỌNG: IMPORT ĐẦY ĐỦ CÁC MODEL ---
# SQLAlchemy cần "nhìn thấy" tất cả các Class này để map quan hệ (Child <-> User)
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User 
# -------------------------------------------

def run_worker():
    print("--- Kafka Worker đang chạy... Đang chờ task ---")
    
    # 2. Khởi tạo Consumer
    consumer = KafkaConsumer(
        'reddit_scan_tasks',
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest', # Đọc lại tin nhắn cũ nếu bị trôi
        enable_auto_commit=True,
        group_id='reddit_monitor_group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    for message in consumer:
        task = message.value
        child_id = task['child_id']
        username = task['username']
        
        print(f"[*] Nhận task: Quét dữ liệu cho {username} (Child ID: {child_id})")
        
        # 3. Gọi PRAW lấy dữ liệu thật
        try:
            interactions_data = get_user_interactions(username)
        except Exception as e:
            print(f"   -> Lỗi PRAW: {e}")
            continue
        
        if not interactions_data:
            print("   -> Không tìm thấy dữ liệu mới.")
            continue

        # 4. Lưu vào Database
        db = SessionLocal()
        try:
            count = 0
            for item in interactions_data:
                # Kiểm tra trùng lặp trước khi lưu
                exists = db.query(Interaction).filter(Interaction.id == item['id']).first()
                if not exists:
                    new_inter = Interaction(
                        id=item['id'],
                        child_id=child_id,
                        type=item['type'],
                        content=item['content'],
                        subreddit=item['subreddit'],
                        sentiment=item['sentiment'],
                        risk_level=item['risk'],
                        url=item['url']
                        # created_at sẽ tự động lấy giờ hiện tại theo database
                    )
                    db.add(new_inter)
                    count += 1
            
            db.commit()
            print(f"   -> Đã lưu {count} tương tác mới vào DB.")
        except Exception as e:
            print(f"   -> Lỗi DB: {e}")
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    run_worker()