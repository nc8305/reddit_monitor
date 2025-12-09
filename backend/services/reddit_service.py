import praw
import time
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
        'session': session,  # Dùng session có cơ chế retry
        'timeout': 60        # Tăng timeout lên 60 giây
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



# Tự động thử lại 3 lần nếu lỗi mạng (status 500, 502, 504...)
adapter = requests.adapters.HTTPAdapter(max_retries=3) 
session.mount('https://', adapter)
session.mount('http://', adapter)


def get_user_interactions(username: str, limit: int = None, since_timestamp: float = None):
    """
    Lấy danh sách hoạt động (Post + Comment) của user.
    
    Args:
        username: Reddit username
        limit: Số lượng items tối đa (None = lấy tất cả có thể)
        since_timestamp: Chỉ lấy items mới hơn timestamp này (Unix timestamp)
    
    Returns:
        List of interaction dicts, sorted by created_utc (newest first)
    """
    try:
        if not username:
            return []
            
        # Khởi tạo đối tượng User
        user = reddit.redditor(username)
        activities = []

        comment_limit = limit if limit else 100
        post_limit = limit if limit else 100

        # 1. Lấy Comments
        try:
            for comment in user.comments.new(limit=comment_limit):
                # Nếu có since_timestamp, skip items cũ hơn
                if since_timestamp and comment.created_utc <= since_timestamp:
                    break
                risk_level = "low"
                sentiment = "Neutral"
                
                # Normalize text: lowercase, loại bỏ dấu câu thừa
                text_lower = comment.body.lower()
                text_normalized = re.sub(r'\s+', ' ', text_lower)
                
                # Keywords nguy hiểm - HIGH RISK
                # Sắp xếp từ cụ thể nhất đến chung nhất
                high_risk_keywords = [
                    "kill all of them", "kill all them", "kill all of", "kill all",
                    "kill some stupid", "kill some people", "kill some",
                    "kill stupid people", "kill people",
                    "kill them", "kill myself", "kill yourself", "kill you",
                    "want to kill", "going to kill", "want to die", "going to die", 
                    "hurt myself", "hurt you", "want to hurt",
                    "violence", "attack", "murder",
                    "kill"  # "kill" để cuối
                ]
                # Keywords tiêu cực - MEDIUM RISK
                medium_risk_keywords = ["hate", "die", "stupid", "idiot", "moron", "sick of", 
                                       "can't stand", "annoying", "terrible", "awful"]
                
                if any(keyword in text_normalized for keyword in high_risk_keywords):
                    risk_level = "high"
                    sentiment = "Negative"
                    print(f"      -> HIGH RISK detected in comment: keyword matched")
                elif any(keyword in text_normalized for keyword in medium_risk_keywords):
                    risk_level = "medium"
                    sentiment = "Negative"
                    print(f"      -> MEDIUM RISK detected in comment: keyword matched")
                
                # Lưu full content để AI phân tích (không truncate)
                full_content = comment.body
                # Content để hiển thị (có thể truncate)
                display_content = comment.body[:300] + ("..." if len(comment.body) > 300 else "")
                
                activities.append({
                    "id": comment.id,
                    "type": "comment",
                    "content": full_content,  # Lưu full content cho AI phân tích
                    "subreddit": f"r/{comment.subreddit.display_name}",
                    "timestamp": get_relative_time(comment.created_utc),
                    "created_utc": comment.created_utc,
                    "score": comment.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{comment.permalink}"
                })
        except Exception as e:
            print(f"--> LỖI LẤY COMMENT ({username}): {e}")

        # 2. Lấy Posts
        try:
            for post in user.submissions.new(limit=post_limit):
                # Nếu có since_timestamp, skip items cũ hơn
                if since_timestamp and post.created_utc <= since_timestamp:
                    break
                risk_level = "low"
                sentiment = "Neutral"
                
                # Tạo content đầy đủ để phân tích (title + selftext) - KHÔNG truncate
                full_content = post.title
                if post.selftext:
                    full_content += " " + post.selftext
                
                # Normalize text: lowercase, loại bỏ dấu câu thừa để keyword matching tốt hơn
                text_lower = full_content.lower()
                # Thay thế nhiều khoảng trắng bằng 1 khoảng trắng
                text_normalized = re.sub(r'\s+', ' ', text_lower)
                
                # Check NSFW
                if post.over_18:
                    risk_level = "high"
                    sentiment = "NSFW"
                else:
                    # Keywords nguy hiểm - HIGH RISK
                    # Sắp xếp từ cụ thể nhất đến chung nhất
                    high_risk_keywords = [
                        "kill all of them", "kill all them", "kill all of", "kill all",
                        "kill some stupid", "kill some people", "kill some",
                        "kill stupid people", "kill people",
                        "kill them", "kill myself", "kill yourself", "kill you",
                        "want to kill", "going to kill", "want to die", "going to die", 
                        "hurt myself", "hurt you", "want to hurt",
                        "violence", "attack", "murder",
                        "kill"  # "kill" để cuối
                    ]
                    # Keywords tiêu cực - MEDIUM RISK  
                    medium_risk_keywords = ["hate", "die", "stupid", "idiot", "moron", "sick of",
                                           "can't stand", "annoying", "terrible", "awful"]
                    
                    # Kiểm tra keywords trong normalized text
                    if any(keyword in text_normalized for keyword in high_risk_keywords):
                        risk_level = "high"
                        sentiment = "Negative"
                        print(f"      -> HIGH RISK detected in post: keyword matched")
                    elif any(keyword in text_normalized for keyword in medium_risk_keywords):
                        risk_level = "medium"
                        sentiment = "Negative"
                        print(f"      -> MEDIUM RISK detected in post: keyword matched")

                activities.append({
                    "id": post.id,
                    "type": "post",
                    "content": full_content,  # Lưu full content cho AI phân tích (không truncate)
                    "subreddit": f"r/{post.subreddit.display_name}",
                    "timestamp": get_relative_time(post.created_utc),
                    "created_utc": post.created_utc,
                    "score": post.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{post.permalink}"
                })
        except Exception as e:
            print(f"--> LỖI LẤY POST ({username}): {e}")

        # 3. Sắp xếp
        activities.sort(key=lambda x: x['created_utc'], reverse=True)
        
        return activities

    except Exception as e:
        print(f"--> LỖI CHUNG SERVICE: {e}")
        return []

