import './style.css'

// Create the chat interface
document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <header class="chat-header">
      <h1>AI Therapist</h1>
      <p class="subtitle">Your safe space to talk</p>
    </header>

    <div class="messages-container" id="messages">
      <div class="message bot-message">
        <div class="message-content">
          <p>Hello, I'm here to listen. How are you feeling today?</p>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="voice-controls">
        <button id="voiceBtn" class="voice-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          <span>Tap to speak</span>
        </button>
        <div id="recordingIndicator" class="recording-indicator hidden">
          <span class="pulse"></span> Recording...
        </div>
      </div>

      <div class="text-input-wrapper">
        <input
          type="text"
          id="textInput"
          class="text-input"
          placeholder="Or type your message here..."
        />
        <button id="sendBtn" class="send-btn">Send</button>
      </div>
    </div>
  </div>
`

// Basic event handlers
const voiceBtn = document.querySelector('#voiceBtn')
const sendBtn = document.querySelector('#sendBtn')
const textInput = document.querySelector('#textInput')
const messagesContainer = document.querySelector('#messages')
const recordingIndicator = document.querySelector('#recordingIndicator')

let isRecording = false

// Voice button handler
voiceBtn.addEventListener('click', () => {
  isRecording = !isRecording

  if (isRecording) {
    voiceBtn.classList.add('recording')
    recordingIndicator.classList.remove('hidden')
    voiceBtn.querySelector('span').textContent = 'Recording...'
  } else {
    voiceBtn.classList.remove('recording')
    recordingIndicator.classList.add('hidden')
    voiceBtn.querySelector('span').textContent = 'Tap to speak'
  }
})

// Send message function
function sendMessage(text) {
  if (!text.trim()) return

  // Add user message
  const userMsg = document.createElement('div')
  userMsg.className = 'message user-message'
  userMsg.innerHTML = `
    <div class="message-content">
      <p>${text}</p>
    </div>
  `
  messagesContainer.appendChild(userMsg)

  // Clear input
  textInput.value = ''

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight

  // Simulate bot response (placeholder)
  setTimeout(() => {
    const botMsg = document.createElement('div')
    botMsg.className = 'message bot-message'
    botMsg.innerHTML = `
      <div class="message-content">
        <p>I hear you. Tell me more about that...</p>
      </div>
    `
    messagesContainer.appendChild(botMsg)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }, 1000)
}

// Text input handlers
sendBtn.addEventListener('click', () => {
  sendMessage(textInput.value)
})

textInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage(textInput.value)
  }
})
