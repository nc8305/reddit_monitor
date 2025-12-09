import json
from kafka import KafkaProducer
from kafka.errors import KafkaError
import time

_producer = None

def get_producer():
    """Lazy initialization of Kafka producer với retry logic"""
    global _producer
    if _producer is not None:
        return _producer
    
    try:
        _producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda x: json.dumps(x).encode('utf-8'),
            # Retry configuration
            retries=3,
            retry_backoff_ms=100,
            # Metadata configuration
            metadata_max_age_ms=30000,
        )
        return _producer
    except Exception as e:
        print(f"[Kafka] Lỗi khởi tạo producer: {e}")
        return None

def send_scan_request(child_id: int, reddit_username: str):
    """Gửi scan request vào Kafka topic"""
    producer = get_producer()
    if not producer:
        raise Exception("Kafka producer không khả dụng. Vui lòng kiểm tra Kafka service.")
    
    try:
        message = {
            "child_id": child_id,
            "username": reddit_username,
            "timestamp": time.time()
        }
        # Gửi task vào topic 'reddit_scan_tasks'
        future = producer.send('reddit_scan_tasks', value=message)
        # Đợi confirmation (optional, có thể bỏ nếu muốn async)
        future.get(timeout=10)
        print(f"[Kafka] ✅ Đã gửi scan request cho {reddit_username}")
    except KafkaError as e:
        print(f"[Kafka] ❌ Lỗi khi gửi message: {e}")
        raise
    except Exception as e:
        print(f"[Kafka] ❌ Lỗi không mong đợi: {e}")
        raise