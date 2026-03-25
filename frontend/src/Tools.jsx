import React from 'react';
import { 
  ExternalLink, HardDrive, BrainCircuit, 
  Cpu, Sparkles, Plus, Globe 
} from 'lucide-react';

const aiTools = [
  { name: "Gemini", url: "https://gemini.google.com/", icon: <Sparkles className="w-8 h-8 text-blue-500" />, desc: "Google AI" },
  { name: "GPTTonnel", url: "https://gpttonnel.ru/", icon: <Cpu className="w-8 h-8 text-purple-600" />, desc: "Доступ к моделям" },
  { name: "ChatGPT", url: "https://chatgpt.com/", icon: <BrainCircuit className="w-8 h-8 text-emerald-600" />, desc: "OpenAI" },
  { name: "DeepSeek", url: "https://www.deepseek.com/", icon: <Globe className="w-8 h-8 text-blue-400" />, desc: "Coding & Reasoning" },
  { name: "QwenChat", url: "https://chat.qwenlm.ai/", icon: <Cpu className="w-8 h-8 text-orange-500" />, desc: "Alibaba AI" },
  // ГУГЛ ДИСК (Меняй ссылку ниже)
  { name: "Google Drive", url: "https://docs.google.com/spreadsheets/d/1uYPdNnZgAcsBhjnLaxkTKE-Npg4GYR3ArOGF4Z9Pv-8/edit?pli=1&gid=1843704431#gid=1843704431", icon: <HardDrive className="w-8 h-8 text-amber-500" />, desc: "Хранилище контента" },
];

const placeholders = [
  { name: "Новый сервис", url: "#", desc: "Место для ссылки" },
  { name: "Будущий тул", url: "#", desc: "Место для ссылки" },
  { name: "Архив", url: "#", desc: "Место для ссылки" },
];

export default function Tools() {
  const openLink = (url) => {
    if (url !== "#") window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter uppercase">Нейронки & Инструменты</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* АКТИВНЫЕ ИНСТРУМЕНТЫ */}
        {aiTools.map((tool) => (
          <div 
            key={tool.name}
            onClick={() => openLink(tool.url)}
            className="group bg-white border-2 border-slate-100 p-8 rounded-[40px] flex items-center justify-between cursor-pointer hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2 transition-all shadow-sm"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-[24px] group-hover:bg-purple-50 transition-colors">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-tight">{tool.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</p>
              </div>
            </div>
            <ExternalLink className="w-6 h-6 text-slate-200 group-hover:text-purple-500 transition-colors" />
          </div>
        ))}

        {/* ПРОБКИ (ПУСТЫЕ СЛОТЫ) */}
        {placeholders.map((p, idx) => (
          <div 
            key={idx}
            className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[40px] flex items-center justify-between opacity-60 hover:opacity-100 transition-all cursor-help"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white rounded-[24px]">
                <Plus className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-400 leading-tight">{p.name}</h3>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}