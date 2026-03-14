from ..models.content_plan import ContentPlan

BRAND_INFO = "МНС-Обувь - производство качественной и стильной обуви. Фокус на современный стиль и комфорт."

def generate_text_prompt(item: ContentPlan) -> str:

    prompt_blocks = [
        f"[Роль]:\n{item.role or 'Ты креативный и современный SMM-специалист.'}",
        f"\n[Контекст бренда]:\n{BRAND_INFO}",
        f"\n[Задача и Формат]:\nНаписать текст для {item.platform} на тему: {item.topic}",
        f"\n[Стиль и Тон]:\nДружелюбный, экспертный, без сложных терминов.",
        f"\n[Детали к посту]:\n{item.description}",
        f"\n[Ограничения / Призыв к действию]:\nМаксимум 3 абзаца. В конце добавь призыв к действию."
    ]
    
    return "\n".join(prompt_blocks)