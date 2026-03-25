import React, { useState, useEffect, memo, useMemo } from 'react';
import { 
  FolderKanban, CalendarDays, Lightbulb, Library, 
  Settings2, X, Save, Trash2, ChevronDown, Copy, BookOpen, Sparkles, Plus, Send, Zap, Edit3, Layers
} from 'lucide-react';
import api from './api';
import Board from './Board';
import Tools from './Tools'; // Подключаем новый файл
import SettingsModal from './SettingsModal';

// --- КОМПОНЕНТ СЕЛЕКТА ДЛЯ ШАПКИ ---
const HeaderSelect = ({ value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2.5 bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl hover:border-purple-300 transition-all px-4 py-2.5 min-w-[180px] justify-between group">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
          <span className="font-bold text-sm text-[var(--text-main)]">{selectedOption ? selectedOption.label : "Выберите..."}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <><div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-main)] shadow-xl rounded-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {options.map((opt) => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 ${value === opt.id ? 'text-purple-600 bg-purple-50/50' : 'text-[var(--text-main)]'}`}>{opt.label}</button>
          ))}
        </div></>
      )}
    </div>
  );
};

// --- ЦИФРОВАЯ ЛАБОРАТОРИЯ (ОБНОВЛЕННАЯ БАЗА ШАБЛОНОВ) ---
const LibraryModal = memo(({ isOpen, onClose, library, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', tags: '', text: '' });

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startEdit = (tpl) => {
    setEditId(tpl.id);
    setForm({ name: tpl.name, tags: tpl.tags, text: tpl.text });
    setShowForm(true);
  };

  const submitForm = () => {
    if (!form.name || !form.text) return;
    if (editId) {
      onUpdate(editId, form);
    } else {
      onAdd(form);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: '', tags: '', text: '' });
    setEditId(null);
    setShowForm(false);
  };

  const systemTemplates = [
    { name: "MNS: Студийный свет", tags: "shoes, mj", text: "Professional footwear photography, studio lighting, hyper-realistic, 8k, [PRODUCT], white background --ar 3:4" },
    { name: "SMM: Экспертный тон", tags: "copy, branding", text: "Напиши пост от лица эксперта бренда МНС-Обувь. Тема: [ТЕМА]. Тон: уверенный, заботливый." }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-300">
      <div className="theme-card rounded-[32px] max-w-6xl w-full shadow-2xl flex flex-col border border-[var(--border-main)] h-[85vh] relative overflow-hidden bg-[var(--bg-card)]">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center shrink-0 bg-[var(--bg-card)] z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">Prompt Lab</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Система управления знаниями</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Новый шаблон
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white rounded-xl transition-all text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Create/Edit Form */}
          <div className={`border-r border-[var(--border-main)] bg-slate-50/30 dark:bg-slate-900/10 transition-all duration-500 ease-in-out flex flex-col overflow-hidden ${showForm ? 'w-[400px] opacity-100 p-8' : 'w-0 opacity-0 p-0'}`}>
            <h3 className="font-black text-[11px] uppercase tracking-widest mb-6 flex items-center gap-2 text-purple-600">
              {editId ? <Edit3 className="w-4 h-4"/> : <Zap className="w-4 h-4"/>} 
              {editId ? 'Редактирование' : 'Новая запись'}
            </h3>
            <div className="space-y-5 flex-1 overflow-y-auto hide-scroll pr-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Название</label>
                <input 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Введите имя..." 
                  className="w-full p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] text-sm font-bold outline-none focus:border-purple-500 text-[var(--text-main)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Теги</label>
                <input 
                  value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                  placeholder="photo, shoes, copy..." 
                  className="w-full p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] text-xs font-bold outline-none focus:border-purple-500 text-[var(--text-main)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Контент</label>
                <textarea 
                  value={form.text} onChange={e => setForm({...form, text: e.target.value})}
                  placeholder="Текст шаблона..." 
                  className="w-full p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] text-xs font-medium outline-none focus:border-purple-500 h-64 resize-none text-[var(--text-main)] leading-relaxed"
                />
              </div>
            </div>
            <div className="pt-6 flex gap-3">
              <button onClick={resetForm} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-500 bg-[var(--bg-input)] rounded-2xl hover:bg-slate-200 transition-colors">Отмена</button>
              <button onClick={submitForm} className="flex-[2] py-4 bg-slate-900 dark:bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-all">
                <Send className="w-3.5 h-3.5" /> {editId ? 'Обновить' : 'Сохранить'}
              </button>
            </div>
          </div>

          {/* Right Panel: List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--bg-app)]/20 ideas-scroll">
            {/* Custom Base */}
            <div className="space-y-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ваша библиотека ({(library || []).length})</label>
              {(library || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {library.map(tpl => (
                    <div key={tpl.id} className="bg-[var(--bg-card)] p-6 rounded-[28px] border border-[var(--border-main)] hover:border-purple-500/40 transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h4 className="font-black text-lg text-[var(--text-main)] leading-tight">{tpl.name}</h4>
                          <div className="flex gap-2 mt-2">
                            {tpl.tags?.split(',').map(t => <span key={t} className="text-[9px] font-black text-purple-500 uppercase bg-purple-500/10 px-2 py-0.5 rounded">#{t.trim()}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleCopy(tpl.text)} className="p-3 bg-[var(--bg-input)] rounded-xl text-slate-500 hover:text-purple-600 transition-all"><Copy className="w-4 h-4"/></button>
                          <button onClick={() => startEdit(tpl)} className="p-3 bg-[var(--bg-input)] rounded-xl text-slate-500 hover:text-blue-500 transition-all"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => onDelete(tpl.id)} className="p-3 bg-[var(--bg-input)] rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <pre className="p-5 bg-black/5 dark:bg-black/40 rounded-2xl font-mono text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-main)] border border-transparent transition-all overflow-x-auto whitespace-pre-wrap leading-relaxed">{tpl.text}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 border-2 border-dashed border-[var(--border-main)] rounded-[40px] text-center opacity-20">
                   <Sparkles className="w-12 h-12 mx-auto mb-4" />
                   <p className="font-black text-xs uppercase tracking-widest">Библиотека пуста</p>
                </div>
              )}
            </div>

            {/* System Presets */}
            <div className="pt-8 border-t border-[var(--border-main)] space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Примеры и готовые пресеты</label>
              <div className="grid grid-cols-2 gap-4">
                {systemTemplates.map(tpl => (
                  <div key={tpl.name} className="p-6 rounded-[28px] border border-[var(--border-main)] bg-[var(--bg-card)]/50 opacity-60 hover:opacity-100 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-tight">{tpl.name}</h4>
                      <button onClick={() => handleCopy(tpl.text)} className="p-2 bg-[var(--bg-card)] rounded-lg text-slate-400 hover:text-purple-500 transition-colors"><Copy className="w-3.5 h-3.5"/></button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 italic leading-relaxed">"{tpl.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function App() {
  const [projectId, setProjectId] = useState('mns');
  const [activeTab, setActiveTab] = useState('board'); // Состояние для вкладок: 'board' или 'tools'
  const [theme, setTheme] = useState('light');
  const [posts, setPosts] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [library, setLibrary] = useState([]); 
  
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { fetchData(); fetchLibrary(); }, [projectId]);

  const fetchData = async () => {
    try { 
      const postsRes = await api.getPosts(projectId); 
      const ideasRes = await api.getIdeas(projectId); 
      setPosts(postsRes.data || []); setIdeas(ideasRes.data || []); 
    } catch (e) { console.error(e); }
  };

  const fetchLibrary = async () => {
    try { const res = await api.getLibrary(); setLibrary(res.data || []); } catch (e) { console.error(e); }
  };

  const handleAddPrompt = async (data) => {
    await api.createLibraryPrompt(data);
    fetchLibrary();
  };

  const handleUpdatePrompt = async (id, data) => {
    await api.updateLibraryPrompt(id, data);
    fetchLibrary();
  };

  const handleDeletePrompt = async (id) => {
    if(!window.confirm("Удалить этот шаблон навсегда?")) return;
    await api.deleteLibraryPrompt(id);
    fetchLibrary();
  };

  const handleAddIdea = async () => {
    if (!newIdeaText.trim()) return;
    const res = await api.createIdea({ project_id: projectId, text: newIdeaText });
    setIdeas([...ideas, res.data]); setNewIdeaText('');
  };

  const handleDeleteIdea = async (id) => { await api.deleteIdea(id); setIdeas(ideas.filter(i => i.id !== id)); };

  const boardView = useMemo(() => (
    <Board projectId={projectId} posts={posts} refreshPosts={fetchData} />
  ), [projectId, posts]);

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans">
      <header className="bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-main)] px-6 py-3 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent tracking-tight">PromptAGG</h1>
          <div className="h-6 w-px bg-[var(--border-main)]"></div>
          
          {/* ВЫБОР ПРОЕКТА */}
          <div className="flex items-center gap-2 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-main)]">
            {['mns', 'moshelovka', 'nelimita'].map(id => (
              <button key={id} onClick={() => setProjectId(id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${projectId === id ? 'bg-[var(--bg-card)] text-purple-600 shadow-sm' : 'text-slate-400'}`}>{id}</button>
            ))}
          </div>
        </div>

        {/* --- ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК (ЦЕНТР) --- */}
        <div className="flex items-center bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-main)] shadow-inner">
           <button 
             onClick={() => setActiveTab('board')}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'board' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-[var(--text-main)]'}`}
           >
             <CalendarDays className="w-3.5 h-3.5" /> Календарь
           </button>
           <button 
             onClick={() => setActiveTab('tools')}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'tools' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-[var(--text-main)]'}`}
           >
             <Layers className="w-3.5 h-3.5" /> Нейронки
           </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsIdeasOpen(!isIdeasOpen)} className="flex items-center gap-2.5 text-sm font-bold text-amber-500 bg-amber-500/10 dark:bg-amber-500/10 px-5 py-3 rounded-xl border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/20 active:scale-95 transition-all">
            <Lightbulb className={`w-4 h-4 ${ideas.length > 0 ? 'animate-bulb text-amber-400' : ''}`} /> Багаж 
            <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]">{ideas.length}</span>
          </button>
          <button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2.5 text-sm font-bold text-slate-500 dark:text-slate-300 bg-[var(--bg-input)] px-5 py-3 rounded-xl border border-[var(--border-main)] hover:border-purple-300 active:scale-95 transition-all shadow-sm">
            <Library className="w-4 h-4 text-purple-500" /> База
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 bg-slate-900 dark:bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all"><Settings2 className="w-5 h-5" /></button>
        </div>
      </header>

      {/* --- КОНТЕНТ (УСЛОВНЫЙ РЕНДЕРИНГ) --- */}
      <main className="flex-1 overflow-x-auto overflow-y-auto p-6 flex gap-4 items-start relative ideas-scroll">
        {activeTab === 'board' ? boardView : <Tools />}
      </main>

      {/* --- IDEA VAULT --- */}
      <div className={`fixed right-0 top-[73px] h-[calc(100vh-73px)] w-[420px] bg-[var(--bg-card)] shadow-[-30px_0_50px_rgba(0,0,0,0.3)] border-l border-[var(--border-main)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 flex flex-col transform-gpu will-change-transform ${isIdeasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Lightbulb className="text-amber-500 w-6 h-6 animate-bulb" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">Idea Vault</h2>
              <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-[0.2em]">Нейро-хранилище</p>
            </div>
          </div>
          <button onClick={() => setIsIdeasOpen(false)} className="p-2 bg-[var(--bg-input)] hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-xl transition-all relative z-10 border border-transparent hover:border-red-500/30">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[var(--bg-app)]/50 ideas-scroll relative">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border-main) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
          
          <div className="relative z-10 space-y-4">
              {ideas.map((idea, idx) => (
                <div key={idea.id} className="relative group p-5 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:-translate-y-1 overflow-hidden cursor-default">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-500/0 group-hover:bg-amber-500/10 blur-2xl transition-all duration-500 rounded-full"></div>
                  
                  <span className="absolute -right-2 top-2 text-6xl font-black text-[var(--text-muted)] opacity-5 group-hover:opacity-10 group-hover:text-amber-500 transition-all duration-300 italic pointer-events-none select-none">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <p className="text-sm font-medium text-[var(--text-main)] leading-relaxed">{idea.text}</p>
                    <button onClick={() => handleDeleteIdea(idea.id)} className="p-2 bg-[var(--bg-input)] text-slate-400 opacity-0 group-hover:opacity-100 rounded-xl transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] shrink-0 border border-transparent hover:border-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {ideas.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 text-[var(--text-main)]">
                  <Sparkles className="w-12 h-12 mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest text-center">Хранилище пусто<br/><span className="text-[9px] text-[var(--text-muted)]">Ожидание данных...</span></p>
                </div>
              )}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-card)] relative z-10">
          <div className="relative group mb-4">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
            
            <textarea 
              value={newIdeaText} 
              onChange={(e) => setNewIdeaText(e.target.value)} 
              placeholder="Инициализация потока мыслей..." 
              className="w-full p-5 bg-[var(--bg-input)] rounded-2xl text-sm font-medium outline-none border border-[var(--border-main)] focus:border-amber-500/40 focus:bg-[var(--bg-card)] focus:shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] h-32 resize-none transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]" 
            />
          </div>
          <button onClick={handleAddIdea} className="w-full py-4 bg-[var(--bg-input)] hover:bg-amber-500 text-[var(--text-main)] hover:text-slate-900 border border-[var(--border-main)] hover:border-amber-400 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 flex justify-center items-center gap-2 group">
            <Save className="w-4 h-4 group-hover:animate-pulse" /> Синхронизировать
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={theme} setTheme={setTheme} projectId={projectId} />
      
      <LibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        library={library}
        onAdd={handleAddPrompt}
        onUpdate={handleUpdatePrompt}
        onDelete={handleDeletePrompt}
      />
    </div>
  );
}