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
    print("AI ready (Hate Speech Classification, Categorization, Summarization)")
except ImportError as e:
    print(f"Error import AI models: {e}")
    print("-Worker run fallback functions")
    AI_MODELS_AVAILABLE = False
    # Hàm dự phòng
    def predict_sentiment(t): return "non-hate"
    def predict_labels(t): return "general"
    def summarize_text(t, **k): return t[:100]
except Exception as e:
    print(f"Error import AI models: {e}")
    print("-Worker run fallback functions")
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
            print(f" AI Risk: {ai_label} (prob: {hate_prob:.3f}) -> {ai_risk}")
    except Exception as e:
        ai_risk = "low"
        if verbose:
            print(f"Error AI sentiment: {e}")
    
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
            print(f" Error AI categorization: {e}")

    # C. Tóm tắt nội dung
    summary = content
    if len(content) > 50:
        try:
            summary = summarize_text(content, max_length=60, min_length=10)
            if verbose:
                print(f"         AI Summary: {summary[:50]}...")
        except Exception as e:
            if verbose:
                print(f"Error AI summarization: {e}")
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
            print(f"Wait for Kafka: ({attempt + 1}/{max_retries})")
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
               
                time.sleep(retry_delay)
            else:
                raise e
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Error {e}.({attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                raise e
    return None


def run_worker():
    print("Kafka running")
   
   
    if not check_kafka_available():
        print("Kafka not connected")
        return
    try:
        consumer = create_consumer_with_retry(max_retries=5, retry_delay=3)
        print("Kafka connected")
    except Exception as e:
        print(f"Error connected {e}")
        return
    
   
    print(f"Subscribe to topic: {consumer.subscription()}")
  
    last_heartbeat = time.time()
    heartbeat_interval = 30 
    
    AUTO_SCAN_INTERVAL_SECONDS = 2  
    last_auto_scan_time = time.time()
    currently_selected_child_id = None  
   

    try:
        while True:
      
            message_pack = consumer.poll(timeout_ms=1000)
            
            current_time = time.time()
            
            if message_pack:
                for topic_partition, messages in message_pack.items():
                    for message in messages:
                        db = None
                        try:
                            task = message.value
                            child_id = task.get('child_id')
                            username = task.get('username')
                            
                            if not child_id or not username:
                                print(f"Missed info: {task}")
                                continue
                            
                            print(f"[*] Received task - Child ID: {child_id}, Username: {username}")
                    
                           
                            try:
                                interactions = get_user_interactions(username, limit=20, since_timestamp=None)
                            except Exception as e:
                                print(f"Reddit fetch unsuccess: {e}")
                                import traceback
                                traceback.print_exc()
                                continue
                    
                            if not interactions:
                                print(f"No new interactions {username}")
                                continue

                            print(f"Found {len(interactions)} interactions: {child_id} ({username})")

                            count = 0
                            new_count = 0
                            
                            task_db = SessionLocal()
                            try:
                                for item in interactions:
                                    try:
                                        try:
                                            task_db.execute(text("SELECT 1"))
                                        except Exception:
                                            task_db.close()
                                            task_db = SessionLocal()
                                        
                                        exists = task_db.query(Interaction).filter(
                                            Interaction.id == item['id']
                                        ).first()
                                        
                                        if not exists:
                                            if AI_MODELS_AVAILABLE:
                                                print(f"      -> AI analyzing: {item['id']}...")
                                                ai_risk, ai_category, ai_summary = analyze_content(item['content'], verbose=True)
                                            else:
                                        
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
                                                print(f"Final Risk: {final_risk} (PRAW: {praw_risk}, AI: {ai_risk})")
                                                print(f"Final Sentiment: {final_sentiment}")

                                            new_inter = Interaction(
                                                id=item['id'],
                                                child_id=child_id,
                                                type=item['type'],
                                                content=item['content'],
                                                subreddit=item['subreddit'],
                                                sentiment=final_sentiment, 
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
                                                        child_id=child_id,
                                                        interaction_id=item['id'], 
                                                        severity=final_risk,
                                                        title="High Risk Content Detected" if final_risk == "high" else "Sensitive Content Warning",
                                                        description=f"Detected in r/{item['subreddit']}: {ai_summary[:100]}...",
                                                        status="new"
                                                    )
                                                    task_db.add(new_alert)
                                                    task_db.commit()
                                                    print(f"Created ALERT ({final_risk}) for {username}")
                                                except Exception as alert_error:
                                                    print(f"Alert error {item['id']}: {alert_error}")
                                                    task_db.rollback()
                                                   
                                            new_count += 1
                                        else:
                                         
                                            if exists.child_id != child_id:
                                                print(f"Interaction {item['id']} exist: {exists.child_id}")
                                    
                                        count += 1
                            
                                    except Exception as e:
                                        print(f"Item error {item.get('id', 'unknown')}: {e}")
                                        import traceback
                                        traceback.print_exc()
                                        task_db.rollback()
                                 
                                        try:
                                            task_db.close()
                                            task_db = SessionLocal()
                                        except:
                                            pass
                            finally:
                                task_db.close()
                            
                            print(f" {new_count} item added, {count - new_count} item total")
                            
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
                    
                    db_check = SessionLocal()
                    try:
                        child_to_scan = db_check.query(Child).filter(Child.id == currently_selected_child_id).first()
                        if child_to_scan:
                            clean_username = child_to_scan.reddit_username.replace("u/", "").strip()
                            if clean_username:
                                print(f"Scanning child {currently_selected_child_id} ({clean_username})...")
                                interactions = get_user_interactions(clean_username, limit=None, since_timestamp=None)
                                if interactions:
                                    print(f"Found {len(interactions)} interactions")
                                    
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
                                        print(f"Scannning finish: {new_count} new iteraction")
                                    finally:
                                        task_db.close()
                                else:
                                    print(f"No new interactions found")
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
                    print(f"Worker running (Auto-scan child {currently_selected_child_id} in {next_scan_in})")
                else:
                    print(f"Worker running (No child selected for auto-scan)")
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