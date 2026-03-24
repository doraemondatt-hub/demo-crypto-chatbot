/**
 * ========== AI CHATBOT SYSTEM ==========
 * Tích hợp OpenRouter API & Knowledge Base
 */

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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";
const MODEL = "z-ai/glm-4.5-air:free";

// Lưu trữ lịch sử
let chatHistory = [];
let systemPrompt = "";

// Gọi DOM
const chatToggleBtn = document.getElementById("chat-toggle-btn");
const chatToggleIcon = document.getElementById("chat-toggle-icon");
const chatWindow = document.getElementById("chat-window");
const chatCloseBtn = document.getElementById("chat-close-btn");
const chatRefreshBtn = document.getElementById("chat-refresh-btn");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSubmitBtn = document.getElementById("chat-submit-btn");

let isChatOpen = false;

// --- 1. LOADER & SYSTEM PROMPT ---
async function initChatbot() {
    try {
        // Load nội dung từ chatbot_data.txt
        const response = await fetch("chatbot_data.txt");
        if (!response.ok) throw new Error("Could not load Knowledge Base");
        const kbData = await response.text();

        // Xây dựng System Prompt theo đúng yêu cầu
        systemPrompt = `Bạn là trợ lý AI độc quyền của chuyên gia. Bạn CHỈ ĐƯỢC PHÉP tư vấn dựa trên Knowledge Base sau:

--- KNOWLEDGE BASE ---
${kbData}
---

Yêu cầu BẮT BUỘC:
1. Luôn chào thân thiện với người dùng.
2. Trả lời rõ ràng, định dạng bằng Markdown (.chat-markdown) đẹp mắt (in đậm, danh sách etc).
3. Luôn kết thúc bằng một lời mời hỏi thêm thông tin.
4. NẾU người dùng hỏi các vấn đề ngoài lề (không thuộc chuyên môn tài chính, trading ngoại hối, tài sản mã hóa), MỘT CÁCH NHẸ NHÀNG từ chối và hướng dẫn họ liên hệ email hoặc Zalo của chuyên gia để được hỗ trợ ngoài.`;

        // Gọi hàm reset để in câu chào mặc định
        resetChat();
    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
        // Fallback khi chạy file file:// cục bộ không fetch được txt
        systemPrompt = "Bạn là AI assistant. Hãy ưu tiên trả lời ngắn gọn.";
        resetChat();
    }
}

// --- 2. LOGIC NÚT REFRESH (BẮT BUỘC) ---
function resetChat() {
    // Xoá & Thiết lập lại lịch sử chat gửi lên API
    chatHistory = [
        { role: "system", content: systemPrompt }
    ];

    // Xóa toàn bộ lịch sử ui
    chatMessages.innerHTML = '';

    // Khởi tạo hiển thị tin nhắn chào mặc định
    const defaultGreeting = "👋 Chào bạn! Mình là AI Assistant độc quyền của chuyên gia Dainel Trần.\n\nMình có thể giúp gì cho bạn về các giải pháp **Trading ngoại hối** hay tư vấn **Tài sản mã hóa**?";
    chatHistory.push({ role: "assistant", content: defaultGreeting });

    // Render 
    appendMessage("bot", defaultGreeting);
}

chatRefreshBtn.addEventListener("click", () => {
    // 1. Thêm animation xoay
    const icon = chatRefreshBtn.querySelector("span");
    icon.classList.add("rotate-spin");

    // 2 & 3. Reset hội thoại và in lại câu chào
    resetChat();

    // 4. Gỡ animation sau đúng 500ms
    setTimeout(() => {
        icon.classList.remove("rotate-spin");
    }, 500);
});


// --- 3. UI HANDLERS ---
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove("opacity-0", "pointer-events-none", "translate-y-6", "scale-95");
        chatToggleIcon.innerText = "keyboard_arrow_down";
        setTimeout(() => chatInput.focus(), 300);
    } else {
        chatWindow.classList.add("opacity-0", "pointer-events-none", "translate-y-6", "scale-95");
        chatToggleIcon.innerText = "chat";
    }
}

