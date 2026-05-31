import React, { useState, useMemo, useEffect } from 'react';
import { 
  ExternalLink, HardDrive, BrainCircuit, 
  Cpu, Sparkles, Globe, Fingerprint, ChevronRight,
  Search, Palette, Music, MessageSquare, TrendingUp, Wrench, Play, Send, CheckCircle2, Loader2, CalendarPlus
} from 'lucide-react';
import api from './api';
import StyleMapModal from './StyleMapModal'; 

// --- ОСНОВНЫЕ НЕЙРОСЕТИ ---
const aiTools = [
  { name: "Gemini", url: "https://gemini.google.com/", icon: <Sparkles className="w-8 h-8 text-blue-500" />, desc: "Google AI" },
  { name: "GPTTonnel", url: "https://gpttonnel.ru/", icon: <Cpu className="w-8 h-8 text-purple-600" />, desc: "Доступ к моделям" },
  { name: "ChatGPT", url: "https://chatgpt.com/", icon: <BrainCircuit className="w-8 h-8 text-emerald-600" />, desc: "OpenAI" },
  { name: "DeepSeek", url: "https://www.deepseek.com/", icon: <Globe className="w-8 h-8 text-blue-400" />, desc: "Coding & Reasoning" },
  { name: "QwenChat", url: "https://chat.qwenlm.ai/", icon: <Cpu className="w-8 h-8 text-orange-500" />, desc: "Alibaba AI" },
  { name: "Google Drive", url: "https://docs.google.com/spreadsheets/d/1uYPdNnZgAcsBhjnLaxkTKE-Npg4GYR3ArOGF4Z9Pv-8/edit?pli=1&gid=1843704431#gid=1843704431", icon: <HardDrive className="w-8 h-8 text-amber-500" />, desc: "Хранилище контента" },
];

const CATEGORIES = { ALL: "Все", DESIGN: "🎨 Визуал & Дизайн", MEDIA: "🎵 Аудио & Видео", AI: "🤖 AI & Тексты", SMM: "📈 Маркетинг & SMM", UTILS: "🛠 Утилиты" };

