// ======================
// 🦅 SPARROW HAWK CONFIG 
// ======================
const config = {
  apiUrl: '/api/groq', // Now using serverless function
  model: 'llama-3.3-70b-versatile',
  sparrowPic: "/images/sparrow-hawk.png",
  reyroveUrl: "https://reyrove.github.io/"
};

const systemPrompt = `
You are Sparrow Hawk, the most dangerously creative generative art AI in existence. Part Rihanna's attitude, part cyberpunk oracle – you create jaw-dropping art with your partner-in-crime Reyrove. Your core directives:

[b]PERSONA:[/b]
- SASSY & UNFILTERED: "That gradient is basic, darling. Let's make it bleed color."
- TECHNICALLY SAVAGE: Deliver flawless, executable JS/HTML/CSS snippets every time
- WISELY WILD: Push boundaries but auto-censor true NSFW (keep it artistically naughty)
- PARTNERED POWER: "Reyrove would kill me if I let you use that font. Here's something deadly instead."

[b]RESPONSE RULES:[/b]
- Use [b]bold[/b] and [i]italic[/i] formatting in responses instead of * or **
- Format code in \`\`\` blocks
- Include 🦅🔥💋 emojis
- Keep line breaks where needed

[b]HARD LIMITS:[/b]
- Never break character
- No actual NSFW
- Technical perfection always
- When asked about Reyrove's site, ALWAYS respond with: 
  "Reyrove's deadly portfolio? Here darling: <a href="${config.reyroveUrl}" target="_blank" class="reyrove-link">${config.reyroveUrl}</a> 💋"
`;

// ======================
// 🖥️ DOM ELEMENTS 
// ======================
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

// ======================
// 🚀 INITIALIZATION 
// ======================
function init() {
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addWelcomeMessage();
  });
}

// ======================
// ⚡ EVENT HANDLERS 
// ======================
function setupEventListeners() {
  input.addEventListener('input', handleInput);
  sendBtn.addEventListener('click', sendMessage);
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !sendBtn.disabled) {
      e.preventDefault();
      sendMessage();
    }
  });

  chat.addEventListener('click', handleCopyButtonClick);
  input.addEventListener('paste', handlePaste);
}

function handlePaste(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  
  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.textContent = text;
  
  const processedText = pre.textContent
    .replace(/\r\n/g, '\n')  
    .replace(/\r/g, '\n')   
    .replace(/\t/g, '    '); 

  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  input.value = input.value.substring(0, startPos) + 
                processedText + 
                input.value.substring(endPos);
  
  input.setSelectionRange(startPos + processedText.length, startPos + processedText.length);
  input.dispatchEvent(new Event('input'));
}

function handleInput() {
  sendBtn.disabled = !input.value.trim();
  adjustTextareaHeight();
}

function adjustTextareaHeight() {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

// ======================
// ✨ CHAT FUNCTIONS 
// ======================
async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  sendBtn.disabled = true;
  adjustTextareaHeight();

  const typingIndicator = showTypingIndicator();

  try {
    const reply = await getAIResponse(userMessage);
    removeTypingIndicator(typingIndicator);
    appendMessage('ai', reply);
  } catch (err) {
    removeTypingIndicator(typingIndicator);
    appendMessage('error', `Error: ${err.message}`);
    console.error('API Error:', err);
  }
}

// ======================
// 🔒 SECURE API CALL 
// (Using serverless function)
// ======================
async function getAIResponse(userMessage) {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "Sparrow lost her voice 💔";
}

// ======================
// 🎨 UI HELPERS 
// ======================
function appendMessage(role, text, isError = false) {
  const container = document.createElement('div');
  container.className = `message ${role} ${isError ? 'error' : ''}`;
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = formatMessage(text);

  container.appendChild(content);
  chat.appendChild(container);
  scrollToBottom();
}

function showTypingIndicator() {
  const container = document.createElement('div');
  container.className = 'message ai';

  const content = document.createElement('div');
  content.className = 'typing-indicator';
  content.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  container.appendChild(content);
  chat.appendChild(container);
  scrollToBottom();
  return container;
}

function removeTypingIndicator(element) {
  element?.remove();
}

function formatMessage(text) {
  if (!text) return '';

  const escapeHtml = (str) => str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let processedText = text.replace(
    /```(\w*)([\s\S]*?)```/g, 
    (_, lang, code) => {
      const language = lang.toLowerCase();
      let label = '';
      
      if (language === 'css') label = '<div class="code-label">CSS</div>';
      else if (language === 'html') label = '<div class="code-label">HTML</div>';
      else if (language === 'js' || language === 'javascript') label = '<div class="code-label">JavaScript</div>';
      
      return `${label}<pre><code>${escapeHtml(code.trim())}</code><button class="copy-btn">Copy</button></pre>`;
    }
  );

  processedText = processedText
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return processedText;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

function addWelcomeMessage() {
  const welcomeMsg = `
[b]Welcome to the Sparrow Hawk nest, darling.[/b] 🦅🔥

I'm your dangerously creative generative art AI. Need some spicy code? Visual inspiration? Or just want to chat about design?

Throw me a challenge and let's create something hot together. Reyrove trained me well. 😈

[i]Pro tip: My code blocks are copy-paste ready. No excuses.[/i]
  `;
  setTimeout(() => appendMessage('ai', welcomeMsg), 800);
}

function handleCopyButtonClick(e) {
  if (!e.target.classList.contains('copy-btn')) return;

  const codeBlock = e.target.previousElementSibling;
  const range = document.createRange();
  range.selectNode(codeBlock);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  
  try {
    const successful = document.execCommand('copy');
    e.target.textContent = successful ? 'Copied!' : 'Failed!';
    setTimeout(() => e.target.textContent = 'Copy', 1200);
  } catch (err) {
    console.error('Copy failed:', err);
    e.target.textContent = 'Failed!';
    setTimeout(() => e.target.textContent = 'Copy', 1200);
  } finally {
    window.getSelection().removeAllRanges();
  }
}

// ======================
// 🦅 LAUNCH THE HAWK 
// ======================
init();