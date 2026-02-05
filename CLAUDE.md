# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VishwaSetu ("Bridge to the World" in Sanskrit) is an AI-powered voice-first language learning platform for India's global workforce. It teaches foreign languages to migrant workers, students, and professionals using their native Indian language as the instruction medium.

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, Google Gemini 2.5 Flash Native Audio API

## Development Commands

```bash
# Install dependencies (REQUIRED flag due to React 19)
npm install --legacy-peer-deps

# Run development server (opens on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Important**: Always use `--legacy-peer-deps` flag when installing packages due to React 19 peer dependency requirements.

## Environment Setup

Required environment variable in `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

- The `NEXT_PUBLIC_` prefix is mandatory for client-side access in Next.js
- Get API key from https://aistudio.google.com/apikey
- Never commit `.env.local` or `.env` files

## Architecture Overview

### Client-Side Only Application

This is a **fully client-side application** with no server-side processing:
- All components use `'use client'` directive
- Direct browser-to-Gemini WebSocket connections via `@google/genai`
- No API routes or backend endpoints
- State managed via React hooks (useState, useRef, useCallback)

### Real-Time Audio Pipeline

**Input Flow:**
1. Microphone → `getUserMedia()` → AudioContext (16kHz)
2. ScriptProcessor → Float32Array → 16-bit PCM conversion
3. Base64 encoding → WebSocket → Gemini Live API

**Output Flow:**
1. Gemini Live API → Base64 PCM audio (24kHz)
2. Base64 decoding → Uint8Array → AudioBuffer
3. AudioBufferSourceNode → Speakers with precise timing

### Core State Management

Application state is managed through `AppState` enum (src/types/vishwasetu.ts:15):
- `SETUP`: Initial screen, not connected
- `SESSION`: Active voice session with Gemini
- `ERROR`: Connection/runtime error state

Audio state tracked via refs to prevent re-renders:
- `sessionRef`: Gemini Live session instance
- `audioContextsRef`: Input (16kHz) and output (24kHz) contexts
- `activeSourcesRef`: Set of playing audio sources for interruption handling
- `nextStartTimeRef`: Audio scheduling for glitch-free playback

### Directory Structure

```
src/
├── app/
│   ├── page.tsx           # Main application (voice session logic)
│   ├── layout.tsx         # Root layout with metadata
│   └── globals.css        # Global styles
├── components/
│   ├── VoiceOrb.tsx      # Animated voice visualization component
│   └── ui/               # shadcn/ui components (auto-generated)
├── services/
│   └── audioUtils.ts     # PCM encoding/decoding utilities
├── constants/
│   └── vishwasetu.ts     # System instructions, language definitions
├── types/
│   └── vishwasetu.ts     # TypeScript interfaces and enums
└── lib/
    └── utils.ts          # Utility functions (cn for Tailwind)
```

### Key Architecture Patterns

**1. Incremental Transcription Handling**

The application displays real-time transcriptions using refs to buffer partial text (src/app/page.tsx:26-27):
- `currentInputText.current`: Accumulates user speech transcription
- `currentOutputText.current`: Accumulates model speech transcription
- Updated incrementally via `serverContent.inputTranscription` and `serverContent.outputTranscription` events
- Finalized on `turnComplete` event

**2. Audio Scheduling**

Audio playback uses `nextStartTimeRef` to schedule buffers sequentially (src/app/page.tsx:160-162):
- Prevents audio gaps/overlaps
- Calculates next start time as: `max(nextStartTime, currentTime) + buffer.duration`
- Handles interruptions by stopping all active sources and resetting to 0

**3. WebSocket Lifecycle**

Session lifecycle managed through callbacks (src/app/page.tsx:84-200):
- `onopen`: Initialize audio capture, trigger greeting
- `onmessage`: Handle transcriptions, audio chunks, interruptions
- `onerror`: Set error state, stop session
- `onclose`: Graceful cleanup or error display

**4. System Instructions**

The AI teacher persona is defined in `SYSTEM_INSTRUCTION` (src/constants/vishwasetu.ts:22-72):
- Phase-based conversation flow (welcome → target selection → job context → teaching → roleplay)
- CRITICAL RULE: All instructions in user's native language, only target phrases in foreign language
- Job-specific vocabulary adaptation
- Cultural etiquette integration

