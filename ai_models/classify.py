from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
import numpy as np
import random

# Set seeds để đảm bảo kết quả nhất quán (deterministic)
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)

# Sử dụng model từ Hugging Face - DistilBERT fine-tuned cho SST-2 (sentiment analysis)
model_name = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"
# Model này phân loại positive/negative cho sentiment analysis

THRESHOLD = 0.5  # Threshold cho binary classification (thường là 0.5)

# Mapping cho binary classification
# Model SST-2 có: 0: "NEGATIVE", 1: "POSITIVE"
# Chúng ta sẽ chuyển đổi sang format "hate"/"non-hate" để tương thích với code hiện tại
LABEL_MAPPING = {
    0: "negative",  # NEGATIVE sentiment
    1: "positive"   # POSITIVE sentiment
}

# Mapping từ LABEL_X sang tên thực tế (nếu model trả về LABEL_X)
LABEL_X_MAPPING = {
    "LABEL_0": "negative",
    "LABEL_1": "positive"
}

# Mapping từ sentiment sang risk level
# Negative sentiment có thể chỉ ra nội dung nguy hiểm
SENTIMENT_TO_RISK = {
    "negative": "hate",      # Negative sentiment -> có thể là hate speech
    "positive": "non-hate",  # Positive sentiment -> không phải hate speech
    "NEGATIVE": "hate",
    "POSITIVE": "non-hate"
}


# Lazy loading - chỉ load khi được gọi lần đầu
_tokenizer = None
_model = None

def _load_model():
    """Load model và tokenizer chỉ một lần"""
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        print("   -> Loading DistilBERT sentiment analysis model (SST-2)...")
        _tokenizer = AutoTokenizer.from_pretrained(model_name)
        _model = AutoModelForSequenceClassification.from_pretrained(model_name)
        _model.eval()
        print("   -> Model loaded successfully!")
        print(f"   -> Model config: {_model.config.id2label if hasattr(_model.config, 'id2label') else 'No id2label'}")
    return _tokenizer, _model

def predict_sentiment(text, threshold=THRESHOLD, return_probability=False):
    """
    Dự đoán sentiment classification cho một text sử dụng DistilBERT SST-2
    
    Args:
        text: Text cần phân loại
        threshold: Ngưỡng để phân loại (default: 0.5)
        return_probability: Nếu True, trả về thêm probability
    
    Returns:
        Nếu return_probability=False: String label "hate" hoặc "non-hate" (tương thích với code hiện tại)
        Nếu return_probability=True: Dict với 'label', 'score', và 'probabilities'
    """
    # Load model nếu chưa load
    tokenizer, model = _load_model()
    
    # Đảm bảo model ở eval mode (không training)
    model.eval()
    
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
    
    # Dự đoán với deterministic mode
    with torch.no_grad():
        # Tắt dropout và các layers stochastic nếu có
        outputs = model(**inputs)
        logits = outputs.logits.numpy()[0]
    
    # Chuyển logits thành probabilities (softmax cho binary classification)
    probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
    
    # Lấy prediction
    predicted_idx = np.argmax(probs)
    
    # Lấy label từ model config
    # Model SST-2 thường có id2label: {0: "NEGATIVE", 1: "POSITIVE"}
    predicted_sentiment = None
    if hasattr(model.config, 'id2label') and model.config.id2label:
        id2label = model.config.id2label
        if isinstance(list(id2label.keys())[0], str):
            id2label = {int(k): v for k, v in id2label.items()}
        label_key = id2label.get(predicted_idx, f"LABEL_{predicted_idx}")
        # Map từ model label (NEGATIVE/POSITIVE) sang format của chúng ta
        predicted_sentiment = SENTIMENT_TO_RISK.get(label_key, label_key.lower())
    else:
        # Fallback: dùng mapping mặc định
        predicted_sentiment = SENTIMENT_TO_RISK.get(LABEL_MAPPING.get(predicted_idx, ""), "non-hate")
    
    # Chuyển đổi sang format "hate"/"non-hate" để tương thích với code hiện tại
    # Negative sentiment -> có thể là hate speech (cần kết hợp với rules-based detection)
    # Positive sentiment -> không phải hate speech
    if predicted_sentiment in ["negative", "NEGATIVE", "hate"]:
        final_label = "hate"
    else:
        final_label = "non-hate"
    
    confidence = probs[predicted_idx]
    
    if return_probability:
        # Tạo probabilities dict với tên label thực tế
        prob_dict = {}
        for i, prob in enumerate(probs):
            if hasattr(model.config, 'id2label') and model.config.id2label:
                id2label = model.config.id2label
                if isinstance(list(id2label.keys())[0], str):
                    id2label = {int(k): v for k, v in id2label.items()}
                label_key = id2label.get(i, f"LABEL_{i}")
                # Map sang format của chúng ta
                sentiment_label = SENTIMENT_TO_RISK.get(label_key, label_key.lower())
                if sentiment_label in ["negative", "NEGATIVE", "hate"]:
                    label_name = "hate"
                else:
                    label_name = "non-hate"
            else:
                label_name = SENTIMENT_TO_RISK.get(LABEL_MAPPING.get(i, ""), "non-hate")
            prob_dict[label_name] = float(prob)
        
        return {
            'label': final_label,
            'score': float(confidence),
            'probabilities': prob_dict,
            'sentiment': predicted_sentiment  # Thêm thông tin sentiment gốc
        }
    else:
        return final_label