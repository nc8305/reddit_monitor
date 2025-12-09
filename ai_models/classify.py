from transformers import AutoModelForSequenceClassification, AutoTokenizer, set_seed
import torch
import numpy as np

# 1. CỐ ĐỊNH KẾT QUẢ (DETERMINISTIC)
# set_seed(42) của transformers sẽ tự động set cho cả random, numpy và torch
set_seed(42)

# Cấu hình Model
MODEL_NAME = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"

# Logic mapping: Negative -> Hate, Positive -> Non-hate
# Lưu ý: Model SST-2 trả về ID 0 (NEGATIVE) và 1 (POSITIVE)
LABEL_MAPPING = {
    0: "hate",      # Tương ứng với NEGATIVE sentiment
    1: "non-hate"   # Tương ứng với POSITIVE sentiment
}

# Biến toàn cục để lưu model (Singleton pattern)
_tokenizer = None
_model = None

def _load_model():
    """Load model và tokenizer chỉ một lần duy nhất."""
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        print("   -> Loading DistilBERT sentiment analysis model (SST-2)...")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        
        # QUAN TRỌNG: Chuyển model sang chế độ đánh giá (Evaluation Mode)
        # Lệnh này tắt Dropout layers -> Kết quả sẽ cố định 100% mỗi lần chạy
        _model.eval()
        
        print("   -> Model loaded successfully!")
    return _tokenizer, _model

def predict_sentiment(text, return_probability=False):
    """
    Dự đoán hate/non-hate dựa trên sentiment.
    Kết quả sẽ luôn NHẤT QUÁN (deterministic) nhờ set_seed và model.eval().
    """
    tokenizer, model = _load_model()
    
    # 1. Tokenize input
    inputs = tokenizer(
        text, 
        return_tensors="pt", 
        truncation=True, 
        max_length=512, 
        padding=True
    )
    
    # 2. Dự đoán (Tắt gradient để tiết kiệm RAM và tăng tốc)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.numpy()[0]
    
    # 3. Tính xác suất (Softmax)
    probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
    
    # 4. Lấy nhãn có xác suất cao nhất
    predicted_idx = np.argmax(probs)
    final_label = LABEL_MAPPING.get(predicted_idx, "non-hate")
    confidence = probs[predicted_idx]
    
    # 5. Trả về kết quả
    if return_probability:
        # Tạo dict xác suất chi tiết
        prob_dict = {
            "hate": float(probs[0]),      # Index 0 là NEGATIVE (quy ước là hate)
            "non-hate": float(probs[1])   # Index 1 là POSITIVE (quy ước là non-hate)
        }
        
        # Xác định sentiment gốc để tham khảo
        original_sentiment = "NEGATIVE" if predicted_idx == 0 else "POSITIVE"

        return {
            'label': final_label,
            'score': float(confidence),
            'probabilities': prob_dict,
            'sentiment': original_sentiment
        }
    else:
        return final_label

# --- Test nhanh ---
if __name__ == "__main__":
    test_text = "I hate everyone and everything."
    print(f"Input: '{test_text}'")
    
    # Chạy thử 2 lần để kiểm tra độ ổn định
    result1 = predict_sentiment(test_text, return_probability=True)
    print(f"Run 1: {result1['label']} ({result1['score']:.4f})")
    
    result2 = predict_sentiment(test_text, return_probability=True)
    print(f"Run 2: {result2['label']} ({result2['score']:.4f})")
    
    if result1['score'] == result2['score']:
        print("=> SUCCESS: Kết quả ổn định (Deterministic).")
    else:
        print("=> WARNING: Kết quả khác nhau!")