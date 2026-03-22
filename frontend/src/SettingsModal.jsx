import React from 'react';
import { X, Sun, Moon, Palette, Check, Settings2, Github, ExternalLink } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentTheme, setTheme, projectId }) {
  const themes = [
    { 
      id: 'light', 
      label: 'Светлая классика', 
      icon: Sun, 
      color: 'bg-white', 
      activeClass: 'border-purple-500 bg-purple-50 text-slate-900 shadow-sm' 
    },
    { 
      id: 'dark', 
      label: 'Глубокая полночь', 
      icon: Moon, 
      color: 'bg-slate-800', 
      activeClass: 'border-purple-400 bg-slate-800 text-white shadow-md' 
    },
    { 
      id: 'pixel', 
      label: 'Pixel Space', 
      icon: Palette, 
      color: 'bg-purple-950', 
      activeClass: 'border-cyan-400 bg-purple-950/50 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
    },
  ];

  return (
    <>
      {/* Затемнение фона (упрощенное для скорости) */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Оптимизированная панель */}
      <div className={`fixed right-0 top-[73px] h-[calc(100vh-73px)] w-[380px] bg-[var(--bg-card)] border-l border-[var(--border-main)] z-50 transform-gpu transition-transform duration-300 ease-out will-change-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-7 border-b border-[var(--border-main)] flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-[var(--text-main)] flex items-center gap-3">
            <Settings2 className="text-purple-500 w-5 h-5" /> Параметры
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 space-y-8 flex flex-col h-[calc(100%-80px)]">
          {/* Секция тем */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Интерфейс</label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-150 ${
                    currentTheme === t.id 
                      ? t.activeClass 
                      : 'border-transparent bg-slate-100/50 dark:bg-slate-800/30 text-[var(--text-main)] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center border border-black/5`}>
                      <t.icon className={`w-5 h-5 ${t.id === 'pixel' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <span className="font-bold text-sm">{t.label}</span>
                  </div>
                  {currentTheme === t.id && (
                    <Check className={`w-5 h-5 ${t.id === 'pixel' ? 'text-cyan-400' : 'text-purple-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Секция GitHub (Твое золото) */}
          <div className="mt-auto space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Разработка</label>
            <a 
              href="https://github.com/MarkVRKS/PromptAGG" 
              target="_blank" 
              rel="noreferrer"
              className="group flex items-center justify-between p-5 bg-slate-900 dark:bg-purple-950/40 rounded-[24px] border border-slate-800 hover:border-purple-500 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Github className="w-7 h-7 text-slate-900" />
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-sm leading-tight">PromptAGG Source</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">github.com/MarkVRKS</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </a>
            
            <div className="pt-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Build 2026.03 — {projectId?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}