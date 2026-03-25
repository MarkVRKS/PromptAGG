import React from 'react';
import { X, Copy } from 'lucide-react';

export default function PromptModal({ isOpen, onClose, promptText }) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    const btn = document.getElementById('copy-btn');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Скопировано! ✔️';
    btn.classList.add('bg-green-600');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('bg-green-600');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <div className="bg-white dark-theme:bg-slate-900 rounded-2xl p-8 max-w-3xl w-full shadow-2xl flex flex-col border border-slate-100 animate-in fade-in">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> Идеальное ТЗ сгенерировано
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Контент */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl mb-6 shadow-inner border border-slate-800">
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-gray-300 max-h-[50vh] overflow-y-auto hide-scroll leading-relaxed">
            {promptText}
          </pre>
        </div>

        {/* Кнопка копирования */}
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