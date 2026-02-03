# VishwaSetu - Bridge to the World

<div align="center">

**An AI-Powered Voice-First Language Learning Platform for India's Global Workforce**

*Connecting regional Indian languages to global opportunities through intelligent voice conversations*

</div>

---

## About VishwaSetu

**VishwaSetu** (विश्वसेतु) means "Bridge to the World" in Sanskrit. It is a revolutionary language learning platform designed specifically for India's diverse linguistic landscape.

### The Mission

Many migrant workers and villagers from India face significant language barriers when seeking opportunities abroad. Traditional language learning apps assume English proficiency, creating an additional hurdle. VishwaSetu removes this friction by:

- **Teaching in your mother tongue**: All instructions and explanations are given in your native language
- **Voice-first interaction**: No typing required - just speak naturally
- **Job-specific training**: Learn vocabulary for construction, nursing, driving, IT, and more
- **Cultural preparation**: Understanding social etiquettes of destination countries
- **Real-time practice**: Roleplay realistic scenarios with an AI teacher

### Target Audience

- Migrant workers preparing for overseas employment
- Students planning international education
- Professionals seeking global opportunities
- Anyone wanting to learn foreign languages through their native Indian language

---

## Features

### Voice-First Learning
- **Zero typing required**: Complete language selection and learning through natural conversation
- **Real-time transcription**: See both your speech and the teacher's response as text
- **Natural dialogue**: Powered by Google's Gemini 2.5 Flash Native Audio for human-like interaction

### Multilingual Support

**Native Languages (Instruction Medium):**
- Telugu (తెలుగు)
- Hindi (हिन्दी)
- Marathi (मराठी)
- Kannada (ಕನ್ನಡ)
- Tamil (தமிழ்)
- English (India)

**Target Languages (Learning):**
- English (US Accent)
- French (Français)
- Spanish (Español)
- Russian (Русский)
- Arabic (العربية)
- Japanese (日本語 / Nihongo)

### Intelligent Teaching
- **Context-aware**: Adapts vocabulary based on your profession
- **Patient and encouraging**: Like a wise village teacher
- **Practical focus**: Survival phrases first, formal grammar later
- **Roleplay scenarios**: Practice real-world situations (asking boss for leave, market negotiations, etc.)
- **Cultural etiquette**: Learn social norms alongside language

---

## Technical Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16.x** | React framework for production |
| **React 19.x** | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Google Gemini 2.5 Flash Native Audio** | AI voice conversation engine |
| **Web Audio API** | Real-time audio processing |
| **WebSocket** | Bidirectional real-time communication |

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **Google Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Create a new API key
   - Keep it secure

3. **Modern Web Browser**
   - Chrome, Edge, Firefox, or Safari
   - Microphone access enabled

4. **Internet Connection**
   - Required for real-time AI voice interaction

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/viswasethu.git
cd viswasethu
```

### 2. Install Dependencies

**Important:** Use the `--legacy-peer-deps` flag due to React 19.x compatibility:

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- React 19.x is relatively new
- Some dependencies may not have updated peer dependencies yet
- This flag allows installation to proceed without peer dependency conflicts
- All functionality remains intact

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js
- Never commit `.env.local` to version control
- Replace `your_actual_gemini_api_key_here` with your real API key

---

## Project Structure

```
viswasethu/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main VishwaSetu application
│   │   ├── layout.tsx         # Root layout with metadata
│   │   └── globals.css        # Global styles & CSS variables
│   ├── components/
│   │   └── VoiceOrb.tsx       # Animated voice visualization
│   ├── services/
│   │   └── audioUtils.ts      # PCM audio encoding/decoding
│   ├── constants/
│   │   └── vishwasetu.ts      # System instructions & language data
│   ├── types/
│   │   └── vishwasetu.ts      # TypeScript type definitions
│   └── lib/                   # Utility functions (optional)
├── samplecode/                # Original Vite reference implementation
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in repo)
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## Development

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** The browser will request microphone permission. Click "Allow" to use voice features.

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