def get_user_top_subreddits(username: str):
    """
    Lấy danh sách Top Subreddits từ:
    1. Comments của user
    2. Posts của user
    3. Subscribed subreddits (nếu có thể)
    """
    try:
        if not username: return []
        user = reddit.redditor(username)
        subreddit_counts = Counter()
        
        # 1. Lấy từ Comments
        try:
            print(f"--> Đang lấy subreddits từ comments của {username}...")
            for comment in user.comments.new(limit=100):  # Limit để tránh quá lâu
                subreddit_counts[comment.subreddit.display_name] += 1
        except Exception as e:
            print(f"--> Lỗi lấy comments: {e}")
        
        # 2. Lấy từ Posts
        try:
            print(f"--> Đang lấy subreddits từ posts của {username}...")
            for post in user.submissions.new(limit=100):  # Limit để tránh quá lâu
                subreddit_counts[post.subreddit.display_name] += 1
        except Exception as e:
            print(f"--> Lỗi lấy posts: {e}")
        
        # 3. Thử lấy từ Subscribed Subreddits (nếu user là chính mình và authenticated)
        # Note: Reddit API không cho phép lấy subscribed subreddits của user khác
        # Chỉ có thể lấy nếu authenticated với chính user đó
        try:
            # Kiểm tra xem có thể lấy subscribed không (chỉ hoạt động nếu authenticated)
            if hasattr(user, 'subreddit') and hasattr(user.subreddit, 'subscribed'):
                print(f"--> Đang lấy subscribed subreddits...")
                for sub in user.subreddit.subscribed(limit=50):
                    subreddit_counts[sub.display_name] += 1
        except Exception as e:
            # Không thể lấy subscribed (bình thường nếu không authenticated)
            pass

        if not subreddit_counts:
            print(f"--> Không tìm thấy subreddit nào từ {username}")
            return []

        # Lấy Top 10 frequent nhất
        top_subreddits = subreddit_counts.most_common(10) 
        
        print(f"--> Tìm thấy {len(top_subreddits)} subreddits")
        
        results = []
        for sub_name, count in top_subreddits:
            risk_level = "low"
            risk_score = 2
            rationale = "Cộng đồng phổ biến."
            try:
                sub_info = reddit.subreddit(sub_name)
                if sub_info.over18:
                    risk_level = "high"
                    risk_score = 9
                    rationale = "NSFW."
            except Exception as e:
                print(f"--> Lỗi khi lấy info subreddit {sub_name}: {e}")

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

# --- ĐOẠN CODE ĐỂ TEST NHANH (HARDCODE) ---
if __name__ == "__main__":
    # Bạn có thể chạy trực tiếp file này để test: python -m backend.services.reddit_service
    test_user = "spez"
    print(f"--- Đang test user: {test_user} ---")
    
    # Test lấy hết dữ liệu
    data = get_user_interactions(test_user)
    
    print(f"Kết quả: Tìm thấy {len(data)} interactions.")
    for item in data[:5]: # In thử 5 cái đầu
        print(f"- [{item['type']}] {item['subreddit']}: {item['content'][:50]}...")