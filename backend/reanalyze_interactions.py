"""
Script để re-analyze tất cả interactions hiện có với logic mới
Chạy: python3 -m backend.reanalyze_interactions
"""
import sys
import os

sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User
from backend.models.alert import Alert
from backend.models.notification_settings import NotificationSettings
from backend.services.reddit_service import get_user_interactions

# Import AI models
try:
    from ai_models.classify import predict_sentiment
    from ai_models.categorize import predict_labels
    from ai_models.summarize import summarize_text
    AI_MODELS_AVAILABLE = True
except ImportError:
    AI_MODELS_AVAILABLE = False

def analyze_content(content: str, verbose=False):
    """
    Phân tích nội dung với AI models (giống như trong kafka_worker.py)
    
    Returns:
        tuple: (ai_risk, categories, summary)
    """
    if not content:
        return "low", "General", ""
    
    if not AI_MODELS_AVAILABLE:
        return "low", "general", "No AI analysis"
    
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
    except Exception as e:
        categories = "Uncategorized"
        if verbose:
            print(f"         ⚠️  Lỗi AI categorization: {e}")

    # C. Tóm tắt nội dung
    summary = content
    if len(content) > 50:
        try:
            summary = summarize_text(content, max_length=60, min_length=10)
        except Exception as e:
            if verbose:
                print(f"         ⚠️  Lỗi AI summarization: {e}")
            pass
    
    return ai_risk, categories, summary

def reanalyze_interactions():
    """Re-analyze tất cả interactions với logic mới"""
    db = SessionLocal()
    
    try:
        # Lấy tất cả interactions
        interactions = db.query(Interaction).all()
        print(f"Tìm thấy {len(interactions)} interactions để re-analyze...")
        
        updated_count = 0
        
        for inter in interactions:
            try:
                content = inter.content or ""
                
                # Normalize text
                import re
                text_normalized = re.sub(r'\s+', ' ', content.lower())
                
                # Keywords detection (giống như trong reddit_service.py)
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
                
                # Determine risk level
                praw_risk = "low"
                praw_sentiment = "Neutral"
                
                if any(keyword in text_normalized for keyword in high_risk_keywords):
                    praw_risk = "high"
                    praw_sentiment = "Negative"
                elif any(keyword in text_normalized for keyword in medium_risk_keywords):
                    praw_risk = "medium"
                    praw_sentiment = "Negative"
                
                # AI analysis
                ai_risk, ai_category, ai_summary = analyze_content(content, verbose=False)
                
                # Final risk (ưu tiên cao hơn)
                final_risk = "low"
                if praw_risk == "high" or ai_risk == "high":
                    final_risk = "high"
                elif praw_risk == "medium" or ai_risk == "medium":
                    final_risk = "medium"
                
                final_sentiment = praw_sentiment
                
                # Update interaction
                old_risk = inter.risk_level
                old_sentiment = inter.sentiment
                
                inter.risk_level = final_risk
                inter.sentiment = final_sentiment
                inter.category = ai_category
                inter.summary = ai_summary
                
                if old_risk != final_risk or old_sentiment != final_sentiment:
                    updated_count += 1
                    print(f"  ✓ Updated {inter.id}: {old_sentiment}/{old_risk} → {final_sentiment}/{final_risk}")
                
                db.commit()
                
            except Exception as e:
                print(f"  ❌ Error updating {inter.id}: {e}")
                db.rollback()
                continue
        
        print(f"\n✅ Hoàn thành! Đã cập nhật {updated_count}/{len(interactions)} interactions")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 RE-ANALYZE INTERACTIONS")
    print("=" * 60)
    reanalyze_interactions()