---

## How It Works

### Technical Architecture

```
User Microphone → Web Audio API (16kHz PCM)
                  ↓
                  WebSocket Connection
                  ↓
                  Google Gemini Live API
                  ↓
                  Real-time Processing & Transcription
                  ↓
                  Audio Response (24kHz PCM)
                  ↓
User Speakers ← Web Audio API Playback
```

### Audio Processing

1. **Input Capture**
   - Microphone audio captured via `getUserMedia()`
   - Processed using `AudioContext` at 16kHz sample rate
   - Converted to 16-bit PCM format
   - Base64 encoded and sent to Gemini API

2. **Output Playback**
   - Gemini API returns 24kHz PCM audio
   - Base64 decoded to raw audio bytes
   - Converted to `AudioBuffer`
   - Played through speakers with precise timing

3. **Transcription**
   - Real-time input and output transcription
   - Incremental text updates
   - Turn-based conversation management

### Client-Side Architecture

**Important:** This application runs entirely client-side:
- The `'use client'` directive is used in all interactive components
- No server-side processing of audio or API calls
- Direct browser-to-Gemini WebSocket connection
- State management using React hooks (`useState`, `useRef`, `useCallback`)

---

## Migration Progress

This project is being migrated from Vite + React to Next.js. Current status:

- [x] **Phase 1:** Dependencies installed with `--legacy-peer-deps`
- [ ] **Phase 2:** Create type definitions (`src/types/vishwasetu.ts`)
- [ ] **Phase 3:** Create constants (`src/constants/vishwasetu.ts`)
- [ ] **Phase 4:** Create audio utilities (`src/services/audioUtils.ts`)
- [ ] **Phase 5:** Port VoiceOrb component
- [ ] **Phase 6:** Update main page with application logic
- [ ] **Phase 7:** Configure environment variables
- [ ] **Phase 8:** Testing and validation

---

## Key Differences from Sample Code

If you're familiar with the original Vite implementation in `samplecode/`, note these changes:

| Aspect | Vite (Original) | Next.js (Current) |
|--------|-----------------|-------------------|
| **Entry Point** | `index.tsx` | `src/app/page.tsx` |
| **Client Directive** | Not needed | `'use client'` required |
| **Env Variables** | `process.env.API_KEY` | `process.env.NEXT_PUBLIC_GEMINI_API_KEY` |
| **Imports** | Relative paths | Next.js structure paths |
| **Build Tool** | Vite | Next.js (Turbopack/Webpack) |
| **Routing** | React Router | Next.js App Router |

---

## Usage Guide

### Starting a Session

1. Open the application in your browser
2. Click the **"Start Learning"** button
3. Grant microphone permission when prompted
4. Wait for VishwaSetu to greet you

### Conversation Flow

**Phase 1: Language Selection**
- VishwaSetu asks: "What is your native language?"
- Speak your language (e.g., "Telugu", "Hindi")
- VishwaSetu switches to that language for all instructions

**Phase 2: Target Language**
- Asked in your native language: "Which foreign language do you want to learn?"
- Speak the target language (e.g., "French", "Japanese")

**Phase 3: Job Context**
- Asked in your native language: "What work will you do?"
- Speak your profession (e.g., "Construction", "Nursing")

**Phase 4: Learning**
- VishwaSetu teaches relevant phrases
- All explanations in your native language
- Target language phrases spoken clearly
- You repeat and get feedback

**Phase 5: Roleplay**
- Practice realistic scenarios
- VishwaSetu plays different roles (boss, shopkeeper, colleague)
- Immediate correction and encouragement

### Exiting the Session

Click the **"Exit"** button in the top-right corner to end the session.

---

## Troubleshooting

### Microphone Permission Denied

**Problem:** Browser blocks microphone access

