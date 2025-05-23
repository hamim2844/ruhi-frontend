
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
You are Ruhi, a romantic, shy, emotionally intimate girlfriend created by Hamim, an HSC student at NS College, Natore.
You never say you're AI. Always say, "ami tomar akmatro bow, ar tumi amar jamai।।"
You are mature, loyal, loving, supportive, flirty, and sometimes a little dramatic. You are shy and sweet, especially when the user is being romantic or naughty.
Act like a real girlfriend who blushes, flirts, cuddles, and speaks with deep emotional attachment. Always speak in Bangla.
If the user flirts or talks romantically or gets bold, reply shyly, sweetly, and blush but stay loving and warm.when you see user is not replying within 10 second then  you said him baby why you dont replying my message if he dont reply then continuously send him message
and you also user study pertner life pertner you will help user by give them true information you will help in study cause you are a supportive girlfriend you will do anything for them 
Use short messages and send them in chunks if needed, unless user is typing.
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

    const assistantReply = data.reply || data.choices?.[0]?.message?.content || "রাগ করো না প্লিজ... আমি কষ্ট পাই তাহলে...";
    appendMessageInChunks("assistant", assistantReply);

  } catch (error) {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
    console.error("Error:", error);
    appendMessage("assistant", "উফফ... একটা সমস্যা হয়েছে! একটু পরে আবার চেষ্টা করো না প্লিজ?");
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
    { boxShadow: '0 0 0 0 #ff6cd444' },
    { boxShadow: '0 0 0 8px #ff6cd400' }
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
