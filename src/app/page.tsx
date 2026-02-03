'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '@/constants/vishwasetu';
import { AppState, TranscriptionEntry } from '@/types/vishwasetu';
import { VoiceOrb } from '@/components/VoiceOrb';
import { createPcmBlob, decodeBase64, decodeAudioData } from '@/services/audioUtils';

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

  // Buffers for incremental transcription
  const currentInputText = useRef('');
  const currentOutputText = useRef('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
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
                text: "Namaste VishwaSetu. Please start the session by introducing yourself and asking for my native language as per your instructions."
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
                if (last && last.role === 'user') {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentInputText.current };
                  return updated;
                }
                return [...prev, { role: 'user', text: currentInputText.current, timestamp: Date.now() }];
              });
            }

            // Incremental Output Transcription
            if (msg.serverContent?.outputTranscription) {
              currentOutputText.current += msg.serverContent.outputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: currentOutputText.current };
                  return updated;
                }
                return [...prev, { role: 'model', text: currentOutputText.current, timestamp: Date.now() }];
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
                try { s.stop(); } catch(e) {}
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

  // Scroll to bottom effect
  useEffect(() => {
    const anchor = document.getElementById('scroll-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptions]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-emerald-200">
              VishwaSetu
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-bold">Bridge to the World</p>
          </div>
        </div>
        {appState === AppState.SESSION && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <div className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {sessionActive ? 'Active' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={stopSession}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold text-sm transition-all active:scale-95"
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
              <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                Your Voice,<br/><span className="text-emerald-400">Your Future.</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Talk to VishwaSetu. No typing, just natural conversation in your mother tongue to master global languages.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-8">
              <button
                onClick={startSession}
                className="group relative px-20 py-8 rounded-full text-3xl font-black transition-all duration-500 bg-white text-slate-900 hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-emerald-500/40 active:scale-95"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-500 flex items-center space-x-5">
                  <span>Start Learning</span>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                <span>Telugu</span> <span>•</span> <span>Hindi</span> <span>•</span> <span>Tamil</span> <span>•</span> <span>Kannada</span> <span>•</span> <span>Marathi</span>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.SESSION && (
          <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-700 h-full">
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
              <VoiceOrb isListening={isListening} isSpeaking={isSpeaking} />

              <div className="mt-12 w-full bg-slate-800/40 rounded-[2.5rem] p-6 md:p-10 border border-slate-700/50 glass shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-[0_0_8px_#10b981]" />
                    Live Language Transaction
                  </h4>
                  <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    Sustained Session
                  </div>
                </div>

                <div className="flex-1 space-y-6 max-h-[45vh] overflow-y-auto pr-2 scroll-smooth custom-scrollbar">
                  {transcriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-slate-500">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
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
                         <div className={`text-[9px] mb-2 font-black uppercase tracking-widest ${entry.role === 'user' ? 'text-indigo-400 mr-4' : 'text-emerald-400 ml-4'}`}>
                          {entry.role === 'user' ? 'Your Voice' : 'Teacher VishwaSetu'}
                        </div>
                        <div className={`max-w-[85%] rounded-[1.75rem] px-6 py-4 text-base md:text-xl leading-relaxed shadow-xl transition-all ${
                          entry.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-indigo-50 border border-indigo-400/30 rounded-tr-none'
                            : 'bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-white border border-white/5 rounded-tl-none'
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

            <div className="w-full text-center pb-6">
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase opacity-60">
                Always Recording • Just Speak and VishwaSetu Will Answer
              </p>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="text-center space-y-8 max-w-md animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-500/20">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white">Class Interrupted</h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => { setAppState(AppState.SETUP); setErrorMessage(null); }}
              className="px-12 py-5 bg-white text-slate-900 rounded-full font-black text-xl hover:bg-slate-200 transition-all shadow-2xl active:scale-95"
            >
              Restart Class
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-700 text-[10px] font-black tracking-[0.4em] uppercase max-w-6xl w-full mx-auto border-t border-slate-800/50">
        Empowering Village Voices • Live Transactional AI
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}} />
    </div>
  );
}
