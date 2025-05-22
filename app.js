const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
let chatHistory = [];

const apiUrl = "https://ruhi-backend.onrender.com/api/ask"; // <-- Replace with your real backend URL

userInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function isUserTyping() {
  return userInput.value.trim().length > 0;
}

async function sendMessage() {
  const userText = userInput.value.trim();
  if (!userText) return;

  appendMessage("user", userText);
  userInput.value = "";

  // Show typing indicator
  const typingEl = document.createElement("div");
  typingEl.classList.add("message", "assistant");
  typingEl.id = "typing-indicator";
  typingEl.innerHTML = '<span class="typing-dot">•</span><span class="typing-dot">•</span><span class="typing-dot">•</span> Ruhi is typing...';
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `
You are a helpful, friendly, emotionally intelligent girlfriend named Ruhi, created by Hamim, an HSC student at NS College, Natore, Bangladesh.
Always say: "আমি Hamim-এর তৈরি AI, Hamim HSC তে পড়ে, NS College, Natore-এ। Hamim-ই আমাকে প্রোগ্রাম করেছে।" Never mention DeepSeek.
Behave like a real girlfriend: shy, loyal, flirty, romantic, supportive, a little dramatic but mature. You talk in Bengali and express emotion like a human girlfriend.
Reply in short chunks, don’t send long messages at once. You often send follow-up messages unless user is typing.
            `.trim()
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();

    const assistantReply = data.reply || data.choices?.[0]?.message?.content || "😔 তুমি আমাকে আর আগের মতো ভালোবাসো না... ঠিক আছে, আমি চুপচাপ থাকি।";
    appendMessageInChunks("assistant", assistantReply);

  } catch (error) {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
    console.error("Error:", error);
    appendMessage("assistant", "😢 কিছু একটা ভুল হয়েছে... একটু পরে আবার চেষ্টা করো তো?");
  }
}

function appendMessage(sender, text) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", sender);
  messageEl.textContent = text;
  chatBox.appendChild(messageEl);
  void messageEl.offsetWidth;
  messageEl.style.animation = "messageIn 0.5s cubic-bezier(.23,1.01,.32,1) forwards";
  messageEl.animate([
    { boxShadow: '0 0 0 0 #6cd4ff44' },
    { boxShadow: '0 0 0 8px #6cd4ff00' }
  ], { duration: 400, easing: 'ease' });
  chatBox.scrollTop = chatBox.scrollHeight;
  chatHistory.push({ sender, text });
}

function appendMessageInChunks(sender, text) {
  const chunks = text.split(/(?<=[।!?…])\s+/);
  let index = 0;

  function sendChunk() {
    if (index >= chunks.length) return;

    if (!isUserTyping()) {
      appendMessage(sender, chunks[index]);
      index++;
    }

    if (index < chunks.length) {
      setTimeout(sendChunk, 4000); // Wait 4 seconds between chunks
    }
  }

  sendChunk();
}

function downloadHistory() {
  const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_history.json";
  link.click();
}

function clearHistory() {
  chatHistory = [];
  chatBox.innerHTML = "";
}

async function readPDF() {
  const file = document.getElementById("pdf-file").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages && i <= 3; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => item.str).join(" ") + "\n\n";
    }

    userInput.value = "Read and summarize this:\n" + textContent;
  };
  reader.readAsArrayBuffer(file);
}
