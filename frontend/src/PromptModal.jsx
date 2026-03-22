import React from 'react';
import { X, Copy } from 'lucide-react';

export default function PromptModal({ isOpen, onClose, promptText }) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    // Небольшой визуальный фидбек вместо обычного alert
    const btn = document.getElementById('copy-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Скопировано! ✔️';
    btn.classList.add('bg-green-600');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('bg-green-600');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-[55] animate-in fade-in">
      <div className="bg-white rounded-[32px] p-8 max-w-3xl w-full shadow-2xl flex flex-col border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> Идеальное ТЗ сгенерировано
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-[#1e1e1e] p-6 rounded-2xl mb-6 shadow-inner border border-slate-800">
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-gray-300 max-h-[50vh] overflow-y-auto hide-scroll leading-relaxed">
            {promptText}
          </pre>
        </div>
        
        <button 
          id="copy-btn"
          onClick={handleCopy} 
          className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-purple-700 transition-all flex justify-center items-center gap-2"
        >
          <Copy className="w-4 h-4" /> Скопировать текст
        </button>
      </div>
    </div>
  );
}