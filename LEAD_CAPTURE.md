# 🎯 Hệ Thống Thu Thập Lead Tự Động Qua AI Chatbot

## Tổng Quan Luồng Hoạt Động

```mermaid
sequenceDiagram
    participant K as 👤 Khách hàng
    participant CB as 🤖 Chatbot (Frontend)
    participant AI as 🧠 AI API (OpenRouter)
    participant JS as ⚙️ JavaScript (processAIResponse)
    participant GAS as 📡 Google Apps Script (doPost)
    participant GS as 📊 Google Sheets

    K->>CB: Nhắn tin: "Tôi là Minh, SĐT 0901234567"
    CB->>AI: Gửi tin nhắn + System Prompt có quy tắc LEAD_DATA
    AI-->>CB: "Chào Minh! Mình có thể giúp gì?<br/>||LEAD_DATA: {"name":"Minh","phone":"0901234567","email":null}||"
    CB->>JS: Truyền raw response vào processAIResponse()
    JS->>JS: Regex bóc tách tag → Parse JSON
    JS-->>CB: Trả về câu trả lời sạch (không có tag)
    CB-->>K: Hiển thị: "Chào Minh! Mình có thể giúp gì?"
    JS->>GAS: fetch() POST JSON {name, phone, sessionId, chatHistory...}
    GAS->>GS: Upsert vào sheet "Leads" (tạo mới hoặc cập nhật)
    GS-->>GAS: ✅ Ghi thành công
```

### Chi Tiết Cấu Hình
- **Base URL**: `https://9router.vuhai.io.vn/v1`
- **Model**: `ces-chatbot-gpt-5.4`
- **Authentication**: `sk-4bd27113b7dc78d1-lh6jld-f4f9c69f`

### Cơ Chế Bóc Tách (Regex)
```javascript
const dataPattern = /\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/;
```
Hàm `processAIResponse()` sẽ quét kết quả trả về từ AI, nếu thấy tag `||LEAD_DATA:...||` thì sẽ tách phần JSON ra để gửi về Google Sheets qua Apps Script, sau đó xóa tag này để hiển thị nội dung "sạch" cho người dùng.
