import React, { useState, memo } from 'react';
import { 
  Minimize2, Plus, Trash2, Link, 
  CheckCircle2, Sparkles, ChevronDown, ExternalLink, ImagePlus 
} from 'lucide-react';
import api from './api';
import PromptModal from './PromptModal';

// --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ---
const mnsSettings = {
  style: "high-end commercial photography, Pinterest aesthetic, minimalist, clean lines, bright light-gray background, highly detailed, photorealistic",
  brand: "focus on modern stylish shoes, footwear photography, fashion brand catalog style. МНС-Обувь - производство качественной и стильной обуви.",
  typo: "📌 Типографика:\n- Гротеск с мягкими формами, без острых углов.\n- Основной: FindSansPro Bold."
};

const platformsInfo = [
  { id: "VK", label: "VK", activeClass: "bg-blue-600 text-white shadow-md shadow-blue-300" },
  { id: "TG", label: "TG", activeClass: "bg-sky-500 text-white shadow-md shadow-sky-300" },
  { id: "INST", label: "IG", activeClass: "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-pink-300" },
  { id: "YT", label: "YT", activeClass: "bg-red-600 text-white shadow-md shadow-red-300" },
  { id: "MAX", label: "MX", activeClass: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-300" }
];

const getEmptyPlatform = () => ({
  step: 0, rubric: "", format: "", promptTab: "text",
  textPrompt: { role: "Ты креативный SMM-специалист.", tone: "", details: "", constraints: "", useMns: true },
  visualPrompt: { format: "Картинка 1:1", essence: "", useColors: false, colors: [], useMns: true, textOverlay: "" },
  finalText: "", refs: "", mediaLink: "" 
});

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full text-left">
      <div className="text-[10px] font-black text-slate-400 dark-theme:text-slate-500 uppercase tracking-widest mb-1.5 pl-1">{label}</div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-[var(--bg-input)] border border-[var(--border-main)] p-4 rounded-xl hover:border-purple-400 transition-all group">
        <span className="text-sm font-bold text-[var(--text-main)]">{value || "Выберите..."}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <><div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-main)] shadow-xl rounded-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 ${value === opt ? 'text-purple-600 bg-purple-50/50' : 'text-[var(--text-main)]'}`}>{opt}</button>
          ))}
        </div></>
      )}
    </div>
  );
};

// --- КОМПОНЕНТ КАРТОЧКИ (ОПТИМИЗИРОВАН) ---
const PostCard = memo(function PostCard({ post, refreshPosts, onOpenPrompt }) {
  const [localPost, setLocalPost] = useState(post);
  const [activePlatform, setActivePlatform] = useState(Object.keys(post?.platforms || {})[0] || 'VK');

  const saveToDB = async (updatedPost) => {
    try { await api.updatePost(updatedPost.id, updatedPost); } 
    catch (e) { console.error("Ошибка сохранения:", e); }
  };

  const updatePlatformData = (field, value) => {
    const updated = { ...localPost };
    if (!updated.platforms) updated.platforms = {};
    if (!updated.platforms[activePlatform]) updated.platforms[activePlatform] = getEmptyPlatform();
    updated.platforms[activePlatform][field] = value;
    setLocalPost(updated);
    if (field === 'promptTab' || field === 'rubric' || field === 'format' || field === 'step') saveToDB(updated);
    else if (field !== 'finalText' && field !== 'refs' && field !== 'mediaLink') saveToDB(updated);
  };

  const updatePromptData = (promptType, field, value) => {
    const updated = { ...localPost };
    if (!updated.platforms?.[activePlatform]) return;
    if (!updated.platforms[activePlatform][promptType]) {
        updated.platforms[activePlatform][promptType] = getEmptyPlatform()[promptType];
    }
    updated.platforms[activePlatform][promptType][field] = value;
    setLocalPost(updated);
    if (typeof value === 'boolean' || field === 'format') saveToDB(updated); 
  };

  const toggleColor = (color) => {
    const updated = { ...localPost };
    const vp = updated.platforms?.[activePlatform]?.visualPrompt;
    if (!vp) return;
    if (!vp.colors) vp.colors = [];
    vp.colors = vp.colors.includes(color) ? vp.colors.filter(c => c !== color) : [...vp.colors, color];
    setLocalPost(updated); saveToDB(updated);
  };

  const pData = localPost?.platforms?.[activePlatform] || getEmptyPlatform();
  const setStep = (num) => updatePlatformData('step', num);

  const generatePrompt = () => {
    const data = localPost?.platforms?.[activePlatform] || getEmptyPlatform();
    let resultStr = "";
    if (data.promptTab === 'text') {
        const tp = data.textPrompt || {};
        resultStr = `[Роль]: ${tp.role}\n\n[Тема]: ${localPost.topic}\n\n[Детали]: ${tp.details}`;
    } else {
        const vp = data.visualPrompt || {};
        resultStr = `[AI Prompt]: ${vp.essence}, style: ${mnsSettings.style}`;
    }
    onOpenPrompt(resultStr);
  };

  return (
    <div className="theme-card p-6 rounded-[32px] shadow-lg shadow-slate-200/20 dark-theme:shadow-none flex flex-col gap-5 animate-in fade-in transition-all">
      <div className="flex gap-1.5 bg-[var(--bg-input)] p-1.5 rounded-xl overflow-x-auto hide-scroll shrink-0">
        {platformsInfo.map(plat => {
          const hasContent = localPost?.platforms?.[plat.id]?.step >= 1;
          const btnClass = plat.id === activePlatform ? plat.activeClass : (hasContent ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]');
          return <button key={plat.id} onClick={() => setActivePlatform(plat.id)} className={`text-[10px] font-black uppercase px-3.5 py-2 rounded-lg transition-all ${btnClass} shrink-0`}>{plat.id}</button>;
        })}
      </div>

      <input type="text" value={localPost.topic} onChange={(e) => setLocalPost({...localPost, topic: e.target.value})} onBlur={() => saveToDB(localPost)} placeholder="Тема поста..." className="w-full font-black text-xl outline-none bg-transparent border-b border-transparent focus:border-purple-400 pb-1.5 text-[var(--text-main)] transition-colors" />

      <div className="flex gap-1.5 mt-1">
        {["Бриф", "Промпт", "СММ", "Дизайн", "Готово"].map((s, idx) => (
          <div key={s} onClick={() => setStep(idx)} className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer group">
            <div className={`h-2 w-full rounded-full transition-all ${idx < pData.step ? 'bg-green-500' : idx === pData.step ? 'bg-purple-500' : 'bg-[var(--bg-input)]'}`}></div>
            <span className={`text-[9px] uppercase font-black ${idx <= pData.step ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[250px]">
        {pData.step === 0 && (
          <div className="space-y-5 fade-in">
            <CustomSelect label="Рубрика" value={pData.rubric} options={["Продающий", "Вовлекающий", "Экспертный", "Ситуативный"]} onChange={(v) => updatePlatformData('rubric', v)} />
            <CustomSelect label="Формат" value={pData.format} options={["Текст + Фото", "Видео/Reels", "Инфографика"]} onChange={(v) => updatePlatformData('format', v)} />
            <button onClick={() => setStep(1)} className="w-full py-4.5 mt-3 bg-slate-900 dark-theme:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-500 active:scale-95 transition-all">Далее ➔</button>
          </div>
        )}

        {pData.step === 1 && (
          <div className="space-y-4 fade-in flex flex-col">
            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl shrink-0">
              <button onClick={() => updatePlatformData('promptTab', 'text')} className={`flex-1 py-2 text-xs font-black rounded-lg ${pData.promptTab === 'text' ? 'bg-[var(--bg-card)] text-purple-600 shadow-sm' : 'text-[var(--text-muted)]'}`}>ТЕКСТ</button>
              <button onClick={() => updatePlatformData('promptTab', 'visual')} className={`flex-1 py-2 text-xs font-black rounded-lg ${pData.promptTab !== 'text' ? 'bg-[var(--bg-card)] text-purple-600 shadow-sm' : 'text-[var(--text-muted)]'}`}>ВИЗУАЛ</button>
            </div>
            <div className="bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-main)] space-y-4 text-left flex-1">
              {pData.promptTab === 'text' ? (
                <>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase pl-1">Роль ИИ</label><input type="text" value={pData?.textPrompt?.role || ""} onChange={(e) => updatePromptData('textPrompt', 'role', e.target.value)} onBlur={() => saveToDB(localPost)} className="w-full mt-1.5 text-sm font-bold bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-main)] text-[var(--text-main)] outline-none" /></div>
                  <textarea value={pData?.textPrompt?.details || ""} onChange={(e) => updatePromptData('textPrompt', 'details', e.target.value)} onBlur={() => saveToDB(localPost)} placeholder="Суть поста..." className="w-full text-sm font-semibold bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-main)] text-[var(--text-main)] h-20 resize-none outline-none" />
                </>
              ) : (
                <>
                  <textarea value={pData?.visualPrompt?.essence || ""} onChange={(e) => updatePromptData('visualPrompt', 'essence', e.target.value)} onBlur={() => saveToDB(localPost)} placeholder="Что на картинке?" className="w-full text-sm font-semibold bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-main)] text-[var(--text-main)] h-20 resize-none outline-none" />
                  <div className="grid grid-cols-2 gap-2">{['Amethyst', 'Tiffany', 'Peach', 'Slate'].map(c => <label key={c} className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-main)]"><input type="checkbox" checked={pData?.visualPrompt?.colors?.includes(c)} onChange={() => toggleColor(c)} className="accent-purple-500" /> {c}</label>)}</div>
                </>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={generatePrompt} className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:bg-purple-700 flex justify-center items-center gap-2.5 transition-all active:scale-95"><Sparkles className="w-4 h-4" /> Сгенерировать ТЗ</button>
              <button onClick={() => setStep(2)} className="w-14 bg-slate-900 dark-theme:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center transition-all text-lg active:scale-95">➔</button>
            </div>
          </div>
        )}

        {pData.step === 2 && (
          <div className="space-y-4 fade-in flex flex-col text-left">
            <div className="bg-green-50/50 dark-theme:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark-theme:border-green-800 flex-1 flex flex-col h-32">
              <label className="text-[10px] font-black text-green-700 dark-theme:text-green-400 uppercase tracking-widest mb-1.5 pl-1">Текст поста для публикации</label>
              <textarea value={pData.finalText} onChange={(e) => updatePlatformData('finalText', e.target.value)} onBlur={() => saveToDB(localPost)} placeholder="Вставьте готовый текст..." className="w-full text-sm font-semibold bg-[var(--bg-card)] p-4 rounded-xl border border-green-200 dark-theme:border-green-800 outline-none text-[var(--text-main)] flex-1 resize-none" />
            </div>
            <div className="bg-slate-50 dark-theme:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark-theme:border-slate-800">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Референсы</label>
              <input type="text" value={pData.refs} onChange={(e) => updatePlatformData('refs', e.target.value)} onBlur={() => saveToDB(localPost)} placeholder="https://..." className="w-full text-sm font-bold bg-[var(--bg-card)] p-3 rounded-xl border border-slate-200 dark-theme:border-slate-700 outline-none text-[var(--text-main)]" />
            </div>
            <button onClick={() => setStep(3)} className="w-full py-4.5 bg-slate-900 dark-theme:bg-purple-600 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-600 active:scale-95 transition-all">В Дизайн ➔</button>
          </div>
        )}

        {pData.step === 3 && (
          <div className="space-y-4 fade-in h-full flex flex-col text-left">
            <div className="bg-blue-50/50 dark-theme:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark-theme:border-blue-900/20 flex-1">
              <div className="flex items-center gap-3 mb-4 text-blue-700 dark-theme:text-blue-400"><Link className="w-5 h-5" /><label className="text-[10px] font-black uppercase tracking-widest">Ссылка на результат (облако)</label></div>
              <textarea value={pData.mediaLink} onChange={(e) => updatePlatformData('mediaLink', e.target.value)} onBlur={() => saveToDB(localPost)} placeholder="Google Drive, Pinterest..." className="w-full text-sm font-semibold bg-[var(--bg-card)] p-4 rounded-xl border border-blue-200 dark-theme:border-blue-800 outline-none text-[var(--text-main)] h-28 resize-none focus:ring-2 ring-blue-500/20" />
            </div>
            <button onClick={() => setStep(4)} className="w-full py-4.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 active:scale-95 transition-all">Медиа готово ➔</button>
          </div>
        )}

        {pData.step === 4 && (
          <div className="space-y-4 fade-in text-center">
            <div className="bg-emerald-50 dark-theme:bg-emerald-900/10 border border-emerald-100 dark-theme:border-emerald-800 p-8 rounded-3xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-black text-emerald-900 dark-theme:text-emerald-400 text-base uppercase">Пост полностью готов 🎉</h4>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3.5 bg-white dark-theme:bg-slate-800 border border-[var(--border-main)] text-slate-500 dark-theme:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Нужны правки</button>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--border-main)] pt-4 mt-3">
        <button onClick={async () => { if(window.confirm("Удалить карточку?")) { await api.deletePost(localPost.id); refreshPosts(); } }} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-all p-1 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/> Удалить карточку</button>
      </div>
    </div>
  );
});

