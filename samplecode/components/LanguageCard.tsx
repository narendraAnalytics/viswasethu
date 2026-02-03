
import React from 'react';
import { Language } from '../types';

interface LanguageCardProps {
  language: Language;
  selected: boolean;
  onSelect: (lang: Language) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ language, selected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(language)}
      className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
        selected 
          ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105' 
          : 'bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
      }`}
    >
      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
        {language.flag}
      </span>
      <span className="text-lg font-semibold text-white">
        {language.nativeName}
      </span>
      <span className="text-xs text-slate-400 mt-1">
        {language.name}
      </span>
      {selected && (
        <div className="absolute -top-2 -right-2 bg-blue-400 text-white p-1 rounded-full shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
