# 🔌 Tích Hợp OpenAI SDK (Custom API)

Dự án này sử dụng API tương thích hoàn toàn với OpenAI. Để tích hợp vào các nền tảng khác, bạn có thể thực hiện như sau:

## 1. JavaScript (Browser/Node.js)
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'https://9router.vuhai.io.vn/v1',
    apiKey:  'sk-4bd27113b7dc78d1-lh6jld-f4f9c69f'
});

const response = await client.chat.completions.create({
    model: 'ces-chatbot-gpt-5.4',
    messages: [{ role: 'user', content: 'Xin chào!' }]
});
```

## 2. Python
```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
    base_url="https://9router.vuhai.io.vn/v1"
)

response = client.chat.completions.create(
    model="ces-chatbot-gpt-5.4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```
