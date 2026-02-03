'use client'

import React from 'react';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ isListening, isSpeaking }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Glow Rings */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
        isListening ? 'bg-blue-500/20 animate-ping' : ''
      } ${isSpeaking ? 'bg-purple-500/20 animate-pulse' : ''}`} />

      <div className={`absolute inset-4 rounded-full transition-all duration-700 ${
        isListening ? 'border-2 border-blue-400/50 scale-110' : 'border border-slate-700'
      } ${isSpeaking ? 'border-2 border-purple-400/50 scale-105' : ''}`} />

      {/* Main Orb */}
      <div className={`relative w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
        isListening
          ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 scale-110 shadow-blue-500/50'
          : isSpeaking
          ? 'bg-gradient-to-tr from-purple-600 to-pink-400 scale-105 shadow-purple-500/50'
          : 'bg-gradient-to-tr from-slate-700 to-slate-600 shadow-slate-900/50'
      }`}>
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />

        {/* Dynamic Center Icon */}
        <div className="relative z-10">
          {isListening ? (
             <svg className="w-16 h-16 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          ) : isSpeaking ? (
            <div className="flex space-x-1 items-end h-12">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 80}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="w-4 h-4 bg-white/20 rounded-full" />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="absolute -bottom-12 font-medium text-slate-300 tracking-wider uppercase text-sm">
        {isListening ? 'Listening...' : isSpeaking ? 'Gemini is speaking' : 'Standing By'}
      </div>
    </div>
  );
};