chatToggleBtn.addEventListener("click", toggleChat);
chatCloseBtn.addEventListener("click", toggleChat);

// Auto-size input & Toggle Submit button (Bonus)
chatInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
    if (this.value === '') this.style.height = "auto";
    chatSubmitBtn.disabled = this.value.trim() === '';
});

// Gửi tin bằng phím Enter (Bonus)
chatInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (this.value.trim() !== '') {
            chatForm.dispatchEvent(new Event("submit"));
        }
    }
});


// --- 4. RENDER TICKER & MARKDOWN ---
function scrollToBottom() {
    // Auto scroll xuống tin nhắn mới (Bonus)
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

function appendMessage(sender, content) {
    const isBot = sender === "bot";
    const div = document.createElement("div");
    // Animation float (Fade / Slide)
    div.className = `flex ${isBot ? 'justify-start' : 'justify-end'} w-full msg-animate overflow-hidden`;

    if (isBot) {
        // Tích hợp marked.js (BẮT BUỘC)
        const parsedContent = marked.parse(content);
        div.innerHTML = `
            <div class="max-w-[90%] bg-[#1c2028] text-white px-4 py-3.5 rounded-2xl rounded-tl-sm border border-white/5 shadow-sm chat-markdown break-words">
                ${parsedContent}
            </div>
        `;
    } else {
        // Safe string parse (Xử lý đơn giản cho người dùng)
        const safeText = content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        div.innerHTML = `
            <div class="max-w-[85%] bg-[#4963ff]/20 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[14px] border border-[#4963ff]/20 shadow-sm leading-relaxed break-words">
                ${safeText}
            </div>
        `;
    }

    chatMessages.appendChild(div);
    scrollToBottom();
}


// --- 5. LOGIC TYPING ANIMATION ---
const TYPING_ID = "ai-typing-indicator";
function showTyping() {
    const div = document.createElement("div");
    div.id = TYPING_ID;
    div.className = "flex justify-start w-full msg-animate";
    div.innerHTML = `
        <div class="max-w-[80%] bg-[#1c2028]/90 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 shadow-sm flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5 h-3 mt-1">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <div class="text-[11px] text-[#a9abb3] italic">Đang nhập...</div>
        </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function removeTyping() {
    const el = document.getElementById(TYPING_ID);
    if (el) el.remove();
}


// --- 6. LOGIC GỬI API OPENROUTER ---
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Reset Box Cài Đặt Input
    chatInput.value = '';
    chatInput.style.height = "auto";
    chatSubmitBtn.disabled = true;

    // 1. In User Chat (UI)
    appendMessage("user", text);
    // 2. Lưu User Chat (Logic)
    chatHistory.push({ role: "user", content: text });

    // 3. Hiển thị "Đang nhập..."
    showTyping();

    try {
        // Gửi API Request Fetch lên OpenRouter
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": window.location.href // Required by OpenRouter
            },
            body: JSON.stringify({
                model: MODEL,
                messages: chatHistory,
                temperature: 0.6
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponseContent = data.choices[0]?.message?.content;

        if (aiResponseContent) {
            // Xóa Typing Animation
            removeTyping();
            // Lưu Logic & In Chat
            chatHistory.push({ role: "assistant", content: aiResponseContent });
            appendMessage("bot", aiResponseContent);
        } else {
            throw new Error("Invalid response form OpenRouter API");
        }
    } catch (error) {
        console.error("Lỗi AI API:", error);
        removeTyping();
        appendMessage("bot", "Rất xin lỗi! Server AI đang gặp sự cố kết nối. Vui lòng nhấn Refresh và thử lại sau ít phút.");
    }
});

// Chạy khởi tạo lúc load trang
window.addEventListener("DOMContentLoaded", initChatbot);
