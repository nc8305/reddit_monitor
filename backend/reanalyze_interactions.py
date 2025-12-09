"""
Script để re-analyze tất cả interactions hiện có với logic mới
Chạy: python3 -m backend.reanalyze_interactions
"""
import sys
import os

sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.models.interaction import Interaction
# Import tất cả models để SQLAlchemy map relationships đúng cách
from backend.models.child import Child
from backend.models.user import User
from backend.models.alert import Alert
from backend.models.notification_settings import NotificationSettings

# Import AI models
try:
    from ai_models.classify import predict_sentiment
    from ai_models.categorize import predict_labels
    from ai_models.summarize import summarize_text
    AI_MODELS_AVAILABLE = True
except ImportError:
    AI_MODELS_AVAILABLE = False

def analyze_content(content: str):
    """Phân tích nội dung với AI models"""
    if not AI_MODELS_AVAILABLE:
        return "low", "general", "No AI analysis"
    
    try:
        ai_label = predict_sentiment(content)
        ai_risk = "high" if ai_label == "hate" else "low"
        category = predict_labels(content)
        summary = summarize_text(content)
        return ai_risk, category, summary
    except Exception as e:
        print(f"      -> AI Error: {e}")
        return "low", "general", "Analysis error"

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
                high_risk_keywords = [
                    "kill all of them", "kill all them", "kill all of", "kill all",
                    "kill some stupid", "kill some people", "kill some",
                    "kill stupid people", "kill people",
                    "kill them", "kill myself", "kill yourself", "kill you",
                    "want to kill", "going to kill", "want to die", "going to die", 
                    "hurt myself", "hurt you", "want to hurt",
                    "violence", "attack", "murder",
                    "kill"
                ]
                medium_risk_keywords = ["hate", "die", "stupid", "idiot", "moron", "sick of",
                                       "can't stand", "annoying", "terrible", "awful"]
                
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
                if AI_MODELS_AVAILABLE:
                    ai_risk, ai_category, ai_summary = analyze_content(content)
                else:
                    ai_risk, ai_category, ai_summary = "low", "general", "No AI"
                
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
                
                # Commit sau mỗi interaction để tránh lỗi transaction
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

