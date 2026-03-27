import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, HardDrive, BrainCircuit, 
  Cpu, Sparkles, Globe, Fingerprint, ChevronRight,
  Search, Palette, Music, MessageSquare, TrendingUp, Wrench, Play
} from 'lucide-react';
import StyleMapModal from './StyleMapModal'; 

// --- 🌟 ОСНОВНЫЕ НЕЙРОСЕТИ (БЫСТРЫЙ ДОСТУП) ---
const aiTools = [
  { name: "Gemini", url: "https://gemini.google.com/", icon: <Sparkles className="w-8 h-8 text-blue-500" />, desc: "Google AI" },
  { name: "GPTTonnel", url: "https://gpttonnel.ru/", icon: <Cpu className="w-8 h-8 text-purple-600" />, desc: "Доступ к моделям" },
  { name: "ChatGPT", url: "https://chatgpt.com/", icon: <BrainCircuit className="w-8 h-8 text-emerald-600" />, desc: "OpenAI" },
  { name: "DeepSeek", url: "https://www.deepseek.com/", icon: <Globe className="w-8 h-8 text-blue-400" />, desc: "Coding & Reasoning" },
  { name: "QwenChat", url: "https://chat.qwenlm.ai/", icon: <Cpu className="w-8 h-8 text-orange-500" />, desc: "Alibaba AI" },
  { name: "Google Drive", url: "https://docs.google.com/spreadsheets/d/1uYPdNnZgAcsBhjnLaxkTKE-Npg4GYR3ArOGF4Z9Pv-8/edit?pli=1&gid=1843704431#gid=1843704431", icon: <HardDrive className="w-8 h-8 text-amber-500" />, desc: "Хранилище контента" },
];

// --- 🗂 БОЛЬШАЯ БАЗА ИНСТРУМЕНТОВ ОТ ГП ---
const CATEGORIES = {
  ALL: "Все",
  DESIGN: "🎨 Визуал & Дизайн",
  MEDIA: "🎵 Аудио & Видео",
  AI: "🤖 AI & Тексты",
  SMM: "📈 Маркетинг & SMM",
  UTILS: "🛠 Утилиты"
};

const gpTools = [
  // Дизайн & Визуал
  { name: "Оптимизатор", url: "https://productradar.ru/product/optimizator-izobrazhenij/", desc: "Уменьшить размер фото", category: CATEGORIES.DESIGN },
  { name: "Подбор Цветов", url: "https://amssoft.ru/repair/programmy-dlya-podbora-cveta-v-interere.php", desc: "Сочетание цветов", category: CATEGORIES.DESIGN },
  { name: "SMMPlanner Templates", url: "https://smmplanner.com/home/templates/5762", desc: "Каталог шаблонов дизайна", category: CATEGORIES.DESIGN },
  { name: "Иронов (Art.Lebedev)", url: "https://ironov.artlebedev.ru/colors/", desc: "Генерация уникальных палитр", category: CATEGORIES.DESIGN },
  { name: "Twinny", url: "https://twinny.ru", desc: "Генератор инфографики", category: CATEGORIES.DESIGN },
  { name: "Mitos ASCII", url: "https://mitos.shared.oxide.computer/", desc: "Генератор ASCII-графики", category: CATEGORIES.DESIGN },
  { name: "FreshLUTs", url: "http://freshluts.com", desc: "Киношная цветокоррекция", category: CATEGORIES.DESIGN },
  { name: "Fliiipbook", url: "https://www.fliiipbook.com/", desc: "Создание GIF-анимаций", category: CATEGORIES.DESIGN },
  { name: "Fotelier", url: "https://fotelier.ru/", desc: "Обработка фото для маркетплейсов", category: CATEGORIES.DESIGN },
  
  // Аудио & Видео
  { name: "ЗвукиМузыка", url: "https://звукимузыка.рф", desc: "Музыкальные библиотеки", category: CATEGORIES.MEDIA },
  { name: "SFX Engine", url: "https://sfxengine.com/", desc: "Генератор звуковых эффектов", category: CATEGORIES.MEDIA },
  { name: "ClipCut Bot", url: "https://t.me/clipcut_bot", desc: "Нарезка видео на Shorts", category: CATEGORIES.MEDIA },
  { name: "Diarum", url: "https://diarum.ru/", desc: "Транскрибация голоса в текст", category: CATEGORIES.MEDIA },
  { name: "MyInstants", url: "https://www.myinstants.com/", desc: "Звуки для монтажа", category: CATEGORIES.MEDIA },

  // AI & Тексты
  { name: "Wunjo", url: "https://wunjo.online/ru", desc: "Мощная работа с контентом", category: CATEGORIES.AI },
  { name: "TalkPilot", url: "https://talkpilot.ru/", desc: "GPT и другие модели в 1 чате", category: CATEGORIES.AI },
  { name: "DuckDuckGo AI", url: "https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1", desc: "Анонимные чаты с ИИ", category: CATEGORIES.AI },
  { name: "Editor V Bot", url: "https://t.me/editor_v_bot", desc: "ИИ редактор текстов", category: CATEGORIES.AI },
  { name: "GPTunnel", url: "https://gptunnel.ru/", desc: "Генерация всех типов контента", category: CATEGORIES.AI },

  // Маркетинг & SMM
  { name: "TrendVI", url: "https://trendvi.ru/", desc: "Анализ трендов и SEO", category: CATEGORIES.SMM },
  { name: "TargetHunter", url: "https://targethunter.ru/", desc: "Продвижение в соцсетях", category: CATEGORIES.SMM },
  { name: "Epicstars", url: "https://ru.epicstars.com/", desc: "Сотрудничество с блогерами", category: CATEGORIES.SMM },
  { name: "GetBlogger", url: "https://new.getblogger.ru/cpp", desc: "Массовая закупка рекламы", category: CATEGORIES.SMM },
  { name: "Plibber", url: "https://plibber.ru/", desc: "Маркетплейс рекламы у блогеров", category: CATEGORIES.SMM },
  { name: "Noema", url: "https://startup-tools.ru/telegram-tools/noema", desc: "Аналитика открытых ТГ-групп", category: CATEGORIES.SMM },

  // Утилиты
  { name: "Upgraide", url: "https://upgraide.me/", desc: "Создание ботов и интеграция", category: CATEGORIES.UTILS },
  { name: "Deepsite", url: "https://huggingface.co/spaces/victor/deepsite-gallery", desc: "Создание сайтов в пару кликов", category: CATEGORIES.UTILS },
  { name: "Skillspace", url: "https://productradar.ru/product/skillspace/", desc: "Платформа для ведения курсов", category: CATEGORIES.UTILS },
  { name: "Qfrm Bot", url: "https://t.me/qfrmBot", desc: "Удобный конструктор форм", category: CATEGORIES.UTILS },
  { name: "WebBee AI", url: "https://webbee-ai.ru/", desc: "Парсинг информации с сайтов", category: CATEGORIES.UTILS },
  { name: "Everywhere", url: "https://everywhere.tools/", desc: "Open-source ресурсы для Dev", category: CATEGORIES.UTILS },
  { name: "Adescargar", url: "https://adescargar.online/category/aplicaciones/", desc: "Библиотека платных приложений", category: CATEGORIES.UTILS },
];

