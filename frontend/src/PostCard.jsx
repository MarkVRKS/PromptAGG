// логика работы с карточкой поста
// написал всё гемини, т.к. это сложнаааа
import React, { useState, memo } from 'react';
import { Trash2, Link, CheckCircle2, Sparkles } from 'lucide-react';
import api from './api';
import { mnsSettings, platformsInfo, getEmptyPlatform } from './constants';
import CustomSelect from './CustomSelect';

const PostCard = memo(function PostCard({ post, refreshPosts, onOpenPrompt }) {
  const [localPost, setLocalPost] = useState(post);
  const [activePlatform, setActivePlatform] = useState(Object.keys(post?.platforms || {})[0] || 'VK');

  const saveToDB = async (updatedPost) => {
    try { await api.updatePost(updatedPost.id, updatedPost); }
    catch (e) { console.error("Ошибка сохранения:", e); }
  };

  // 🛡️ МАГИЯ ЗДЕСЬ: Глубокое копирование. Сохраняем ВСЁ, обновляем только нужное поле.
  const updatePlatformData = (field, value) => {
    const currentPlatform = localPost.platforms?.[activePlatform] || getEmptyPlatform();
    
    const updatedPlatforms = {
      ...localPost.platforms,
      [activePlatform]: {
        ...currentPlatform,
        [field]: value // Меняем ТОЛЬКО одно поле (например, step), остальное остается нетронутым!
      }
    };
    
    const updatedPost = { ...localPost, platforms: updatedPlatforms };
    setLocalPost(updatedPost);
    saveToDB(updatedPost);
  };

  // 🛡️ Глубокое копирование для вложенных объектов (ТЗ)
  const updatePromptData = (promptType, field, value) => {
    const currentPlatform = localPost.platforms?.[activePlatform] || getEmptyPlatform();
    const currentPrompt = currentPlatform[promptType] || getEmptyPlatform()[promptType];

    const updatedPlatforms = {
      ...localPost.platforms,
      [activePlatform]: {
        ...currentPlatform,
        [promptType]: {
          ...currentPrompt,
          [field]: value
        }
      }
    };
    
    const updatedPost = { ...localPost, platforms: updatedPlatforms };
    setLocalPost(updatedPost);
    saveToDB(updatedPost);
  };

  const toggleColor = (color) => {
    const currentPlatform = localPost.platforms?.[activePlatform] || getEmptyPlatform();
    const vp = currentPlatform.visualPrompt || getEmptyPlatform().visualPrompt;
    const currentColors = vp.colors || [];
    
    const newColors = currentColors.includes(color) 
      ? currentColors.filter(c => c !== color) 
      : [...currentColors, color];

    const updatedPlatforms = {
      ...localPost.platforms,
      [activePlatform]: {
        ...currentPlatform,
        visualPrompt: { ...vp, colors: newColors }
      }
    };
    
    const updatedPost = { ...localPost, platforms: updatedPlatforms };
    setLocalPost(updatedPost);
    saveToDB(updatedPost);
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
      {/* ПАНЕЛЬ ПЛОЩАДОК */}
      <div className="flex gap-3 bg-[var(--bg-input)] p-2 rounded-2xl overflow-x-auto hide-scroll shrink-0 border border-[var(--border-main)]">
        {platformsInfo.map(plat => {
          const hasContent = localPost?.platforms?.[plat.id]?.step >= 1;
          const isActive = plat.id === activePlatform;
          return (
            <button
              key={plat.id}
              onClick={() => setActivePlatform(plat.id)}
              className={`text-sm font-black uppercase px-8 py-4 rounded-xl transition-all shrink-0 ${isActive ? plat.activeClass : (hasContent ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-white')}`}
            >
              {plat.label}
            </button>
          );
        })}
      </div>

      {/* ТЕМА */}
      <input
        type="text"
        value={localPost.topic}
        onChange={(e) => setLocalPost({ ...localPost, topic: e.target.value })}
        onBlur={() => saveToDB(localPost)}
        placeholder="Тема поста..."
        className="w-full font-black text-4xl outline-none bg-transparent border-b-4 border-slate-100 focus:border-purple-400 pb-3 text-[var(--text-main)] transition-colors"
      />

      {/* ШАГИ */}
      <div className="flex gap-4 mt-2">
        {["Бриф", "Промпт", "СММ", "Дизайн", "Готово"].map((s, idx) => (
          <div key={s} onClick={() => setStep(idx)} className="flex flex-col items-center gap-3 flex-1 cursor-pointer group">
            <div className={`h-4 w-full rounded-full transition-all ${idx < pData.step ? 'bg-green-500' : idx === pData.step ? 'bg-purple-600 shadow-lg shadow-purple-500/30' : 'bg-[var(--bg-input)] group-hover:bg-slate-300'}`}></div>
            <span className={`text-[13px] uppercase font-black tracking-tight ${idx <= pData.step ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
          </div>
        ))}
      </div>

      {/* КОНТЕНТ ШАГОВ */}
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
                className={`flex-1 py-6 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl transition-all active:scale-95 flex justify-center items-center gap-3 ${isPromptReady ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"}`}
              >
                {isPromptReady ? <><CheckCircle2 className="w-6 h-6" /> Посмотреть ТЗ</> : <><Sparkles className="w-6 h-6" /> Сгенерировать ТЗ</>}
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

      {/* УДАЛЕНИЕ */}
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

export default PostCard;