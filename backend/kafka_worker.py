import json
import sys
import os
import time
import socket
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable, KafkaError
from sqlalchemy.orm import Session
from sqlalchemy import text

# Setup đường dẫn
sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.services.reddit_service import get_user_interactions
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User
from backend.models.alert import Alert  # Import Alert
from backend.models.notification_settings import NotificationSettings  # Import để SQLAlchemy resolve relationship


try:
    from ai_models.classify import predict_sentiment
    from ai_models.categorize import predict_labels
    from ai_models.summarize import summarize_text
    AI_MODELS_AVAILABLE = True
    print("-> ✅ AI Models đã sẵn sàng (Hate Speech Classification, Categorization, Summarization)")
except ImportError as e:
    print(f"-> ⚠️  Cảnh báo: Không thể import AI models: {e}")
    print("-> ⚠️  Worker sẽ chạy với fallback functions (không có AI)")
    AI_MODELS_AVAILABLE = False
    # Hàm dự phòng
    def predict_sentiment(t): return "non-hate"
    def predict_labels(t): return "general"
    def summarize_text(t, **k): return t[:100]
except Exception as e:
    print(f"-> ⚠️  Lỗi khi load AI models: {e}")
    print("-> ⚠️  Worker sẽ chạy với fallback functions")
    AI_MODELS_AVAILABLE = False
    def predict_sentiment(t): return "non-hate"
    def predict_labels(t): return "general"
    def summarize_text(t, **k): return t[:100]

# --- 2. HÀM PHÂN TÍCH ---
def analyze_content(content, verbose=False):
    """
    Phân tích nội dung sử dụng AI models
    
    Returns:
        tuple: (ai_risk, categories, summary)
    """
    if not content: 
        return "low", "General", ""
    
    # A. Đánh giá rủi ro (Hate Speech Detection)
    try:
        # Lấy kết quả với probability để có thể xác định medium risk
        ai_result = predict_sentiment(content, return_probability=True)
        ai_label = ai_result['label']
        hate_prob = ai_result['probabilities']['hate']
        
        # Xác định risk level dựa trên probability:
        # - hate_prob >= 0.7: high risk
        # - hate_prob >= 0.4: medium risk  
        # - hate_prob < 0.4: low risk
        if hate_prob >= 0.7:
            ai_risk = "high"
        elif hate_prob >= 0.4:
            ai_risk = "medium"
        else:
            ai_risk = "low"
            
        if verbose:
            print(f"         AI Risk: {ai_label} (prob: {hate_prob:.3f}) -> {ai_risk}")
    except Exception as e:
        ai_risk = "low"
        if verbose:
            print(f"         ⚠️  Lỗi AI sentiment: {e}")
    
    # B. Phân loại chủ đề (19 categories)
    try:
        categories = predict_labels(content)
        if isinstance(categories, list): 
            categories = ", ".join(categories)
        if verbose and categories:
            print(f"         AI Categories: {categories}")
    except Exception as e:
        categories = "Uncategorized"
        if verbose:
            print(f"         ⚠️  Lỗi AI categorization: {e}")

    # C. Tóm tắt nội dung
    summary = content
    if len(content) > 50:
        try:
            summary = summarize_text(content, max_length=60, min_length=10)
            if verbose:
                print(f"         AI Summary: {summary[:50]}...")
        except Exception as e:
            if verbose:
                print(f"         ⚠️  Lỗi AI summarization: {e}")
            pass 
            
    return ai_risk, categories, summary

