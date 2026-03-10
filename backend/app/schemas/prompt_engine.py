from app.models.content import ContentPlan

def create_prompt_from_formula(item):
    
    #Генератор промтов с учетом карточки стиля от Саши.
    
    
    # 1. Блок визуального стиля (выжимка из твоей Style Card)
    #
    visual_identity = (
        "Aesthetic: Premium, modern, minimalist. "
        "Color Palette: Amethyst (#9d5cda) as primary accent, Fuchsia and Soft Blue highlights. "
        "Background: Bright light-grey (#f4f5f8), clean, airy, no warm or yellow textures. "
        "Lighting & Color: Cold color balance, pure white (no cream), high clarity, neat contrast. "
        "Typography style: Soft grotesque, rounded forms, high readability."
    )

    # 2. Ограничения (чтобы не было "колхоза")
    quality_constraints = (
        "Constraints: No yellow filters, no aggressive backgrounds, monochrome or amethyst logo integration. "
        "Personality without overload, professional product photography vibe."
    )

    # 3. Сборка финального промта по твоей формуле из ТЗ
    final_prompt = (
        f"### ROLE\n{item.ai_role}\n\n"
        f"### CONTEXT & TASK\n{item.description}\n"
        f"Topic: {item.topic} for {item.platform}\n"
        f"Format: {item.format}\n\n"
        f"### VISUAL STYLE GUIDE\n{visual_identity}\n\n"
        f"### FINAL INSTRUCTIONS\n{quality_constraints}\n"
        f"Day of week: {item.weekday}. Respond with a clean content structure."
    )
    
    return final_prompt