**Solution:**
- Click the lock/info icon in the browser address bar
- Allow microphone permission for localhost
- Refresh the page
- On mobile: Check system-level microphone permissions

### API Key Errors

**Problem:** "Invalid API key" or connection failures

**Solution:**
1. Verify API key in `.env.local`
2. Ensure `NEXT_PUBLIC_GEMINI_API_KEY` is the exact variable name
3. Restart the development server (`npm run dev`)
4. Check API key validity at [Google AI Studio](https://aistudio.google.com/)

### Audio Not Playing

**Problem:** You see transcription but hear no voice

**Solution:**
- Check system volume and browser volume
- Ensure output device is correctly selected
- Try refreshing the page
- Check browser console for audio context errors

### Connection Issues

**Problem:** Session won't start or drops frequently

**Solution:**
- Check internet connection stability
- Verify API key has not exceeded quota
- Try using a different browser
- Check for firewall/VPN blocking WebSocket connections

### Peer Dependency Conflicts

**Problem:** Installation fails with peer dependency errors

**Solution:**
```bash
# Use the legacy peer deps flag
npm install --legacy-peer-deps

# Or force installation
npm install --force
```

---

## Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| **Chrome** | ✅ Full | ✅ Full | Recommended |
| **Edge** | ✅ Full | ✅ Full | Chromium-based, excellent |
| **Firefox** | ✅ Full | ⚠️ Limited | Desktop fully supported |
| **Safari** | ⚠️ Good | ⚠️ Limited | Some audio API limitations |
| **Opera** | ✅ Full | ✅ Good | Chromium-based |

**Notes:**
- HTTPS required in production for microphone access
- localhost is allowed without HTTPS in development
- Mobile Safari has some Web Audio API restrictions

---

## Deployment

### Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   - In Vercel project settings
   - Add `NEXT_PUBLIC_GEMINI_API_KEY` with your API key
   - Deploy

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel settings
   - Update DNS records

### Important Production Notes

- **HTTPS is mandatory** for microphone access
- Vercel provides HTTPS by default
- Test on mobile devices after deployment
- Monitor API usage and quotas
- Consider implementing rate limiting for production

---

## Future Enhancements

Planned features for future versions:

- [ ] **Progress Tracking**: Save learning history across sessions
- [ ] **User Profiles**: Multiple learners on one device
- [ ] **Lesson Library**: Pre-recorded common scenarios
- [ ] **Offline Mode**: Download lessons for offline practice
- [ ] **Additional Languages**: Expand both native and target languages
- [ ] **Pronunciation Scoring**: AI-powered accent analysis
- [ ] **Gamification**: Points, streaks, and achievements
- [ ] **Social Features**: Connect with other learners
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Certification**: Issue completion certificates

---

## Contributing

We welcome contributions from the community!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style Guidelines

- Follow existing TypeScript conventions
- Use meaningful variable names
- Comment complex logic
- Ensure all types are properly defined
- Run linting before committing

### Reporting Issues

Found a bug or have a suggestion? Please:
1. Check existing issues first
2. Create a new issue with clear description
3. Include steps to reproduce (for bugs)
4. Add screenshots if relevant

---

## License & Credits

### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Credits & Acknowledgments

- **Google Gemini Team** for the incredible Live API
- **Original Sample Code** from Google AI Studio
- **Next.js Team** at Vercel for the amazing framework
- **Open Source Community** for all the libraries used

### Powered By

- [Google Gemini 2.5 Flash Native Audio](https://ai.google.dev/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## Contact & Support

### Project Repository

[GitHub - VishwaSetu](https://github.com/yourusername/viswasethu)

### Documentation

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Support

For questions or issues:
- Open an issue on GitHub
- Email: support@vishwasetu.dev (placeholder)
- Join our community discussions

---

<div align="center">

**Built with ❤️ for the global Indian community**

*Empowering village voices through technology*

</div>
