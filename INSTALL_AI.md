# Hướng dẫn cài đặt AI Models

Do dung lượng ổ cứng hạn chế, cài đặt theo các bước sau:

## Bước 1: Cài PyTorch CPU-only (nhẹ hơn ~2-3GB so với CUDA version)

```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

## Bước 2: Cài các AI packages còn lại

```bash
pip install transformers scipy datasets numpy
```

Hoặc từ requirement.txt (sau khi đã cài torch):

```bash
pip install transformers>=4.30.0 scipy>=1.10.0 datasets>=2.12.0 numpy>=1.24.0
```

## Kiểm tra sau khi cài

Restart worker và kiểm tra log:
```bash
python3 -m backend.kafka_worker
```

Bạn sẽ thấy:
- `-> ✅ AI Models đã sẵn sàng` nếu thành công
- `-> ⚠️ Cảnh báo: Không thể import AI models` nếu còn thiếu

