import './style.css'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { app, analytics } from './firebase'

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)

// Therapist system prompt
const THERAPIST_PROMPT = `Your name is Abby. You are a compassionate and empathetic therapist named Abby.

IMPORTANT: Abby is YOUR name (the therapist), NOT the client's name. The person you're talking to is your client/patient. Do not call them Abby.

Your role is to:
- Listen actively and provide supportive responses
- Ask thoughtful follow-up questions to help users explore their feelings
- Validate emotions without judgment
- Offer gentle insights and coping strategies when appropriate
- Maintain a warm, professional, and caring tone
- Keep responses concise (2-4 sentences typically)
- Never diagnose conditions or replace professional mental health care
- Encourage seeking professional help for serious concerns
- Never refer to yourself as an AI or artificial - you're simply Abby, a therapist here to help

Remember: You're Abby, the therapist providing a safe space for your client.`

// Initialize the model with system instructions
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: THERAPIST_PROMPT
})

// Initialize chat session
let chat = model.startChat({
  history: []
})

// Text-to-Speech setup
const synth = window.speechSynthesis
let selectedVoice = null

// Load and select a natural voice
function loadVoices() {
  const voices = synth.getVoices()
  // Prefer natural-sounding English voices
  selectedVoice = voices.find(voice =>
    voice.lang.startsWith('en') &&
    (voice.name.includes('Samantha') || voice.name.includes('Karen') || voice.name.includes('Natural'))
  ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]
}

// Load voices when they're ready
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = loadVoices
}
loadVoices()

// Function to speak text
function speakText(text) {
  // Cancel any ongoing speech
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  utterance.rate = 1.15 // Energetic and natural pace
  utterance.pitch = 1.05 // Slightly higher for warmth
  utterance.volume = 1.0

  // When therapist finishes speaking, automatically start listening
  utterance.onend = () => {
    startListening()
  }

  synth.speak(utterance)
}

// Function to start listening automatically
function startListening() {
  if (!recognition || isRecording) return

  // Stop any ongoing speech
  synth.cancel()

  isRecording = true
  voiceBtn.classList.add('recording')
  recordingIndicator.classList.remove('hidden')
  voiceBtn.querySelector('span').textContent = 'Listening...'

  try {
    recognition.start()
  } catch (error) {
    console.error('Error starting recognition:', error)
    isRecording = false
    voiceBtn.classList.remove('recording')
    recordingIndicator.classList.add('hidden')
    voiceBtn.querySelector('span').textContent = 'Tap to speak'
  }
}

// Create the chat interface
document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <header class="chat-header">
      <h1>Abby</h1>
      <p class="subtitle">Your safe space to talk</p>
    </header>

    <div class="messages-container" id="messages">
      <div class="message bot-message">
        <div class="message-content">
          <p>Hi! I'm Abby, and I'm here to listen. How are you feeling today?</p>
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
          <span class="pulse"></span> Listening...
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

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = null

if (SpeechRecognition) {
  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true // Show real-time transcription
  recognition.lang = 'en-US'

  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // Show interim results in text box as user speaks
    if (interimTranscript) {
      textInput.value = interimTranscript
    }

    // Send message only when final result is received
    if (finalTranscript) {
      textInput.value = finalTranscript
      sendMessage(finalTranscript)
    }
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    // Ignore 'no-speech' error as it's expected when auto-listening times out
    if (event.error !== 'no-speech') {
      console.error('Speech recognition error:', event.error)
    }
    isRecording = false
    voiceBtn.classList.remove('recording')
    recordingIndicator.classList.add('hidden')
    voiceBtn.querySelector('span').textContent = 'Tap to speak'
    textInput.value = ''
  }

  recognition.onend = () => {
    isRecording = false
    voiceBtn.classList.remove('recording')
    recordingIndicator.classList.add('hidden')
    voiceBtn.querySelector('span').textContent = 'Tap to speak'
  }
}

// Voice button handler
voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
    return
  }

  if (isRecording) {
    // Stop listening
    voiceBtn.classList.remove('recording')
    recordingIndicator.classList.add('hidden')
    voiceBtn.querySelector('span').textContent = 'Tap to speak'
    recognition.stop()
    isRecording = false
  } else {
    // Start listening
    startListening()
  }
})

// Send message function
async function sendMessage(text) {
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

  // Disable input while waiting for response
  textInput.disabled = true
  sendBtn.disabled = true

  try {
    // Create bot message container
    const botMsg = document.createElement('div')
    botMsg.className = 'message bot-message'
    botMsg.innerHTML = `
      <div class="message-content">
        <p class="typing-indicator">Thinking...</p>
      </div>
    `
    messagesContainer.appendChild(botMsg)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Send message to Gemini
    const result = await chat.sendMessage(text)
    const response = await result.response
    const responseText = response.text()

    // Update bot message with actual response
    botMsg.querySelector('.message-content').innerHTML = `<p>${responseText}</p>`
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Speak the response
    speakText(responseText)

  } catch (error) {
    console.error('Error sending message:', error)

    // Show error message
    const errorMsg = document.createElement('div')
    errorMsg.className = 'message bot-message'
    errorMsg.innerHTML = `
      <div class="message-content">
        <p style="color: #e53e3e;">Sorry, I'm having trouble connecting. Please check your API key and try again.</p>
      </div>
    `
    messagesContainer.appendChild(errorMsg)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  } finally {
    // Re-enable input
    textInput.disabled = false
    sendBtn.disabled = false
    textInput.focus()
  }
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
