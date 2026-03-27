import React, { useState, useMemo, memo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import api from './api';
import PromptModal from './PromptModal';
import PostCard from './PostCard';
import { platformsInfo, getEmptyPlatform } from './constants';

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

  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  // --- логика AI импорта ---
  const handleAIImport = async () => {
    const jsonString = prompt("Вставь JSON контент-план от нейронки сюда:");
    if (!jsonString) return;

    try {
      const cleanJsonString = jsonString
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\_/g, '_')
        .trim();

      const data = JSON.parse(cleanJsonString);
      const postsArray = Array.isArray(data) ? data : (data.posts || data.data);

      if (!Array.isArray(postsArray)) return alert("Ошибка: JSON должен содержать массив постов.");

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
      alert("Ошибка парсинга! Убедись, что скопирован весь текст от [ до ].");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 overflow-y-auto">
      <PromptModal isOpen={modal.open} onClose={() => setModal({ open: false, text: "" })} promptText={modal.text} />

      {/* --- ШАПКА КАЛЕНДАРЯ --- */}
      <div className="flex items-center justify-between p-8 bg-white border-b-2 border-slate-100 mb-6 sticky top-0 z-[30]">
        <div className="flex items-center gap-6">
          <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{monthName}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-1">{year}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleAIImport} className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-purple-200">
            <Sparkles className="w-5 h-5" /> AI Импорт
          </button>
          <button onClick={() => changeMonth(-1)} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-purple-400 transition-all active:scale-90"><ChevronLeft className="w-6 h-6 text-slate-600" /></button>
          <button onClick={() => setViewDate(new Date())} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-600 transition-all active:scale-95 shadow-lg shadow-slate-200">Сегодня</button>
          <button onClick={() => changeMonth(1)} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-purple-400 transition-all active:scale-90"><ChevronRight className="w-6 h-6 text-slate-600" /></button>
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
                <span className="text-purple-600 text-xl font-black uppercase tracking-widest">{selectedDay.weekdayFull}</span>
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

      {/* --- СЕТКА КАЛЕНДАРЯ --- */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 p-6">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="hidden md:block text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{d}</div>
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
              <span className={`text-sm font-black uppercase mb-3 tracking-widest ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>{day.weekdayShort}</span>
              <span className={`text-6xl font-black leading-none mb-6 ${isToday ? 'text-purple-600' : 'text-slate-900'}`}>{day.num}</span>
              <div className="flex flex-wrap justify-center gap-2 mt-auto w-full">
                {platformsInfo.map(plat => (
                  <div
                    key={plat.id}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${activePlats.has(plat.id) ? plat.activeClass : "bg-slate-50 text-slate-300 border border-slate-100 opacity-40"}`}
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