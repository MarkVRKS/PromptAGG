from ..models.content_plan import ContentPlan

# дефолтные настройки
DEFAULT_STYLE = "high-end commercial photography, Pinterest aesthetic, minimalist, clean lines, bright light-gray background, highly detailed, 8k resolution, photorealistic"
BRAND_CONTEXT = "focus on modern stylish shoes, footwear photography, fashion brand catalog style. МНС-Обувь - производство качественной и стильной обуви."
TYPOGRAPHY = "📌 Типографика: Гротеск с мягкими формами, без острых углов. Чёткая читаемость — приоритет. Основной: FindSansPro Bold."

def generate_media_prompt(item: ContentPlan) -> str:
    # соотношение сторон
    ar_map = {
        "Картинка 1:1": "--ar 1:1",
        "Картинка 9:16": "picture--ar 9:16",
        "Картинка 16:9": "picture--ar 16:9",
        "Видео 9:16": "video --ar 9:16",
        "Видео 16:9": "video --ar 16:9",
        "Видео 1:1": "video --ar 1:1"
    }
    
    # для примера
    aspect_ratio = ar_map.get(item.platform, "--ar 1:1")
    
    # формируем промпт
    ai_prompt = f"{BRAND_CONTEXT}, {item.description}, {DEFAULT_STYLE} {aspect_ratio}"
    
    full_spec = (
        f"1. Формат: {item.platform}\n\n"
        f"2. Бренд контекст: Да (МНС-обувь: акцент на обувь)\n\n"
        f"3. Суть картинки:\n{item.description}\n\n"
        f"4. Готовый промпт для нейросети:\n{ai_prompt}\n\n"
        f"5. Типографика:\n{TYPOGRAPHY}"
    )
    return full_spec