// тут все настройки и статические данные

export const mnsSettings = {
  style: "high-end commercial photography, Pinterest aesthetic, minimalist, clean lines, bright light-gray background, highly detailed, photorealistic",
  brand: "focus on modern stylish shoes, footwear photography, fashion brand catalog style. МНС-Обувь - производство качественной и стильной обуви.",
  typo: "📌 Типографика:\n- Гротеск с мягкими формами, без острых углов.\n- Основной: FindSansPro Bold."
};

export const platformsInfo = [
  { id: "VK", label: "VK", activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-300/50" },
  { id: "TG", label: "TG", activeClass: "bg-sky-500 text-white shadow-lg shadow-sky-300/50" },
  { id: "INST", label: "IG", activeClass: "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-300/50" },
  { id: "YT", label: "YT", activeClass: "bg-red-600 text-white shadow-lg shadow-red-300/50" },
  { id: "MAX", label: "MX", activeClass: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-300/50" }
];

export const getEmptyPlatform = () => ({
  step: 0, 
  rubric: "", 
  format: "", 
  promptTab: "text",
  textPrompt: { role: "Ты креативный SMM-специалист.", tone: "", details: "", constraints: "", useMns: true },
  visualPrompt: { format: "Картинка 1:1", essence: "", useColors: false, colors: [], useMns: true, textOverlay: "" },
  finalText: "", 
  refs: "", 
  mediaLink: ""
});