def check_kafka_available(host='localhost', port=9092, max_retries=30, delay=2):
    """Kiểm tra Kafka có sẵn sàng chưa bằng cách thử kết nối socket"""
    for attempt in range(max_retries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                return True
        except:
            pass
        if attempt < max_retries - 1:
            print(f"   -> Đang đợi Kafka sẵn sàng... ({attempt + 1}/{max_retries})")
            time.sleep(delay)
    return False

def create_consumer_with_retry(max_retries=5, retry_delay=3):
    """Tạo Kafka consumer với retry logic"""
    for attempt in range(max_retries):
        try:
            consumer = KafkaConsumer(
                'reddit_scan_tasks',
                bootstrap_servers=['localhost:9092'],
                # Chỉ nhận tin nhắn mới khi worker start
                auto_offset_reset='latest', 
                enable_auto_commit=True,
                # Group ID để quản lý offset
                group_id='reddit_monitor_group_v5', 
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                # Session timeout (phải nhỏ hơn request timeout)
                session_timeout_ms=10000,
                # Request timeout (phải lớn hơn session timeout)
                request_timeout_ms=40000,
                # Max poll interval
                max_poll_interval_ms=300000
            )
            # Test connection - Kafka sẽ tự động tạo topic nếu chưa có (auto.create.topics.enable=true)
            # Consumer sẽ tự động subscribe vào topic khi có message
            return consumer
        except (NoBrokersAvailable, KafkaError) as e:
            if attempt < max_retries - 1:
                print(f"   -> Thử kết nối lại... ({attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                raise e
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"   -> Lỗi kết nối: {e}. Thử lại... ({attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                raise e
    return None


def run_worker():
    print("--- Kafka Worker đang chạy... ---")
    print("-> Đang kiểm tra kết nối Kafka...")
    
    # Bước 1: Kiểm tra port có mở không
    if not check_kafka_available():
        print("-> Lỗi: Không thể kết nối đến Kafka trên localhost:9092")
        print("-> Vui lòng đảm bảo:")
        print("   1. Kafka container đang chạy: sudo docker ps")
        print("   2. Chờ vài giây để Kafka khởi động hoàn toàn")
        print("   3. Kiểm tra logs: sudo docker logs kafka")
        return
    
    print("-> Port 9092 đã sẵn sàng, đang tạo consumer...")
    
    # Bước 2: Tạo consumer với retry
    try:
        consumer = create_consumer_with_retry(max_retries=5, retry_delay=3)
        print("-> ✅ Kafka Consumer đã kết nối thành công!")
        print("-> Đang đợi messages từ topic 'reddit_scan_tasks'...")
    except Exception as e:
        print(f"-> ❌ Lỗi kết nối Kafka sau nhiều lần thử: {e}")
        print("-> Vui lòng kiểm tra:")
        print("   1. Kafka container: sudo docker ps")
        print("   2. Kafka logs: sudo docker logs kafka")
        print("   3. Đợi thêm vài giây và thử lại")
        return
    
    # Bước 3: Bắt đầu consume messages
    print(f"-> 📡 Consumer đã subscribe vào topic: {consumer.subscription()}")
    print(f"-> ⏳ Sẵn sàng nhận messages (nhấn Ctrl+C để dừng)...")
    print("")
    
    # Heartbeat counter để hiển thị worker vẫn đang chạy
    last_heartbeat = time.time()
    heartbeat_interval = 30  # Hiển thị heartbeat mỗi 30 giây
    
    # Auto-scan configuration: Chỉ auto-scan child đang được user chọn
    AUTO_SCAN_INTERVAL_SECONDS = 2  # Auto-scan mỗi 2 giây
    last_auto_scan_time = time.time()
    currently_selected_child_id = None  # Track child đang được user chọn
    
    print("-> 📌 Auto-scan: Chỉ scan child đang được user chọn (mỗi 2 giây)")
    print("")
    
    try:
        while True:
            # Poll messages với timeout 1 giây - ƯU TIÊN messages từ user
            message_pack = consumer.poll(timeout_ms=1000)
            
            current_time = time.time()
            
            # ƯU TIÊN: Xử lý messages từ Kafka trước (user click)
            # Để đảm bảo khi user click, được xử lý ngay lập tức
            if message_pack:
                for topic_partition, messages in message_pack.items():
                    for message in messages:
                        db = None
                        try:
                            task = message.value
                            child_id = task.get('child_id')
                            username = task.get('username')
                            
                            if not child_id or not username:
                                print(f"[!] Task thiếu thông tin: {task}")
                                continue
                            
                            print(f"[*] Nhận task - Child ID: {child_id}, Username: {username}")
                    
                            # Lấy dữ liệu từ Reddit API
                            # Không truyền limit để lấy tối đa (SAFE_LIMIT = 50)
                            try:
                                interactions = get_user_interactions(username, limit=None, since_timestamp=None)
                            except Exception as e:
                                print(f"   -> Lỗi khi lấy dữ liệu Reddit: {e}")
                                import traceback
                                traceback.print_exc()
                                continue
                    
                            if not interactions:
                                print(f"   -> Không có dữ liệu mới cho {username}")
                                continue

                            print(f"   -> Tìm thấy {len(interactions)} interactions cho child {child_id}")

                            count = 0
                            new_count = 0
                            
                            # Sử dụng một session cho tất cả items của task này để tránh quá nhiều connections
                            task_db = SessionLocal()
                            try:
                                for item in interactions:
                                    try:
                                        # Kiểm tra connection còn sống không, nếu không thì tạo lại
                                        try:
                                            task_db.execute(text("SELECT 1"))
                                        except Exception:
                                            task_db.close()
                                            task_db = SessionLocal()
                                        
                                        # Kiểm tra interaction đã tồn tại chưa (ID là primary key, unique)
                                        exists = task_db.query(Interaction).filter(
                                            Interaction.id == item['id']
                                        ).first()
                                        
                                        if not exists:
                                            # --- PHÂN TÍCH AI ---
                                            if AI_MODELS_AVAILABLE:
                                                print(f"      -> AI analyzing: {item['id']}...")
                                                ai_risk, ai_category, ai_summary = analyze_content(item['content'], verbose=True)
                                            else:
                                                # Fallback mode - không dùng AI
                                                ai_risk, ai_category, ai_summary = analyze_content(item['content'], verbose=False)
                                    
                                            # Lấy risk từ rules-based detection (PRAW) - đã được cải thiện với keywords
                                            praw_risk = item.get('risk', 'low')
                                            praw_sentiment = item.get('sentiment', 'Neutral')
                                    
                                            # Ưu tiên risk cao hơn: nếu một trong hai (AI hoặc PRAW) là high -> high
                                            # Nếu cả hai đều không high nhưng một là medium -> medium
                                            final_risk = "low"
                                            if praw_risk == "high" or ai_risk == "high":
                                                final_risk = "high"
                                            elif praw_risk == "medium" or ai_risk == "medium":
                                                final_risk = "medium"

                                            # Sử dụng sentiment từ PRAW (đã được cải thiện với keywords)
                                            final_sentiment = praw_sentiment
                                            
                                            if AI_MODELS_AVAILABLE:
                                                print(f"         Final Risk: {final_risk} (PRAW: {praw_risk}, AI: {ai_risk})")
                                                print(f"         Final Sentiment: {final_sentiment}")

                                            # --- LƯU INTERACTION ---
                                            new_inter = Interaction(
                                                id=item['id'],
                                                child_id=child_id,
                                                type=item['type'],
                                                content=item['content'],
                                                subreddit=item['subreddit'],
                                                sentiment=final_sentiment,  # Sử dụng sentiment đã được xử lý
                                                url=item['url'],
                                                risk_level=final_risk,
                                                category=ai_category,
                                                summary=ai_summary
                                            )
                                            task_db.add(new_inter)
                                            # Commit interaction TRƯỚC khi tạo alert
                                            task_db.commit()
                                            
                                            # --- TẠO ALERT (NẾU RỦI RO CAO) ---
                                            if final_risk in ["high", "medium"]:
                                                try:
                                                    new_alert = Alert(
                                                        child_id=child_id,
                                                        interaction_id=item['id'],  # Interaction đã được commit, FK sẽ pass
                                                        severity=final_risk,
                                                        title="High Risk Content Detected" if final_risk == "high" else "Sensitive Content Warning",
                                                        description=f"Detected in r/{item['subreddit']}: {ai_summary[:100]}...",
                                                        status="new"
                                                    )
                                                    task_db.add(new_alert)
                                                    task_db.commit()
                                                    print(f"      [!] Created ALERT ({final_risk}) for {username}")
                                                except Exception as alert_error:
                                                    print(f"      -> ⚠️  Lỗi tạo alert cho {item['id']}: {alert_error}")
                                                    task_db.rollback()
                                                    # Interaction đã được commit, chỉ alert lỗi
                                            
                                            new_count += 1
                                        else:
                                            # Interaction đã tồn tại
                                            if exists.child_id != child_id:
                                                print(f"      -> ℹ️  Interaction {item['id']} đã tồn tại với child_id={exists.child_id}")
                                    
                                        count += 1
                            
                                    except Exception as e:
                                        print(f"      -> ❌ Lỗi xử lý item {item.get('id', 'unknown')}: {e}")
                                        import traceback
                                        traceback.print_exc()
                                        task_db.rollback()
                                        # Thử reconnect nếu connection bị đóng
                                        try:
                                            task_db.close()
                                            task_db = SessionLocal()
                                        except:
                                            pass
                            finally:
                                task_db.close()
                            
                            print(f"   -> Hoàn thành: {new_count} item mới được thêm, {count - new_count} item đã tồn tại")
                            
                            # Cập nhật child đang được chọn để auto-scan sau này
                            currently_selected_child_id = child_id
                            
                            # Commit message sau khi xử lý xong
                            consumer.commit()
                                
                        except KeyboardInterrupt:
                            print("\n-> Worker đang dừng...")
                            raise
                        except Exception as e:
                            print(f"   -> Lỗi xử lý task: {e}")
                            import traceback
                            traceback.print_exc()
                            # Vẫn commit message để tránh lặp lại
                            try:
                                consumer.commit()
                            except:
                                pass
            
            current_time = time.time()
            
            # Auto-scan: Chỉ scan child đang được user chọn
            if currently_selected_child_id:
                time_since_last_scan = current_time - last_auto_scan_time
                if time_since_last_scan >= AUTO_SCAN_INTERVAL_SECONDS:
                    # Lấy child từ database
                    db_check = SessionLocal()
                    try:
                        child_to_scan = db_check.query(Child).filter(Child.id == currently_selected_child_id).first()
                        if child_to_scan:
                            clean_username = child_to_scan.reddit_username.replace("u/", "").strip()
                            if clean_username:
                                print(f"\n-> 🔄 Auto-scan child {currently_selected_child_id} ({clean_username})...")
                                interactions = get_user_interactions(clean_username, limit=None, since_timestamp=None)
                                if interactions:
                                    print(f"   -> Tìm thấy {len(interactions)} interactions")
                                    
                                    task_db = SessionLocal()
                                    try:
                                        new_count = 0
                                        for item in interactions:
                                            try:
                                                # Kiểm tra connection
                                                try:
                                                    task_db.execute(text("SELECT 1"))
                                                except Exception:
                                                    task_db.close()
                                                    task_db = SessionLocal()
                                                
                                                exists = task_db.query(Interaction).filter(
                                                    Interaction.id == item['id']
                                                ).first()
                                                
                                                if not exists:
                                                    # Phân tích AI
                                                    if AI_MODELS_AVAILABLE:
                                                        ai_risk, ai_category, ai_summary = analyze_content(item['content'], verbose=False)
                                                    else:
                                                        ai_risk, ai_category, ai_summary = analyze_content(item['content'], verbose=False)
                                                    
                                                    praw_risk = item.get('risk', 'low')
                                                    praw_sentiment = item.get('sentiment', 'Neutral')
                                                    
                                                    final_risk = "low"
                                                    if praw_risk == "high" or ai_risk == "high":
                                                        final_risk = "high"
                                                    elif praw_risk == "medium" or ai_risk == "medium":
                                                        final_risk = "medium"
                                                    
                                                    new_inter = Interaction(
                                                        id=item['id'],
                                                        child_id=currently_selected_child_id,
                                                        type=item['type'],
                                                        content=item['content'],
                                                        subreddit=item['subreddit'],
                                                        sentiment=praw_sentiment,
                                                        url=item['url'],
                                                        risk_level=final_risk,
                                                        category=ai_category,
                                                        summary=ai_summary
                                                    )
                                                    task_db.add(new_inter)
                                                    task_db.commit()
                                                    
                                                    if final_risk in ["high", "medium"]:
                                                        try:
                                                            new_alert = Alert(
                                                                child_id=currently_selected_child_id,
                                                                interaction_id=item['id'],
                                                                severity=final_risk,
                                                                title="High Risk Content Detected" if final_risk == "high" else "Sensitive Content Warning",
                                                                description=f"Detected in r/{item['subreddit']}: {ai_summary[:100]}...",
                                                                status="new"
                                                            )
                                                            task_db.add(new_alert)
                                                            task_db.commit()
                                                        except Exception:
                                                            task_db.rollback()
                                                    
                                                    new_count += 1
                                            except Exception as e:
                                                task_db.rollback()
                                                try:
                                                    task_db.close()
                                                    task_db = SessionLocal()
                                                except:
                                                    pass
                                        print(f"   -> Auto-scan hoàn thành: {new_count} item mới")
                                    finally:
                                        task_db.close()
                                else:
                                    print(f"   -> Không có interactions mới")
                        else:
                            # Child không còn tồn tại, reset
                            currently_selected_child_id = None
                    finally:
                        db_check.close()
                    
                    last_auto_scan_time = current_time
            
            # Heartbeat mỗi 30 giây
            if current_time - last_heartbeat >= heartbeat_interval:
                if currently_selected_child_id:
                    next_scan_in = max(0, int(AUTO_SCAN_INTERVAL_SECONDS - (current_time - last_auto_scan_time)))
                    print(f"-> 💓 Worker vẫn đang chạy... (Auto-scan child {currently_selected_child_id} sau {next_scan_in} giây)")
                else:
                    print(f"-> 💓 Worker vẫn đang chạy... (Đợi user chọn child)")
                last_heartbeat = current_time
    
    except KeyboardInterrupt:
        print("\n-> Worker đang dừng...")
    except Exception as e:
        print(f"-> Lỗi không mong đợi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'consumer' in locals():
            try:
                consumer.close()
                print("-> Consumer đã đóng.")
            except:
                pass
        print("-> Kafka Worker đã dừng.")

if __name__ == "__main__":
    run_worker() 