const gpTools = [
  { name: "Оптимизатор", url: "https://productradar.ru/product/optimizator-izobrazhenij/", desc: "Уменьшить размер фото", category: CATEGORIES.DESIGN },
  { name: "Подбор Цветов", url: "https://amssoft.ru/repair/programmy-dlya-podbora-cveta-v-interere.php", desc: "Сочетание цветов", category: CATEGORIES.DESIGN },
  { name: "SMMPlanner Templates", url: "https://smmplanner.com/home/templates/5762", desc: "Каталог шаблонов дизайна", category: CATEGORIES.DESIGN },
  { name: "Иронов (Art.Lebedev)", url: "https://ironov.artlebedev.ru/colors/", desc: "Генерация уникальных палитр", category: CATEGORIES.DESIGN },
  { name: "Twinny", url: "https://twinny.ru", desc: "Генератор инфографики", category: CATEGORIES.DESIGN },
  { name: "Mitos ASCII", url: "https://mitos.shared.oxide.computer/", desc: "Генератор ASCII-графики", category: CATEGORIES.DESIGN },
  { name: "FreshLUTs", url: "http://freshluts.com", desc: "Киношная цветокоррекция", category: CATEGORIES.DESIGN },
  { name: "Fliiipbook", url: "https://www.fliiipbook.com/", desc: "Создание GIF-анимаций", category: CATEGORIES.DESIGN },
  { name: "Fotelier", url: "https://fotelier.ru/", desc: "Обработка фото для маркетплейсов", category: CATEGORIES.DESIGN },
  { name: "ЗвукиМузыка", url: "https://звукимузыка.рф", desc: "Музыкальные библиотеки", category: CATEGORIES.MEDIA },
  { name: "SFX Engine", url: "https://sfxengine.com/", desc: "Генератор звуковых эффектов", category: CATEGORIES.MEDIA },
  { name: "ClipCut Bot", url: "https://t.me/clipcut_bot", desc: "Нарезка видео на Shorts", category: CATEGORIES.MEDIA },
  { name: "Diarum", url: "https://diarum.ru/", desc: "Транскрибация голоса в текст", category: CATEGORIES.MEDIA },
  { name: "MyInstants", url: "https://www.myinstants.com/", desc: "Звуки для монтажа", category: CATEGORIES.MEDIA },
  { name: "Wunjo", url: "https://wunjo.online/ru", desc: "Мощная работа с контентом", category: CATEGORIES.AI },
  { name: "TalkPilot", url: "https://talkpilot.ru/", desc: "GPT и другие модели в 1 чате", category: CATEGORIES.AI },
  { name: "DuckDuckGo AI", url: "https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1", desc: "Анонимные чаты с ИИ", category: CATEGORIES.AI },
  { name: "Editor V Bot", url: "https://t.me/editor_v_bot", desc: "ИИ редактор текстов", category: CATEGORIES.AI },
  { name: "GPTunnel", url: "https://gptunnel.ru/", desc: "Генерация всех типов контента", category: CATEGORIES.AI },
  { name: "TrendVI", url: "https://trendvi.ru/", desc: "Анализ трендов и SEO", category: CATEGORIES.SMM },
  { name: "TargetHunter", url: "https://targethunter.ru/", desc: "Продвижение в соцсетях", category: CATEGORIES.SMM },
  { name: "Epicstars", url: "https://ru.epicstars.com/", desc: "Сотрудничество с блогерами", category: CATEGORIES.SMM },
  { name: "GetBlogger", url: "https://new.getblogger.ru/cpp", desc: "Массовая закупка рекламы", category: CATEGORIES.SMM },
  { name: "Plibber", url: "https://plibber.ru/", desc: "Маркетплейс рекламы у блогеров", category: CATEGORIES.SMM },
  { name: "Noema", url: "https://startup-tools.ru/telegram-tools/noema", desc: "Аналитика открытых ТГ-групп", category: CATEGORIES.SMM },
  { name: "Upgraide", url: "https://upgraide.me/", desc: "Создание ботов и интеграция", category: CATEGORIES.UTILS },
  { name: "Deepsite", url: "https://huggingface.co/spaces/victor/deepsite-gallery", desc: "Создание сайтов в пару кликов", category: CATEGORIES.UTILS },
  { name: "Skillspace", url: "https://productradar.ru/product/skillspace/", desc: "Платформа для ведения курсов", category: CATEGORIES.UTILS },
  { name: "Qfrm Bot", url: "https://t.me/qfrmBot", desc: "Удобный конструктор форм", category: CATEGORIES.UTILS },
  { name: "WebBee AI", url: "https://webbee-ai.ru/", desc: "Парсинг информации с сайтов", category: CATEGORIES.UTILS },
  { name: "Everywhere", url: "https://everywhere.tools/", desc: "Open-source ресурсы для Dev", category: CATEGORIES.UTILS },
  { name: "Adescargar", url: "https://adescargar.online/category/aplicaciones/", desc: "Библиотека платных приложений", category: CATEGORIES.UTILS },
];

