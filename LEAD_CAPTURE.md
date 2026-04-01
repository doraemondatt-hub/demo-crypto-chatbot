# 🎯 Hướng Dẫn Tích Hợp Thu Thập Lead Tự Động (AI Chatbot)

Tài liệu này hướng dẫn cách ép AI tự động trích xuất dữ liệu khách hàng (Tên, SĐT, Email) và đồng bộ vào Google Sheets thông qua tag ẩn.

---

## 5.1. Bước 1 — Ép AI Tự Trích Xuất Dữ Liệu (Prompt Engineering)

### **Cách làm: Thêm quy tắc đặc biệt vào System Prompt của Chatbot**

Trong phần `SYSTEM_PROMPT` khi gọi API (OpenRouter/OpenAI), hãy thêm đoạn hướng dẫn sau vào cuối:

```text
Quy tắc đặc biệt: Trong quá trình trò chuyện, nếu bạn phát hiện người dùng cung cấp
Tên, Số điện thoại hoặc Email, bạn HÃY VỪA trả lời họ bình thường, VỪA chèn thêm
một đoạn mã JSON vào cuối cùng của câu trả lời theo đúng định dạng sau:
||LEAD_DATA: {"name": "...", "phone": "...", "email": "..."}||
Nếu thông tin nào chưa có, hãy để null.
TUYỆT ĐỐI KHÔNG giải thích hay đề cập đến đoạn mã này cho người dùng.
```

### **Ví dụ thực tế:**
*   **Khách nhắn:** "Tôi là Minh, SĐT 0901234567, muốn hỏi về khóa học AI."
*   **AI trả lời:** "Chào anh Minh! Rất vui được hỗ trợ anh... ||LEAD_DATA: {"name": "Minh", "phone": "0901234567", "email": null}||"

---

## 5.2. Bước 2 — Frontend Bóc Tách Dữ Liệu Trước Khi Hiển Thị

### **Logic xử lý JavaScript (chatbot.js):**

Hệ thống sử dụng Regex để dò tìm tag ẩn, bóc tách JSON để gửi đi và trả về chuỗi nội dung "sạch".

```javascript
/**
 * Hàm xử lý response từ AI:
 * 1. Kiểm tra có tag ||LEAD_DATA:...|| không
 * 2. Nếu có → Parse JSON → Gửi lên Google Sheets (Apps Script)
 * 3. Xóa tag khỏi câu trả lời → Hiển thị sạch cho khách
 */
function processAIResponse(aiResponse, chatHistoryArray = []) {
    const dataPattern = /\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/;

    // 1. Chuẩn bị lịch sử chat để gửi kèm (tăng tính ngữ cảnh cho lead)
    let formattedHistory = "";
    if (chatHistoryArray && chatHistoryArray.length > 0) {
        formattedHistory = chatHistoryArray.map(msg => {
            if (msg.role === 'system') return null;
            let role = msg.role === 'user' ? 'Khách' : 'AI';
            return `${role}: ${msg.content.replace(dataPattern, "").trim()}`;
        }).filter(Boolean).join('\n\n');
    }

    // 2. Tìm kiếm và xử lý LEAD_DATA
    if (aiResponse.includes("||LEAD_DATA:")) {
        const match = aiResponse.match(dataPattern);
        if (match && match[1]) {
            try {
                const leadData = JSON.parse(match[1]);
                if (leadData.name || leadData.phone || leadData.email) {
                    sendLeadToGoogleSheets(leadData, formattedHistory);
                }
            } catch (e) { console.error("Lỗi parse JSON:", e); }
        }
        // Xóa tag để hiển thị UI
        aiResponse = aiResponse.replace(dataPattern, "").trim();
    }
    return aiResponse;
}
```

### **Cách tích hợp vào Chatbot hiện tại:**

Tìm đến nơi nhận response từ API và thực hiện gọi hàm bóc tách trước khi render:

```javascript
// Gọi API...
const aiResponseContent = data.choices[0].message.content;

// XỬ LÝ TRƯỚC KHI HIỂN THỊ
const cleanResponse = processAIResponse(aiResponseContent, chatHistory);

// Hiển thị bản sạch lên giao diện
appendMessage("bot", cleanResponse); 
```

---

## 5.3. Bước 3 — Google Apps Script (Backend)
*(Phần tiếp theo mô tả cách Google Apps Script nhận POST request và thực hiện lệnh `appendRow` hoặc `upsert` vào Google Sheets dựa trên `sessionId`.)*
