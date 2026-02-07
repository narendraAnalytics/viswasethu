'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '@/constants/vishwasetu';
import { AppState, TranscriptionEntry } from '@/types/vishwasetu';
import { createPcmBlob, decodeBase64, decodeAudioData } from '@/services/audioUtils';
import { Mic, Sparkles, ArrowRight } from 'lucide-react';

// Maximum transcription entries to keep (prevents memory buildup)
const MAX_TRANSCRIPTIONS = 50;

export default function Home() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  // Refs for audio and session handling
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Buffers for incremental transcription
  const currentInputText = useRef('');
  const currentOutputText = useRef('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Clean up audio nodes to prevent memory leaks
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }

    if (mediaSourceRef.current) {
      mediaSourceRef.current.disconnect();
      mediaSourceRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextsRef.current) {
      try {
        audioContextsRef.current.input.close();
        audioContextsRef.current.output.close();
      } catch (e) {
        console.warn("Error closing audio contexts", e);
      }
      audioContextsRef.current = null;
    }

    // Stop and clear all active audio sources
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current.clear();
    activeSourcesRef.current = new Set();

    setAppState(AppState.SETUP);
    setSessionActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscriptions([]);
    currentInputText.current = '';
    currentOutputText.current = '';
  }, []);

  const startSession = async () => {
    try {
      setAppState(AppState.SESSION);
      setTranscriptions([]);
      setErrorMessage(null);
      currentInputText.current = '';
      currentOutputText.current = '';

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Keep context alive
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store for cleanup

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: SYSTEM_INSTRUCTION + "\n\nCRITICAL: Keep the conversation going. Never end the session unless the user says 'Goodbye' or 'Stop'. Always be the one to prompt the user if they fall silent after you teach them something.",
        },
        callbacks: {
          onopen: () => {
            setSessionActive(true);
            setIsListening(true);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

            // Store for cleanup
            mediaSourceRef.current = source;
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                // Only send if session is still alive in the promise
                if (session) {
                  session.sendRealtimeInput({ media: pcmBlob });
                }
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // Trigger initial greeting
            sessionPromise.then((session) => {
              session.sendRealtimeInput({
                text: "Namaste VishwaSetu. Please start the session by introducing yourself in English and asking for my native language. Remember: Once I tell you my native language, you must switch completely to that language for all future responses. This is critical."
              });
            });
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Incremental Input Transcription
            if (msg.serverContent?.inputTranscription) {
              currentInputText.current += msg.serverContent.inputTranscription.text;
              // We update the last entry if it was user, or add a new one
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                let updated: TranscriptionEntry[];
                if (last && last.role === 'user') {
                  updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentInputText.current };
                } else {
                  updated = [...prev, { role: 'user', text: currentInputText.current, timestamp: Date.now() }];
                }
                // Limit array size to prevent memory buildup
                return updated.length > MAX_TRANSCRIPTIONS
                  ? updated.slice(-MAX_TRANSCRIPTIONS)
                  : updated;
              });
            }

            // Incremental Output Transcription
            if (msg.serverContent?.outputTranscription) {
              currentOutputText.current += msg.serverContent.outputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                let updated: TranscriptionEntry[];
                if (last && last.role === 'model') {
                  updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentOutputText.current };
                } else {
                  updated = [...prev, { role: 'model', text: currentOutputText.current, timestamp: Date.now() }];
                }
                // Limit array size to prevent memory buildup
                return updated.length > MAX_TRANSCRIPTIONS
                  ? updated.slice(-MAX_TRANSCRIPTIONS)
                  : updated;
              });
            }

            if (msg.serverContent?.turnComplete) {
              // Finalize buffers for the next turn
              currentInputText.current = '';
              currentOutputText.current = '';
            }

            // Handle Audio Playback
            const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioBase64) {
              setIsSpeaking(true);
              const audioBytes = decodeBase64(audioBase64);
              const audioBuffer = await decodeAudioData(audioBytes, outputCtx, 24000, 1);

              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;

              activeSourcesRef.current.add(source);
              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              };
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) { }
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
              currentOutputText.current += " [Interrupted]";
            }
          },
          onerror: (err) => {
            console.error('Gemini Live error:', err);
            // Don't stop immediately if it's a minor error, but for major ones we reset
            if (err.type === 'error') {
              setErrorMessage('Connection lost. Please check your internet and try again.');
              setAppState(AppState.ERROR);
            }
          },
          onclose: (e) => {
            console.log('Gemini Live session closed', e);
            if (e.code !== 1000 && appState === AppState.SESSION) {
              setErrorMessage('The teacher had to leave unexpectedly. (Code: ' + e.code + ')');
              setAppState(AppState.ERROR);
            } else {
              stopSession();
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error('Failed to start session:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize session');
      setAppState(AppState.ERROR);
    }
  };

  // Scroll to bottom effect (debounced for performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const anchor = document.getElementById('scroll-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Wait 100ms before scrolling

    return () => clearTimeout(timeoutId);
  }, [transcriptions]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-slate-50 via-white to-indigo-50/40 text-slate-900 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50 border border-indigo-50 animate-logo overflow-hidden">
            <img
              src="/pagelogo.png"
              alt="VishwaSetu Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-emerald-700">
              VishwaSetu
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-bold">Bridge to the World</p>
          </div>
        </div>
        {appState === AppState.SESSION && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {sessionActive ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={stopSession}
              className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm"
            >
              Exit
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto">
        {appState === AppState.SETUP && (
          <div className="w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight flex flex-col items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center gap-4">
                  Your Voice <Mic className="w-12 h-12 md:w-16 md:h-16 text-sky-400 drop-shadow-sm" />
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center gap-4">
                  Your Future <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 drop-shadow-sm" />
                </span>
              </h2>
              <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Talk to VishwaSetu. No typing, just natural conversation in your mother tongue to master global languages.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-10">
              <button
                onClick={startSession}
                className="group relative px-20 py-8 rounded-[2rem] text-3xl font-black transition-all duration-500 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white hover:scale-105 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-emerald-500/40 active:scale-95 overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

                <span className="relative z-10 flex items-center space-x-5 text-sky-50">
                  <span>Start Learning</span>
                  <ArrowRight className="w-10 h-10 transition-transform group-hover:translate-x-2" />
                </span>
              </button>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span>Telugu</span> <span>•</span> <span>Hindi</span> <span>•</span> <span>Tamil</span> <span>•</span> <span>Kannada</span> <span>•</span> <span>Marathi</span>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.SESSION && (
          <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-700 h-full">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="mt-6 w-full bg-gradient-to-br from-white/90 to-slate-50/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
                <div className="relative flex items-center justify-center mb-10 shrink-0">
                  {/* Left Side Info */}
                  <div className="absolute left-0 hidden md:block">
                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      Live Session
                    </h4>
                  </div>

                  {/* Centered Live Indicator */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center space-x-3 bg-emerald-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100/50 shadow-sm">
                      <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.25em]">VishwaSetu Live</span>

                      <div className="flex items-center space-x-1 h-3 ml-1">
                        <div className="w-0.5 bg-emerald-400 rounded-full animate-wave-1"></div>
                        <div className="w-0.5 bg-emerald-500 rounded-full animate-wave-2"></div>
                        <div className="w-0.5 bg-emerald-400 rounded-full animate-wave-3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="absolute right-0">
                    <div className="text-[10px] text-sky-600 font-bold bg-sky-50 px-4 py-1.5 rounded-full border border-sky-100 uppercase tracking-wider">
                      Sustained
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6 max-h-[70vh] overflow-y-auto pr-2 scroll-smooth custom-scrollbar">
                  {transcriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-slate-400">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="italic font-bold tracking-wide animate-pulse">VishwaSetu is initializing your classroom...</p>
                    </div>
                  ) : (
                    transcriptions.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-6 duration-500`}
                      >
                        <div className={`text-[9px] mb-2 font-black uppercase tracking-widest ${entry.role === 'user' ? 'text-indigo-500 mr-4' : 'text-emerald-600 ml-4'}`}>
                          {entry.role === 'user' ? 'Your Voice' : 'Teacher VishwaSetu'}
                        </div>
                        <div className={`max-w-[85%] rounded-[1.75rem] px-6 py-4 text-base md:text-xl leading-relaxed shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${entry.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border border-indigo-400/20 rounded-tr-none shadow-indigo-200/30'
                          : 'bg-white text-teal-600 border border-slate-100 rounded-tl-none font-medium'
                          }`}>
                          {entry.text}
                          {(idx === transcriptions.length - 1 && (isListening || isSpeaking)) && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div id="scroll-anchor" className="h-4" />
                </div>
              </div>
            </div>

            {/* Bottom Microphone Status Bar */}
            <div className="w-full py-6 flex flex-col items-center justify-center relative">
              {/* Small animated microphone orb */}
              <div className="relative flex items-center justify-center">
                {/* Outer concentric ring */}
                <div className={`absolute w-24 h-24 rounded-full border-2 transition-all duration-700 ${
                  isListening ? 'border-blue-400/40 animate-ping' :
                  isSpeaking ? 'border-purple-400/40 animate-pulse' :
                  'border-slate-300/30'
                }`} />

                {/* Middle concentric ring */}
                <div className={`absolute w-20 h-20 rounded-full border-2 transition-all duration-500 ${
                  isListening ? 'border-blue-400/60' :
                  isSpeaking ? 'border-purple-400/60' :
                  'border-slate-300/50'
                }`} />

                {/* Core microphone circle */}
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isListening ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' :
                  isSpeaking ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30' :
                  'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20'
                }`}>
                  {/* Microphone icon */}
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              {/* Dynamic status text */}
              <div className="mt-6">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase opacity-60">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Always Recording • Just Speak and VishwaSetu Will Answer'}
                </p>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="text-center space-y-8 max-w-md animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900">Class Interrupted</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => { setAppState(AppState.SETUP); setErrorMessage(null); }}
              className="px-12 py-5 bg-slate-900 text-white rounded-full font-black text-xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              Restart Class
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase max-w-6xl w-full mx-auto border-t border-slate-100">
        Empowering Village Voices • Live Transactional AI
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.4);
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-logo {
          animation: logo-float 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        .animate-wave-1 { animation: wave 1s ease-in-out infinite; }
        .animate-wave-2 { animation: wave 1.2s ease-in-out infinite; delay: 0.1s; }
        .animate-wave-3 { animation: wave 0.8s ease-in-out infinite; delay: 0.2s; }
      `}} />
    </div>
  );
}
