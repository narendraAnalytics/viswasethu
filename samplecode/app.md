# VishwaSetu: Bridge to the World

VishwaSetu is an AI-powered, voice-first language learning platform designed specifically for the diverse linguistic landscape of India. It acts as a patient, wise teacher that bridges the gap between regional Indian languages (like Telugu, Hindi, Tamil) and global foreign languages (like French, Japanese, Russian) to prepare users for international work and survival.

## 🚀 The Mission
Many migrant workers and villagers from India face significant language barriers when seeking opportunities abroad. VishwaSetu removes the friction of "learning through English" by using the user's native tongue as the primary instructional medium.

## 🧠 Model Information
This application utilizes the **Gemini 2.5 Flash Native Audio** model (`gemini-2.5-flash-native-audio-preview-12-2025`).
- **Low Latency**: Optimized for real-time, bidirectional voice conversations.
- **Native Audio**: Processes and generates raw PCM audio directly for human-like interaction.
- **Multilingual Mastery**: Capable of switching fluently between Indian regional languages and foreign target languages.

## 🛠️ Technical Stack
- **Frontend**: React (or Next.js)
- **Styling**: Tailwind CSS
- **API**: Google Gemini Live API (`@google/genai`)
- **Audio**: Web Audio API (PCM Encoding/Decoding)

## 📦 Installation Guide (Next.js)

If you are migrating this code to a **Next.js** project, follow these steps:

### 1. Initialize Next.js
```bash
npx create-next-app@latest vishwasetu --typescript --tailwind --eslint
cd vishwasetu
```

### 2. Install Dependencies
You primarily need the Google GenAI SDK to interact with the Live API.
```bash
npm install @google/genai
```

### 3. Environment Configuration
Create a `.env.local` file in your root directory:
```env
API_KEY=your_google_gemini_api_key_here
```

## 🎤 Voice-Based Requirements
To make a website voice-capable, you do **not** necessarily need to install additional heavy libraries, but you must handle the following:

1.  **Microphone Permissions**: The browser must request access via `navigator.mediaDevices.getUserMedia({ audio: true })`.
2.  **Audio Processing**: For Gemini Live, you need to handle raw PCM data (16-bit Little Endian). This is done using the browser's native `AudioContext` and `ScriptProcessorNode` (or `AudioWorklet`).
3.  **HTTPS**: Modern browsers **require** a secure context (HTTPS) or `localhost` to allow microphone access.
4.  **Base64 Encoding**: The Gemini API expects audio blobs to be base64 encoded strings of raw PCM bytes.

## 📋 Features
- **Zero-Click Selection**: The entire setup flow (native language, target language, and job type) is handled purely through voice conversation.
- **Real-time Transcription**: Users can see their speech and the teacher's response as they happen.
- **Job-Specific Training**: Vocabularies are adapted for roles like construction, nursing, driving, or IT.
- **Cultural Etiquette**: The AI teaches not just words, but the social manners of the target country.

---
*Built with ❤️ for the global Indian community.*