export default function Tools() {
  const [isStyleMapOpen, setIsStyleMapOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);

  const openLink = (url) => {
    if (url !== "#") window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Фильтрация инструментов
  const filteredTools = useMemo(() => {
    return gpTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tool.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === CATEGORIES.ALL || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, activeCategory]);

  // Выбор иконки для категории
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 w-full mb-20">
      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter uppercase">Рабочее пространство</h2>
      
      {/* 🌟 ПРЕМИАЛЬНАЯ КАРТОЧКА СТИЛЯ MNS 🌟 */}
      <div 
        onClick={() => setIsStyleMapOpen(true)}
        className="mb-12 group relative w-full overflow-hidden rounded-[40px] cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/20 backdrop-blur-md rounded-[24px] border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-black text-3xl text-white leading-tight uppercase tracking-tight">Карта Стиля MNS</h3>
              <p className="text-sm font-bold text-white/80 uppercase tracking-[0.2em] mt-2">Глобальный брендбук и AI-директивы</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 text-white font-black text-sm uppercase tracking-widest group-hover:bg-white group-hover:text-purple-600 transition-colors duration-300">
            Открыть <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- БАЗОВЫЕ НЕЙРОСЕТИ --- */}
      <h3 className="text-xl font-black text-slate-400 mb-6 tracking-widest uppercase">Избранные Нейросети</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {aiTools.map((tool) => (
          <div 
            key={tool.name} onClick={() => openLink(tool.url)}
            className="group bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-8 rounded-[32px] flex items-center justify-between cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:-translate-y-2 transition-all shadow-sm"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-[24px] group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{tool.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- 🗂 КАТАЛОГ ИНСТРУМЕНТОВ --- */}
      <div className="bg-white/50 dark:bg-slate-800/50 rounded-[48px] p-6 sm:p-10 border-2 border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">База инструментов</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Коллекция полезных сервисов ({gpTools.length})</p>
          </div>

          {/* Поиск */}
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Найти инструмент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 ring-purple-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Табы фильтров */}
        <div className="flex overflow-x-auto hide-scroll gap-3 mb-10 pb-2">
          {Object.values(CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Сетка инструментов */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool, idx) => (
              <div 
                key={idx} onClick={() => openLink(tool.url)}
                className="group relative bg-white dark:bg-slate-800 p-6 rounded-[28px] border-2 border-slate-100 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(tool.category)}
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-purple-500 transition-all" />
                </div>
                <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-2 line-clamp-1">{tool.name}</h4>
                <p className="text-sm font-bold text-slate-400 leading-snug line-clamp-2 mt-auto">{tool.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Ничего не найдено</h4>
            <p className="text-slate-500 font-medium">Попробуй изменить запрос или категорию</p>
          </div>
        )}
      </div>

      <StyleMapModal isOpen={isStyleMapOpen} onClose={() => setIsStyleMapOpen(false)} />
    </div>
  );
}