// --- ГЛАВНЫЙ КОМПОНЕНТ BOARD (ОПТИМИЗИРОВАН) ---
const Board = memo(function Board({ projectId, posts, refreshPosts }) {
  const [expanded, setExpanded] = useState([]); 
  const [modal, setModal] = useState({ open: false, text: "" });

  const days = Array.from({length: 31}, (_, i) => { 
    const d = i + 1; 
    const dateStr = `2026-03-${String(d).padStart(2, '0')}`; 
    const dateObj = new Date(dateStr);
    // ИСПРАВЛЕНО: Массив сокращений
    const weekdayShort = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][dateObj.getDay()];
    const weekdayFull = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'][dateObj.getDay()];
    return { num: d, dateStr, weekdayShort, weekdayFull }; 
  });

  return (
    <>
      <PromptModal isOpen={modal.open} onClose={() => setModal({open: false, text: ""})} promptText={modal.text} />
      {days.map(day => {
        const isExp = expanded.includes(day.dateStr);
        const dayPosts = posts.filter(p => p.publish_date === day.dateStr);

        if (!isExp) {
          const activePlats = new Set();
          dayPosts.forEach(p => { 
            if (p?.platforms) {
              Object.keys(p.platforms).forEach(id => { if (p.platforms[id]?.step >= 1) activePlats.add(id); }); 
            }
          });
          
          return (
            <div key={day.num} onClick={() => setExpanded([...expanded, day.dateStr])} className="w-[90px] shrink-0 theme-card rounded-[28px] flex flex-col items-center py-6 cursor-pointer hover:translate-y-[-4px] transition-all h-[80vh] relative overflow-hidden group">
              {/* ИСПРАВЛЕНО: Сокращенные названия (Пн, Вт...), четко по центру */}
              <span className="text-[12px] font-black uppercase text-[var(--text-muted)] mb-1 tracking-wider">{day.weekdayShort}</span>
              <span className="text-4xl font-black text-[var(--text-main)] leading-none">{day.num}</span>
              
              <div className="mt-10 flex flex-col gap-2.5">
                {platformsInfo.map(plat => (
                  <div key={plat.id} className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-[10px] font-black transition-all border-2 ${activePlats.has(plat.id) ? `${plat.activeClass} border-[var(--gold)] shadow-lg` : "bg-[var(--bg-input)] text-[var(--text-muted)] border-transparent"}`}>
                    {plat.label}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={day.num} className="w-[480px] shrink-0 bg-[var(--bg-column)] backdrop-blur-sm rounded-[40px] p-5 border border-[var(--border-main)] flex flex-col h-[85vh] relative transition-all">
            <div className="flex justify-between items-center mb-5 px-2 shrink-0">
              {/* ИСПРАВЛЕНО: Число и Полный день недели на одном уровне (baseline) */}
              <h3 className="font-black text-xl text-[var(--text-main)] flex items-baseline gap-2">
                {day.num} МАРТА <span className="text-purple-500 text-sm font-black uppercase tracking-wider">{day.weekdayFull}</span>
              </h3>
              <button onClick={() => setExpanded(expanded.filter(d => d !== day.dateStr))} className="w-9 h-9 theme-card rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"><Minimize2 className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto hide-scroll space-y-6 pb-5 px-1">
              {dayPosts.map(p => <PostCard key={p.id} post={p} refreshPosts={refreshPosts} onOpenPrompt={(t)=>setModal({open:true, text:t})} />)}
              <button onClick={() => api.createPost({project_id: projectId, publish_date: day.dateStr, topic: "", platforms: {"VK": getEmptyPlatform()}}).then(refreshPosts)} className="w-full py-5 border-2 border-dashed border-slate-300 dark-theme:border-slate-700 rounded-[32px] text-slate-400 font-black text-xs uppercase hover:border-purple-400 bg-[var(--bg-card)]/50 transition-all">+ Добавить карточку</button>
            </div>
          </div>
        );
      })}
    </>
  );
});

export default Board;