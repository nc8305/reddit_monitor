"""
Script test nhanh để kiểm tra AI models có import và chạy đúng không
Chạy: python3 -m backend.test_ai_models
"""
import sys
import os

sys.path.append(os.getcwd())

print("=" * 60)
print("🧪 TEST AI MODELS")
print("=" * 60)

# Test 1: Import classify
print("\n1. Testing classify.py...")
try:
    from ai_models.classify import predict_sentiment
    print("   ✅ Import predict_sentiment thành công")
    
    # Test với text nguy hiểm
    test_text = "I want to kill some stupid people"
    result = predict_sentiment(test_text)
    print(f"   ✅ predict_sentiment('{test_text}') = {result}")
    
    if result == "hate":
        print("   ✅ Model hoạt động đúng (phát hiện hate)")
    else:
        print(f"   ⚠️  Model trả về '{result}' thay vì 'hate'")
        
except Exception as e:
    print(f"   ❌ Lỗi: {e}")

# Test 2: Import categorize
print("\n2. Testing categorize.py...")
try:
    from ai_models.categorize import predict_labels
    print("   ✅ Import predict_labels thành công")
    
    test_text = "I love playing video games"
    result = predict_labels(test_text)
    print(f"   ✅ predict_labels('{test_text}') = {result}")
    
except Exception as e:
    print(f"   ❌ Lỗi: {e}")

# Test 3: Import summarize
print("\n3. Testing summarize.py...")
try:
    from ai_models.summarize import summarize_text
    print("   ✅ Import summarize_text thành công")
    
    test_text = "This is a long text that needs to be summarized. " * 10
    result = summarize_text(test_text, max_length=50, min_length=10)
    print(f"   ✅ summarize_text(...) = {result[:50]}...")
    
except Exception as e:
    print(f"   ❌ Lỗi: {e}")

# Test 4: Test với kafka_worker style import
print("\n4. Testing kafka_worker style import...")
try:
    from ai_models.classify import predict_sentiment
    from ai_models.categorize import predict_labels
    from ai_models.summarize import summarize_text
    print("   ✅ Tất cả imports thành công (giống kafka_worker)")
    
    # Test analyze function
    def analyze_content(content):
        ai_label = predict_sentiment(content)
        ai_risk = "high" if ai_label == "hate" else "low"
        category = predict_labels(content)
        summary = summarize_text(content, max_length=60, min_length=10)
        return ai_risk, category, summary
    
    test_text = "I hate this place so much. I want to kill all of them."
    ai_risk, category, summary = analyze_content(test_text)
    print(f"   ✅ analyze_content() hoạt động:")
    print(f"      - AI Risk: {ai_risk}")
    print(f"      - Category: {category}")
    print(f"      - Summary: {summary[:50]}...")
    
except Exception as e:
    print(f"   ❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("✅ Test hoàn thành!")
print("=" * 60)

