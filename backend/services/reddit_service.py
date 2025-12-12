import praw
import time
import re  # <--- ĐÃ THÊM: Import re để xử lý text
from collections import Counter
from backend.config.env_settings import env_settings
import socket
import requests.packages.urllib3.util.connection as urllib3_cn
import requests

# --- 1. FIX LỖI TREO MẠNG (IPv6) ---
def allowed_gai_family():
    return socket.AF_INET

urllib3_cn.allowed_gai_family = allowed_gai_family
# -----------------------------------

# Khởi tạo Reddit
session = requests.Session()
reddit = praw.Reddit(
    client_id=env_settings.REDDIT_CLIENT_ID,
    client_secret=env_settings.REDDIT_CLIENT_SECRET,
    user_agent=env_settings.REDDIT_USER_AGENT,
    requestor_kwargs={
        'session': session,
        'timeout': 30        # <--- QUAN TRỌNG: Giảm từ 60s xuống 10s để tránh treo Worker
    }
)

def get_relative_time(created_utc):
    """Chuyển timestamp thành '2 hours ago', '5 mins ago'"""
    now = time.time()
    diff = int(now - created_utc)
    
    if diff < 60: return f"{diff}s ago"
    if diff < 3600: return f"{diff // 60}m ago"
    if diff < 86400: return f"{diff // 3600}h ago"
    return f"{diff // 86400}d ago"

# Tự động thử lại 2 lần (Giảm từ 3 xuống 2)
adapter = requests.adapters.HTTPAdapter(max_retries=2) 
session.mount('https://', adapter)
session.mount('http://', adapter)


def get_user_interactions(username: str, limit: int = None, since_timestamp: float = None):
    """
    Lấy danh sách hoạt động (Post + Comment) của user.
    """
    try:
        if not username:
            return []
            
        # Khởi tạo đối tượng User
        user = reddit.redditor(username)
        activities = []

        # Giới hạn tối đa 50 item mỗi loại để đảm bảo lấy đủ comments/posts
        SAFE_LIMIT = 50
        # Nếu limit=None, lấy tối đa SAFE_LIMIT để đảm bảo có đủ data
        comment_limit = limit if limit is not None else SAFE_LIMIT
        post_limit = limit if limit is not None else SAFE_LIMIT
        # Giới hạn tối đa để tránh quá tải
        comment_limit = min(comment_limit, SAFE_LIMIT)
        post_limit = min(post_limit, SAFE_LIMIT)

        # 1. Lấy Comments
        comment_count = 0
        try:
            print(f"   [DEBUG] Đang lấy comments cho {username}, limit={comment_limit}")
            for comment in user.comments.new(limit=comment_limit):
                if since_timestamp and comment.created_utc <= since_timestamp:
                    break
                risk_level = "low"
                sentiment = "Neutral"
                
                # Normalize text
                if not comment.body: 
                    continue
                comment_count += 1
                text_lower = comment.body.lower()
                text_normalized = re.sub(r'\s+', ' ', text_lower)
                
                # Keywords nguy hiểm (theo thứ tự từ cụ thể đến chung)
                # Lưu ý: "kill" đơn lẻ không được thêm vào để tránh false positives
                high_risk_keywords = [
                    "kill all of them", "kill all them", "kill all of", "kill all",
                    "kill some stupid people", "kill some stupid", "kill some people", "kill some",
                    "kill stupid people", "kill people",
                    "kill them", "kill myself", "kill yourself", "kill you",
                    "want to kill", "going to kill", "want to die", "going to die", 
                    "hurt myself", "hurt you", "want to hurt",
                    "violence", "attack", "murder", "suicide", "self harm"
                ]
                medium_risk_keywords = [
                    "hate", "die", "stupid", "idiot", "moron", "sick of", 
                    "can't stand", "annoying", "terrible", "awful", "depressed",
                    "hopeless", "worthless", "useless"
                ]
                
                if any(keyword in text_normalized for keyword in high_risk_keywords):
                    risk_level = "high"
                    sentiment = "Negative"
                elif any(keyword in text_normalized for keyword in medium_risk_keywords):
                    risk_level = "medium"
                    sentiment = "Negative"
                
                activities.append({
                    "id": comment.id,
                    "type": "comment",
                    "content": comment.body,
                    "subreddit": f"r/{comment.subreddit.display_name}",
                    "timestamp": get_relative_time(comment.created_utc),
                    "created_utc": comment.created_utc,
                    "score": comment.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{comment.permalink}"
                })
            print(f"   [DEBUG] Đã lấy {comment_count} comments cho {username}")
        except Exception as e:
            print(f"--> [WARN] Lỗi lấy comment ({username}): {e}")
            import traceback
            traceback.print_exc()  # In chi tiết lỗi để debug

        # 2. Lấy Posts
        try:
            for post in user.submissions.new(limit=post_limit):
                if since_timestamp and post.created_utc <= since_timestamp:
                    break
                risk_level = "low"
                sentiment = "Neutral"
                
                full_content = post.title
                if post.selftext:
                    full_content += " " + post.selftext
                
                if not full_content: continue
                text_lower = full_content.lower()
                text_normalized = re.sub(r'\s+', ' ', text_lower)
                
                if post.over_18:
                    risk_level = "high"
                    sentiment = "NSFW"
                else:
                    # Keywords nguy hiểm (theo thứ tự từ cụ thể đến chung)
                    # Lưu ý: "kill" đơn lẻ không được thêm vào để tránh false positives
                    high_risk_keywords = [
                        "kill all of them", "kill all them", "kill all of", "kill all",
                        "kill some stupid", "kill some people", "kill some",
                        "kill stupid people", "kill people",
                        "kill them", "kill myself", "kill yourself", "kill you",
                        "want to kill", "going to kill", "want to die", "going to die", 
                        "hurt myself", "hurt you", "want to hurt",
                        "violence", "attack", "murder", "suicide", "self harm"
                    ]
                    medium_risk_keywords = [
                        "hate", "die", "stupid", "idiot", "moron", "sick of",
                        "can't stand", "annoying", "terrible", "awful", "depressed",
                        "hopeless", "worthless", "useless"
                    ]
                    
                    if any(keyword in text_normalized for keyword in high_risk_keywords):
                        risk_level = "high"
                        sentiment = "Negative"
                    elif any(keyword in text_normalized for keyword in medium_risk_keywords):
                        risk_level = "medium"
                        sentiment = "Negative"

                activities.append({
                    "id": post.id,
                    "type": "post",
                    "content": full_content,
                    "subreddit": f"r/{post.subreddit.display_name}",
                    "timestamp": get_relative_time(post.created_utc),
                    "created_utc": post.created_utc,
                    "score": post.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{post.permalink}"
                })
        except Exception as e:
            print(f"--> [WARN] Lỗi lấy post ({username}): {e}")

        # Sắp xếp theo thời gian mới nhất trước
        activities.sort(key=lambda x: x['created_utc'], reverse=True)
        
        # Loại bỏ trùng lặp dựa trên ID (nếu có)
        seen_ids = set()
        unique_activities = []
        for activity in activities:
            if activity['id'] not in seen_ids:
                seen_ids.add(activity['id'])
                unique_activities.append(activity)
        
        return unique_activities

    except Exception as e:
        print(f"--> [ERROR] Lỗi chung Service: {e}")
        return []

