import React, { useState, useMemo, memo } from 'react';
import {
  Minimize2, Plus, Trash2, Link,
  CheckCircle2, Sparkles, ChevronDown, X,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';
import api from './api';
import PromptModal from './PromptModal';

// --- глобальные настройки ---
const mnsSettings = {
  style: "high-end commercial photography, Pinterest aesthetic, minimalist, clean lines, bright light-gray background, highly detailed, photorealistic",
  brand: "focus on modern stylish shoes, footwear photography, fashion brand catalog style. МНС-Обувь - производство качественной и стильной обуви.",
  typo: "📌 Типографика:\n- Гротеск с мягкими формами, без острых углов.\n- Основной: FindSansPro Bold."
};

const platformsInfo = [
  { id: "VK", label: "VK", activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-300/50" },
  { id: "TG", label: "TG", activeClass: "bg-sky-500 text-white shadow-lg shadow-sky-300/50" },
  { id: "INST", label: "IG", activeClass: "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-300/50" },
  { id: "YT", label: "YT", activeClass: "bg-red-600 text-white shadow-lg shadow-red-300/50" },
  { id: "MAX", label: "MX", activeClass: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-300/50" }
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
      <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">{label}</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--bg-input)] border-2 border-[var(--border-main)] p-5 rounded-2xl hover:border-purple-400 transition-all group"
      >
        <span className="text-base font-black text-[var(--text-main)]">{value || "Выберите..."}</span>
        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-2xl rounded-[24px] z-50 py-3 animate-in fade-in slide-in-from-top-2 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-6 py-4 text-sm font-black transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 ${value === opt ? 'text-purple-600 bg-purple-50/50' : 'text-[var(--text-main)]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- компонент карточки ---
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
    saveToDB(updated);
  };

  const updatePromptData = (promptType, field, value) => {
    const updated = { ...localPost };
    if (!updated.platforms?.[activePlatform]) return;
    if (!updated.platforms[activePlatform][promptType]) {
      updated.platforms[activePlatform][promptType] = getEmptyPlatform()[promptType];
    }
    updated.platforms[activePlatform][promptType][field] = value;
    setLocalPost(updated);
    saveToDB(updated);
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
    const briefSection = `--- ИСХОДНЫЙ БРИФ ---\n[Рубрика]: ${data.rubric || 'Не выбрана'}\n[Формат]: ${data.format || 'Не выбран'}\n[Бренд]: ${mnsSettings.brand}\n\n`;
    let resultStr = briefSection;

    if (data.promptTab === 'text') {
      const tp = data.textPrompt || {};
      resultStr += `--- ТЕХНИЧЕСКОЕ ЗАДАНИЕ НА ТЕКСТ ---\n[Роль]: ${tp.role}\n[Тема]: ${localPost.topic}\n[Детали задачи]: ${tp.details}\n\n${mnsSettings.typo}`;
    } else {
      const vp = data.visualPrompt || {};
      const colors = vp.colors?.length > 0 ? `\n[Цветовая палитра]: ${vp.colors.join(', ')}` : '';
      resultStr += `--- ТЕХНИЧЕСКОЕ ЗАДАНИЕ НА ВИЗУАЛ ---\n[AI Prompt]: ${vp.essence}\n[Стиль]: ${mnsSettings.style}${colors}`;
    }
    onOpenPrompt(resultStr);
  };

  const isPromptReady = pData.promptTab === 'text'
    ? pData.textPrompt?.details?.trim().length > 0
    : pData.visualPrompt?.essence?.trim().length > 0;

  return (
    <div className="theme-card p-8 md:p-10 rounded-[40px] shadow-xl bg-[var(--bg-card)] flex flex-col gap-8 border-2 border-[var(--border-main)] transition-all">
      <div className="flex gap-3 bg-[var(--bg-input)] p-2 rounded-2xl overflow-x-auto hide-scroll shrink-0 border border-[var(--border-main)]">
        {platformsInfo.map(plat => {
          const hasContent = localPost?.platforms?.[plat.id]?.step >= 1;
          const isActive = plat.id === activePlatform;
          return (
            <button
              key={plat.id}
              onClick={() => setActivePlatform(plat.id)}
              className={`text-sm font-black uppercase px-8 py-4 rounded-xl transition-all shrink-0 ${isActive ? plat.activeClass : (hasContent ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-white')
                }`}
            >
              {plat.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={localPost.topic}
        onChange={(e) => setLocalPost({ ...localPost, topic: e.target.value })}
        onBlur={() => saveToDB(localPost)}
        placeholder="Тема поста..."
        className="w-full font-black text-4xl outline-none bg-transparent border-b-4 border-slate-100 focus:border-purple-400 pb-3 text-[var(--text-main)] transition-colors"
      />

      <div className="flex gap-4 mt-2">
        {["Бриф", "Промпт", "СММ", "Дизайн", "Готово"].map((s, idx) => (
          <div key={s} onClick={() => setStep(idx)} className="flex flex-col items-center gap-3 flex-1 cursor-pointer group">
            <div className={`h-4 w-full rounded-full transition-all ${idx < pData.step ? 'bg-green-500' : idx === pData.step ? 'bg-purple-600 shadow-lg shadow-purple-500/30' : 'bg-[var(--bg-input)] group-hover:bg-slate-300'}`}></div>
            <span className={`text-[13px] uppercase font-black tracking-tight ${idx <= pData.step ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[300px] py-4">
        {pData.step === 0 && (
          <div className="space-y-8 fade-in">
            <CustomSelect label="Рубрика" value={pData.rubric} options={["Продающий", "Вовлекающий", "Экспертный", "Ситуативный"]} onChange={(v) => updatePlatformData('rubric', v)} />
            <CustomSelect label="Формат" value={pData.format} options={["Текст + Фото", "Видео/Reels", "Инфографика"]} onChange={(v) => updatePlatformData('format', v)} />
            <button onClick={() => setStep(1)} className="w-full py-6 mt-4 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Далее ➔</button>
          </div>
        )}

        {pData.step === 1 && (
          <div className="space-y-6 fade-in flex flex-col">
            <div className="flex bg-[var(--bg-input)] p-2 rounded-2xl shrink-0 border border-[var(--border-main)]">
              <button onClick={() => updatePlatformData('promptTab', 'text')} className={`flex-1 py-4 text-sm font-black rounded-xl transition-all ${pData.promptTab === 'text' ? 'bg-[var(--bg-card)] text-purple-600 shadow-md' : 'text-[var(--text-muted)]'}`}>ТЕКСТ</button>
              <button onClick={() => updatePlatformData('promptTab', 'visual')} className={`flex-1 py-4 text-sm font-black rounded-xl transition-all ${pData.promptTab !== 'text' ? 'bg-[var(--bg-card)] text-purple-600 shadow-md' : 'text-[var(--text-muted)]'}`}>ВИЗУАЛ</button>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-[32px] border-2 border-[var(--border-main)] space-y-6 text-left flex-1">
              {pData.promptTab === 'text' ? (
                <>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase pl-1">Роль ИИ</label>
                    <input type="text" value={pData?.textPrompt?.role || ""} onChange={(e) => updatePromptData('textPrompt', 'role', e.target.value)} className="w-full mt-2 text-base font-bold bg-white p-5 rounded-2xl border-2 border-[var(--border-main)] text-[var(--text-main)] outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase pl-1">Суть поста</label>
                    <textarea value={pData?.textPrompt?.details || ""} onChange={(e) => updatePromptData('textPrompt', 'details', e.target.value)} placeholder="Опишите задачу подробнее..." className="w-full mt-2 text-base font-bold bg-white p-5 rounded-2xl border-2 border-[var(--border-main)] text-[var(--text-main)] h-40 resize-none outline-none focus:border-purple-400" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase pl-1">Что на картинке?</label>
                    <textarea value={pData?.visualPrompt?.essence || ""} onChange={(e) => updatePromptData('visualPrompt', 'essence', e.target.value)} placeholder="Опишите визуал..." className="w-full mt-2 text-base font-bold bg-white p-5 rounded-2xl border-2 border-[var(--border-main)] text-[var(--text-main)] h-40 resize-none outline-none focus:border-purple-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {['Amethyst', 'Tiffany', 'Peach', 'Slate'].map(c => (
                      <label key={c} className="flex items-center gap-4 text-sm font-black text-[var(--text-main)] cursor-pointer p-3 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                        <input type="checkbox" checked={pData?.visualPrompt?.colors?.includes(c)} onChange={() => toggleColor(c)} className="w-5 h-5 accent-purple-50" />
                        {c}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4 shrink-0">
              <button
                onClick={generatePrompt}
                className={`flex-1 py-6 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl transition-all active:scale-95 flex justify-center items-center gap-3 ${isPromptReady
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                  }`}
              >
                {isPromptReady ? (
                  <><CheckCircle2 className="w-6 h-6" /> Посмотреть ТЗ</>
                ) : (
                  <><Sparkles className="w-6 h-6" /> Сгенерировать ТЗ</>
                )}
              </button>
              <button onClick={() => setStep(2)} className="w-20 bg-slate-900 text-white rounded-2xl font-black text-xl flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 shadow-xl">➔</button>
            </div>
          </div>
        )}

        {pData.step === 2 && (
          <div className="space-y-6 fade-in flex flex-col text-left">
            <div className="bg-green-50/50 p-6 rounded-[32px] border-2 border-green-200 flex-1 flex flex-col min-h-[200px]">
              <label className="text-xs font-black text-green-700 uppercase tracking-widest mb-3 pl-1">Текст поста для публикации</label>
              <textarea value={pData.finalText} onChange={(e) => updatePlatformData('finalText', e.target.value)} placeholder="Вставьте готовый текст..." className="w-full text-base font-bold bg-white p-6 rounded-2xl border-2 border-green-100 outline-none text-[var(--text-main)] flex-1 resize-none focus:ring-4 ring-green-400/10" />
            </div>
            <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-200">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Референсы</label>
              <input type="text" value={pData.refs} onChange={(e) => updatePlatformData('refs', e.target.value)} placeholder="https://..." className="w-full text-base font-bold bg-white p-5 rounded-2xl border-2 border-slate-100 outline-none text-[var(--text-main)] focus:ring-4 ring-slate-400/10" />
            </div>
            <button onClick={() => setStep(3)} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-base uppercase tracking-wide hover:bg-slate-800 active:scale-95 transition-all shadow-xl">В Дизайн ➔</button>
          </div>
        )}

        {pData.step === 3 && (
          <div className="space-y-6 fade-in h-full flex flex-col text-left">
            <div className="bg-blue-50/50 p-8 rounded-[32px] border-2 border-blue-200 flex-1">
              <div className="flex items-center gap-4 mb-6 text-blue-700">
                <Link className="w-6 h-6" />
                <label className="text-sm font-black uppercase tracking-widest">Ссылка на результат (облако)</label>
              </div>
              <textarea value={pData.mediaLink} onChange={(e) => updatePlatformData('mediaLink', e.target.value)} placeholder="Google Drive, Pinterest..." className="w-full text-base font-bold bg-white p-6 rounded-2xl border-2 border-blue-100 outline-none text-[var(--text-main)] h-48 resize-none focus:ring-4 ring-blue-500/10" />
            </div>
            <button onClick={() => setStep(4)} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-base uppercase tracking-wide shadow-xl hover:bg-blue-700 active:scale-95 transition-all">Медиа готово ➔</button>
          </div>
        )}

        {pData.step === 4 && (
          <div className="space-y-6 fade-in text-center mt-10">
            <div className="bg-emerald-50 border-2 border-emerald-100 p-16 rounded-[48px] shadow-inner">
              <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
              <h4 className="font-black text-emerald-900 text-2xl uppercase tracking-tighter">Пост полностью готов 🎉</h4>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-6 bg-white border-2 border-[var(--border-main)] text-slate-500 rounded-2xl font-black text-base hover:bg-slate-50 transition-all">Нужны правки</button>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t-2 border-slate-50 pt-6">
        <button
          onClick={async () => { if (window.confirm("Удалить карточку?")) { await api.deletePost(localPost.id); refreshPosts(); } }}
          className="text-sm font-black text-slate-400 hover:text-red-500 transition-all p-3 flex items-center gap-2 rounded-xl hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" /> Удалить карточку
        </button>
      </div>
    </div>
  );
});

// --- ГЛАВНЫЙ КОМПОНЕНТ BOARD ---
const Board = memo(function Board({ projectId, posts, refreshPosts }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal, setModal] = useState({ open: false, text: "" });

  const { days, monthName, year, shift } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(viewDate);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(year, month, d);
      return {
        num: d,
        dateStr,
        weekdayShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dateObj.getDay()],
        weekdayFull: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][dateObj.getDay()]
      };
    });
    return { days: daysArray, monthName, year, shift };
  }, [viewDate]);

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  // --- логика AI импорта ---
  const handleAIImport = async () => {
    const jsonString = prompt("Вставь JSON контент-план от нейронки сюда:");
    if (!jsonString) return;

    try {
      const data = JSON.parse(jsonString);
      const postsArray = Array.isArray(data) ? data : (data.posts || data.data);

      if (!Array.isArray(postsArray)) {
        return alert("Ошибка: JSON должен содержать массив постов.");
      }

      const promises = postsArray.map(post => 
        api.createPost({
          project_id: projectId,
          publish_date: post.publish_date,
          topic: post.topic || "Новый пост",
          platforms: post.platforms || { VK: getEmptyPlatform() }
        })
      );

      await Promise.all(promises);
      refreshPosts();
      alert(`Успех! Импортировано ${postsArray.length} постов.`);
    } catch (e) {
      console.error("AI Import Error:", e);
      alert("Ошибка парсинга. Убедись, что нейронка выдала чистый JSON.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 overflow-y-auto">
      <PromptModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, text: "" })}
        promptText={modal.text}
      />

      {/* --- шапка календаря --- */}
      <div className="flex items-center justify-between p-8 bg-white border-b-2 border-slate-100 mb-6 sticky top-0 z-[30]">
        <div className="flex items-center gap-6">
          <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {monthName}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">{year}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAIImport}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-200"
          >
            <Sparkles className="w-5 h-5" />
            AI Импорт
          </button>
          
          <button
            onClick={() => changeMonth(-1)}
            className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-purple-400 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Сегодня
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-purple-400 transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО ДНЯ --- */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedDay(null)}></div>
          <div className="relative w-full max-w-6xl bg-white rounded-[56px] shadow-2xl border-2 border-white/20 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-10 border-b-2 border-slate-100 bg-white z-10">
              <h3 className="font-black text-4xl text-slate-900 flex items-baseline gap-4 uppercase">
                {selectedDay.num} {monthName}
                <span className="text-purple-600 text-xl font-black uppercase tracking-widest">
                  {selectedDay.weekdayFull}
                </span>
              </h3>
              <button onClick={() => setSelectedDay(null)} className="w-16 h-16 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"><X className="w-8 h-8" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-50/50">
              {posts.filter(p => p.publish_date === selectedDay.dateStr).map(p => (
                <PostCard key={p.id} post={p} refreshPosts={refreshPosts} onOpenPrompt={(t) => setModal({ open: true, text: t })} />
              ))}
              <button
                onClick={() => api.createPost({ project_id: projectId, publish_date: selectedDay.dateStr, topic: "", platforms: { VK: getEmptyPlatform() } }).then(refreshPosts)}
                className="w-full py-12 border-4 border-dashed border-slate-300 rounded-[48px] text-slate-400 font-black text-xl uppercase tracking-widest hover:border-purple-400 hover:text-purple-600 hover:bg-white transition-all flex items-center justify-center gap-4 shadow-sm"
              >
                <Plus className="w-10 h-10" /> Добавить контент
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- сетка календаря --- */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 p-6">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="hidden md:block text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            {d}
          </div>
        ))}

        {Array.from({ length: shift }).map((_, i) => (
          <div key={`empty-${i}`} className="hidden md:block opacity-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[40px] h-full min-h-[150px]" />
        ))}

        {days.map(day => {
          const dayPosts = posts.filter(p => p.publish_date === day.dateStr);
          const activePlats = new Set();
          dayPosts.forEach(p => {
            if (p?.platforms) {
              Object.keys(p.platforms).forEach(id => {
                if (p.platforms[id]?.step >= 1) activePlats.add(id);
              });
            }
          });

          const isToday = day.dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDay(day)}
              className={`w-full bg-white border-2 ${isToday ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-slate-200'} rounded-[40px] flex flex-col items-center p-8 cursor-pointer hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2 transition-all relative group shadow-sm`}
            >
              <span className={`text-sm font-black uppercase mb-3 tracking-widest ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>
                {day.weekdayShort}
              </span>

              <span className={`text-6xl font-black leading-none mb-6 ${isToday ? 'text-purple-600' : 'text-slate-900'}`}>
                {day.num}
              </span>

              <div className="flex flex-wrap justify-center gap-2 mt-auto w-full">
                {platformsInfo.map(plat => (
                  <div
                    key={plat.id}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${activePlats.has(plat.id)
                        ? plat.activeClass
                        : "bg-slate-50 text-slate-300 border border-slate-100 opacity-40"
                      }`}
                  >
                    {plat.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Board;