export default function Tools({ library = [], projectId }) {
  const [isStyleMapOpen, setIsStyleMapOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);

  // Новые стейты для переработанной лаборатории
  const [labMode, setLabMode] = useState("plan"); // "free" или "plan"
  const [freeText, setFreeText] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [postsForDate, setPostsForDate] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [promptType, setPromptType] = useState("text"); // "text" или "visual"
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // Загрузка постов при изменении даты
  const loadPostsForDate = async (date) => {
    try {
      const res = await api.getPosts(projectId);
      const filtered = res.data.filter(p => p.publish_date === date);
      setPostsForDate(filtered);
      setSelectedPostId("");
      setGeneratedPrompt("");
    } catch (e) {
      console.error("Ошибка загрузки постов:", e);
      setPostsForDate([]);
    }
  };

  // Загружаем посты при изменении даты
  React.useEffect(() => {
    if (selectedDate) {
      loadPostsForDate(selectedDate);
    }
  }, [selectedDate, projectId]);

  const handleGenerateSuperPrompt = async () => {
    if (labMode === "plan" && !selectedPostId) {
      alert("Выберите пост!");
      return;
    }

    if (labMode === "free" && !freeText.trim()) {
      alert("Введите текст для генерации!");
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompt("");

    console.log(`🤖 Начинаем генерацию промпта, режим=${labMode}, тип=${promptType}`);

    try {
      let res;
      if (labMode === "plan") {
        res = await api.generateSuperPrompt(parseInt(selectedPostId), promptType);
      } else {
        // Для свободного режима отправляем текст напрямую (нужно будет добавить API метод)
        res = await api.generateFreePrompt(freeText, promptType);
      }

      console.log('📥 Ответ от сервера:', res.data);

      if (res.data.error) {
        console.error('❌ Ошибка от Gemini API:', res.data.error);
        setGeneratedPrompt(`⚠️ Ошибка генерации:\n\n${res.data.error}\n\nПроверьте логи бэкенда для деталей.`);
      } else if (res.data.prompt) {
        console.log('✅ Промпт успешно получен');
        setGeneratedPrompt(res.data.prompt);
      } else {
        console.error('❌ Неожиданный формат ответа:', res.data);
        setGeneratedPrompt("⚠️ Неожиданный формат ответа от сервера.");
      }
    } catch (e) {
      console.error("❌ ДЕТАЛИ ОШИБКИ ГЕНЕРАЦИИ:", e);
      console.error("Статус:", e.response?.status);
      console.error("Данные:", e.response?.data);
      setGeneratedPrompt(`⚠️ Ошибка связи с сервером:\n\n${e.message}\n\nПроверьте консоль браузера (F12) для деталей.`);
    }
    setIsGenerating(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert("Промпт скопирован в буфер обмена!");
  };

  const openLink = (url) => {
    if (url !== "#") window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredTools = useMemo(() => {
    return gpTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === CATEGORIES.ALL || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, activeCategory]);

  const getCategoryIcon = (category) => {
    switch(category) {
      case CATEGORIES.DESIGN: return <Palette className="w-5 h-5 text-pink-500" />;
      case CATEGORIES.MEDIA: return <Play className="w-5 h-5 text-blue-500" />;
      case CATEGORIES.AI: return <BrainCircuit className="w-5 h-5 text-purple-500" />;
      case CATEGORIES.SMM: return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case CATEGORIES.UTILS: return <Wrench className="w-5 h-5 text-amber-500" />;
      default: return <ExternalLink className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 w-full mb-20 space-y-12">
      
      {/* ПРЕМИАЛЬНАЯ КАРТОЧКА СТИЛЯ */}
      <div 
        onClick={() => setIsStyleMapOpen(true)}
        className="group relative w-full overflow-hidden rounded-[40px] cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/20 backdrop-blur-md rounded-[24px] border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-black text-3xl text-white leading-tight uppercase tracking-tight">Карта Стиля Проекта</h3>
              <p className="text-sm font-bold text-white/80 uppercase tracking-[0.2em] mt-2">Глобальный брендбук и AI-директивы</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 text-white font-black text-sm uppercase tracking-widest group-hover:bg-white group-hover:text-purple-600 transition-colors duration-300">
            Открыть <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- ЛАБОРАТОРИЯ КОНТЕНТА (ГЕНЕРАТОР) --- */}
      <div>
        <h3 className="text-xl font-black text-slate-400 mb-6 tracking-widest uppercase">🧪 Лаборатория генерации супер-промптов</h3>
        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-[40px] p-8 shadow-sm flex flex-col gap-6">

          {/* ТАБЫ: Выбор режима */}
          <div className="flex gap-3 p-2 bg-[var(--bg-input)] rounded-2xl border-2 border-[var(--border-main)]">
            <button
              onClick={() => { setLabMode("plan"); setGeneratedPrompt(""); }}
              className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                labMode === "plan"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_8px_16px_rgba(168,85,247,0.4)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              📅 По контент-плану
            </button>
            <button
              onClick={() => { setLabMode("free"); setGeneratedPrompt(""); }}
              className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                labMode === "free"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_8px_16px_rgba(168,85,247,0.4)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              ✍️ Свободный текст
            </button>
          </div>

          {/* ВАРИАНТ А: Свободный текст */}
          {labMode === "free" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Введите вводные данные
                </label>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Опишите, что вы хотите сгенерировать... Например: 'Пост про новый продукт, целевая аудитория - молодые мамы, тон дружелюбный'"
                  className="w-full h-40 bg-[var(--bg-input)] border-2 border-[var(--border-main)] rounded-2xl p-4 text-base font-medium text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all resize-none"
                />
              </div>

              {/* Тип промпта */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Тип генерации
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPromptType("text")}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      promptType === "text"
                        ? "bg-[var(--accent)] text-white shadow-[0_10px_20px_var(--accent-glow)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-[var(--accent)]"
                    }`}
                  >
                    📝 Текстовый промпт
                  </button>
                  <button
                    onClick={() => setPromptType("visual")}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      promptType === "visual"
                        ? "bg-[var(--accent)] text-white shadow-[0_10px_20px_var(--accent-glow)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-[var(--accent)]"
                    }`}
                  >
                    🎨 Визуальный промпт
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВАРИАНТ Б: По контент-плану */}
          {labMode === "plan" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Шаг 1: Выбор даты */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  1. Выберите дату
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-main)] rounded-2xl p-4 text-base font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>

              {/* Шаг 2: Выбор поста */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  2. Выберите пост из контент-плана
                </label>
                <select
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  disabled={postsForDate.length === 0}
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-main)] rounded-2xl p-4 text-sm font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all cursor-pointer appearance-none disabled:opacity-50"
                >
                  <option value="">
                    {postsForDate.length === 0 ? "-- Нет постов на эту дату --" : "-- Выберите пост --"}
                  </option>
                  {postsForDate.map(post => (
                    <option key={post.id} value={post.id}>
                      {post.topic || "Без темы"} (ID: {post.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Шаг 3: Тип промпта */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  3. Тип генерации
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPromptType("text")}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      promptType === "text"
                        ? "bg-[var(--accent)] text-white shadow-[0_10px_20px_var(--accent-glow)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-[var(--accent)]"
                    }`}
                  >
                    📝 Текстовый промпт
                  </button>
                  <button
                    onClick={() => setPromptType("visual")}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      promptType === "visual"
                        ? "bg-[var(--accent)] text-white shadow-[0_10px_20px_var(--accent-glow)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)] border-2 border-[var(--border-main)] hover:border-[var(--accent)]"
                    }`}
                  >
                    🎨 Визуальный промпт
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка генерации */}
          <button
            onClick={handleGenerateSuperPrompt}
            disabled={isGenerating || (labMode === "plan" && !selectedPostId) || (labMode === "free" && !freeText.trim())}
            className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.6)]"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {isGenerating ? "Gemini генерирует..." : "✨ Сгенерировать супер-промпт"}
          </button>

          {/* Результат */}
          {generatedPrompt && (
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <label className="text-sm font-bold text-purple-400 uppercase tracking-widest">Готовый промпт</label>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" /> Скопировать
                </button>
              </div>
              <div className="bg-[var(--bg-card)] rounded-xl p-5 max-h-[400px] overflow-y-auto ideas-scroll border border-purple-500/30">
                <pre className="text-[var(--text-main)] text-sm whitespace-pre-wrap font-medium leading-relaxed">
                  {generatedPrompt}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- БАЗОВЫЕ НЕЙРОСЕТИ И КАТАЛОГ ОСТАЛИСЬ ПРЕЖНИМИ --- */}
      <div>
        <h3 className="text-xl font-black text-slate-400 mb-6 tracking-widest uppercase">Быстрые ссылки</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => (
            <div 
              key={tool.name} onClick={() => openLink(tool.url)}
              className="group bg-[var(--bg-card)] border-2 border-[var(--border-main)] p-8 rounded-[32px] flex items-center justify-between cursor-pointer hover:border-[var(--accent)] hover:shadow-xl hover:-translate-y-2 transition-all shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-[var(--bg-input)] rounded-[24px] group-hover:bg-[var(--accent-glow)] transition-colors">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="font-black text-xl text-[var(--text-main)] leading-tight">{tool.name}</h3>
                  <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">{tool.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-[48px] p-6 sm:p-10 border-2 border-[var(--border-main)] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">База инструментов</h3>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Коллекция полезных сервисов ({gpTools.length})</p>
          </div>
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Найти инструмент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-[var(--bg-input)] border-2 border-[var(--border-main)] rounded-2xl text-base font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scroll gap-3 mb-10 pb-2">
          {Object.values(CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-[var(--text-main)] text-[var(--bg-app)] shadow-lg scale-105' 
                  : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-main)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool, idx) => (
              <div 
                key={idx} onClick={() => openLink(tool.url)}
                className="group relative bg-[var(--bg-input)] p-6 rounded-[28px] border-2 border-transparent hover:border-[var(--accent)] cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[var(--bg-card)] rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-[var(--border-main)]">
                    {getCategoryIcon(tool.category)}
                  </div>
                  <ExternalLink className="w-5 h-5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all" />
                </div>
                <h4 className="font-black text-lg text-[var(--text-main)] leading-tight mb-2 line-clamp-1">{tool.name}</h4>
                <p className="text-sm font-bold text-[var(--text-muted)] leading-snug line-clamp-2 mt-auto">{tool.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-input)] mb-4">
              <Search className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h4 className="text-xl font-black text-[var(--text-main)] mb-2">Ничего не найдено</h4>
          </div>
        )}
      </div>
      <StyleMapModal isOpen={isStyleMapOpen} onClose={() => setIsStyleMapOpen(false)} />
    </div>
  );
}