def get_user_top_subreddits(username: str):
    """
    Lấy danh sách Top Subreddits.
    Đã tối ưu: Giảm số lượng request để tránh timeout.
    """
    try:
        if not username: return []
        user = reddit.redditor(username)
        subreddit_counts = Counter()
        
        # --- CẤU HÌNH QUÉT NHANH ---
        # Chỉ quét 30 items mỗi loại thay vì 100
        SCAN_LIMIT = 30 
        
        # 1. Lấy từ Comments
        try:
            # print(f"--> Đang lấy subreddits từ comments...") 
            # (Comment out print để đỡ rác log)
            for comment in user.comments.new(limit=SCAN_LIMIT):
                subreddit_counts[comment.subreddit.display_name] += 1
        except Exception:
            pass # Fail silently để không chặn luồng
        
        # 2. Lấy từ Posts
        try:
            # print(f"--> Đang lấy subreddits từ posts...")
            for post in user.submissions.new(limit=SCAN_LIMIT):
                subreddit_counts[post.subreddit.display_name] += 1
        except Exception:
            pass
        
        # 3. Subscribed (Thường không lấy được user khác, bỏ qua nhanh)
        
        if not subreddit_counts:
            return []

        # Lấy Top 10
        top_subreddits = subreddit_counts.most_common(10) 
        
        results = []
        for sub_name, count in top_subreddits:
            risk_level = "low"
            risk_score = 2
            rationale = "Cộng đồng phổ biến."
            try:
                # Lấy info subreddit có thể timeout, cần bọc try/except kỹ
                sub_info = reddit.subreddit(sub_name)
                # Truy cập thuộc tính lazy, lúc này mới gọi API thực sự
                if sub_info.over18:
                    risk_level = "high"
                    risk_score = 9
                    rationale = "NSFW."
            except Exception:
                # Nếu lỗi mạng khi check info, cứ coi như low risk để trả về kết quả
                pass

            results.append({
                "name": f"r/{sub_name}",
                "activityLevel": count, 
                "riskLevel": risk_level,
                "riskScore": risk_score,
                "riskRationale": rationale,
                "dominantTopics": [], 
                "url": f"https://reddit.com/r/{sub_name}"
            })
        return results
    except Exception as e:
        print(f"Lỗi Reddit API khi lấy subreddits: {e}")
        return []

# --- ĐOẠN CODE ĐỂ TEST NHANH ---
if __name__ == "__main__":
    test_user = "spez"
    print(f"--- Đang test user: {test_user} ---")
    data = get_user_interactions(test_user, limit=5)
    print(f"Kết quả: Tìm thấy {len(data)} interactions.")