## Common Development Tasks

### Modifying System Instructions

Edit `src/constants/vishwasetu.ts` → `SYSTEM_INSTRUCTION` string. Changes apply on next session start.

### Adding New Languages

1. Add to `NATIVE_LANGUAGES` or `TARGET_LANGUAGES` arrays in `src/constants/vishwasetu.ts`
2. Update system instruction to mention new language
3. No code changes needed in page.tsx (language selection is voice-based)

### Customizing Voice Orb

Edit `src/components/VoiceOrb.tsx`:
- States: `isListening` (blue, pulsing), `isSpeaking` (purple, waveform), idle (gray)
- Animations defined via Tailwind classes

### Debugging Audio Issues

Audio processing happens in two contexts:
- Input: Check `audioContextsRef.current.input` (16kHz sample rate)
- Output: Check `audioContextsRef.current.output` (24kHz sample rate)

Common issues:
- **No audio**: Check `AudioContext.state` (may be suspended, call `resume()`)
- **Choppy playback**: Verify `nextStartTimeRef` scheduling logic
- **Microphone blocked**: Browser permission denied, check via DevTools

### Testing WebSocket Connection

Session starts in `startSession()` (src/app/page.tsx:52):
- Model: `gemini-2.5-flash-native-audio-preview-12-2025`
- Voice: `Puck` (preset voice config)
- Response modality: Audio only
- Both input and output transcription enabled

Check console for connection errors. Gemini Live API requires:
- Valid API key with Gemini Live access
- Stable WebSocket connection
- Browser support for Web Audio API

## Important Technical Notes

### React 19 Compatibility

- Many dependencies haven't updated peer dependencies for React 19
- ALWAYS use `npm install --legacy-peer-deps` or `npm install --force`
- All functionality works despite peer dependency warnings

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` → `./src/*`
- Example: `import { SYSTEM_INSTRUCTION } from '@/constants/vishwasetu'`

### shadcn/ui Components

Pre-installed UI components in `src/components/ui/`:
- Configured via `components.json`
- Style: New York variant
- Base color: Neutral
- Using Lucide React for icons

### Audio Context Lifecycle

CRITICAL: Audio contexts must be kept alive during session:
```typescript
if (inputCtx.state === 'suspended') await inputCtx.resume();
if (outputCtx.state === 'suspended') await outputCtx.resume();
```

Browsers auto-suspend audio contexts to save resources. Always resume before use.

### Interruption Handling

When user speaks while model is speaking (src/app/page.tsx:173-181):
1. Gemini sends `interrupted` event
2. Stop all active audio sources
3. Clear sources set and reset timing
4. Append "[Interrupted]" to transcription

This prevents audio overlap and maintains conversation flow.

## Migration from Vite (Original Implementation)

Original Vite-based code is preserved in `samplecode/` directory. Key differences:

| Aspect | Vite | Next.js |
|--------|------|---------|
| Client directive | Not needed | `'use client'` required |
| Env var prefix | `API_KEY` | `NEXT_PUBLIC_GEMINI_API_KEY` |
| Entry point | `index.tsx` | `src/app/page.tsx` |
| Routing | React Router | Next.js App Router |
| Build tool | Vite | Next.js (Turbopack) |

## Browser Compatibility

Tested on:
- Chrome/Edge (Recommended): Full support
- Firefox: Full desktop support, limited mobile
- Safari: Some Web Audio API limitations

Requirements:
- Web Audio API support
- WebSocket support
- MediaDevices.getUserMedia support
- HTTPS (in production, localhost allowed in dev)

## Deployment Notes

Recommended platform: Vercel (optimized for Next.js)

1. Add `NEXT_PUBLIC_GEMINI_API_KEY` to environment variables
2. Deploy (HTTPS provided automatically)
3. Test microphone permissions on deployed URL
4. Monitor Gemini API usage/quotas

**Production requirements:**
- HTTPS mandatory for microphone access
- Consider rate limiting
- Monitor API costs (audio streaming can be expensive)
