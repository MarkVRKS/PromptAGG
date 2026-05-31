from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from core.database import get_session
# 👇 ДОБАВИЛ ИМПОРТ Project СЮДА
from models.content_plan import ContentPlan, Idea, PromptTemplate, Project
from core.ws_manager import manager
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Принудительно читаем .env файл
load_dotenv()

# ЖЕСТКАЯ ИНИЦИАЛИЗАЦИЯ GEMINI API (без зависимости от .env)
genai.configure(api_key="AIzaSyBiPelkjW7GIlOuSyXY30CMf3OAPSzzXPM")
print("✅ Gemini API инициализирован с жестко заданным ключом")

router = APIRouter(prefix="/content-plan", tags=["Content Plan"])

# --- эндпоинты для постов ---
@router.get("/", response_model=List[ContentPlan])
def get_posts(project_id: str = "mns", session: Session = Depends(get_session)):
    statement = select(ContentPlan).where(ContentPlan.project_id == project_id)
    results = session.exec(statement).all()
    return results

@router.post("/", response_model=ContentPlan)
async def create_post(post: ContentPlan, session: Session = Depends(get_session)):
    session.add(post)
    session.commit()
    session.refresh(post)
    await manager.broadcast("update_posts")
    return post

@router.put("/{post_id}", response_model=ContentPlan)
async def update_post(post_id: int, update_post: ContentPlan, session: Session = Depends(get_session)):
    post = session.get(ContentPlan, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Пост не найден")
    
    post.topic = update_post.topic
    post.publish_date = update_post.publish_date
    post.platforms = update_post.platforms
    
    post.engagement_level = update_post.engagement_level
    
    session.add(post)
    session.commit()
    session.refresh(post)
    await manager.broadcast("update_posts")
    return post

@router.delete("/{post_id}")
async def delete_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(ContentPlan, post_id)
    if post:
        session.delete(post)
        session.commit()
        await manager.broadcast("update_posts")
    return {"message": "Пост удален"}

# --- эндпоинты для багажа идей ---
@router.get("/ideas/", response_model=List[Idea])
def get_idea(project_id: str = "mns", session: Session = Depends(get_session)):
    statement = select(Idea).where(Idea.project_id == project_id)
    results = session.exec(statement).all()
    return results

@router.post("/ideas/", response_model=Idea)
async def create_idea(idea: Idea, session: Session = Depends(get_session)):
    session.add(idea)
    session.commit()
    session.refresh(idea)
    await manager.broadcast("update_posts") # Оповещаем всех
    return idea

@router.delete("/ideas/{idea_id}")
async def delete_idea(idea_id: int, session: Session = Depends(get_session)):
    idea = session.get(Idea, idea_id)
    if idea:
        session.delete(idea)
        session.commit()
        await manager.broadcast("update_posts") # Оповещаем всех
    return {"message": "Идея удалена"}

# --- эндпоинты для библиотеки промптов ---
@router.get("/library/", response_model=List[PromptTemplate])
def get_library(session: Session = Depends(get_session)):
    statement = select(PromptTemplate)
    results = session.exec(statement).all() 
    return results

@router.post("/library/", response_model=PromptTemplate)
async def create_library_prompt(prompt: PromptTemplate, session: Session = Depends(get_session)):
    session.add(prompt)
    session.commit()
    session.refresh(prompt)
    await manager.broadcast("update_posts") # Оповещаем всех
    return prompt

@router.delete("/library/{prompt_id}")
async def delete_library_prompt(prompt_id: int, session: Session = Depends(get_session)):
    prompt = session.get(PromptTemplate, prompt_id)
    if prompt:
        session.delete(prompt)
        session.commit()
        await manager.broadcast("update_posts") # Оповещаем всех
    return {"message": "Шаблон удалён"}

class ProjectCreate(BaseModel):
    id: str
    name: str

# --- Эндпоинты для проектов ---
@router.get("/projects/")
def get_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    # Если база проектов пустая, создаем базовые по умолчанию
    if not projects:
        default_projects = [
            Project(id="mns", name="MNS"),
            Project(id="moshelovka", name="MOSHELOVKA"),
            Project(id="nelimita", name="NELIMITA")
        ]
        for p in default_projects:
            session.add(p)
        session.commit()
        return default_projects
    return projects

@router.post("/projects/")
def create_project(project: ProjectCreate, session: Session = Depends(get_session)):
    new_project = Project(id=project.id.lower(), name=project.name)
    session.add(new_project)
    session.commit()
    return new_project

@router.delete("/projects/{project_id}")
def delete_project(project_id: str, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if project:
        session.delete(project)
    
    # 2. Удаляем все посты этого проекта
    posts = session.exec(select(ContentPlan).where(ContentPlan.project_id == project_id)).all()
    for post in posts:
        session.delete(post)
        
    # 3. Удаляем все идеи этого проекта
    ideas = session.exec(select(Idea).where(Idea.project_id == project_id)).all()
    for idea in ideas:
        session.delete(idea)
        
    session.commit()
    return {"status": "deleted"}

# --- Модель для генерации промпта ---
class GeneratePromptRequest(BaseModel):
    post_id: int
    prompt_type: str  # "text" или "visual"

# --- Endpoint для генерации супер-промпта через Google Gemini ---
@router.post("/generate-prompt")
async def generate_super_prompt(request: GeneratePromptRequest, session: Session = Depends(get_session)):
    try:
        # Получаем пост
        post = session.get(ContentPlan, request.post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Пост не найден")

        print(f"🔄 Генерация промпта для поста ID={request.post_id}, тип={request.prompt_type}")
        print(f"📝 Тема поста: {post.topic}")

        # Создаем модель (используем актуальную gemini-1.5-flash)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Формируем системный промпт в зависимости от типа
        if request.prompt_type == "visual":
            system_prompt = f"""Ты — эксперт по созданию промптов для генерации изображений (Midjourney, DALL-E, Stable Diffusion).

Твоя задача: превратить это ТЗ для поста в детализированный, профессиональный промпт для генерации визуала.

ТЗ поста:
{post.topic}

Создай промпт, который включает:
- Описание композиции и ракурса
- Стиль и настроение
- Цветовую палитру
- Освещение и атмосферу
- Технические детали (разрешение, качество)

Ответь ТОЛЬКО текстом промпта, без дополнительных пояснений."""
        else:  # text
            system_prompt = f"""Ты — эксперт по созданию промптов для текстовых нейросетей (ChatGPT, Claude, Gemini).

Твоя задача: превратить это ТЗ для поста в детализированный, профессиональный промпт для генерации текста.

ТЗ поста:
{post.topic}

Создай промпт, который включает:
- Роль и контекст для нейросети
- Четкую задачу
- Требования к стилю и тону
- Структуру ответа
- Ограничения и важные детали

Ответь ТОЛЬКО текстом промпта, без дополнительных пояснений."""

        print(f"🤖 Отправляем запрос в Gemini...")
        response = model.generate_content(system_prompt)
        generated_prompt = response.text

        print(f"✅ Промпт успешно сгенерирован ({len(generated_prompt)} символов)")
        return {"prompt": generated_prompt}

    except Exception as e:
        error_msg = str(e)
        print(f"❌ GEMINI ERROR DETAILS: {error_msg}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return {"error": f"Ошибка генерации: {error_msg}", "prompt": None}

# --- Endpoint для экспорта постов за месяц в JSON ---
@router.get("/export/{year}/{month}")
def export_posts_by_month(year: int, month: int, project_id: str = "mns", session: Session = Depends(get_session)):
    try:
        # Формируем диапазон дат для месяца
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"

        # Получаем все посты за месяц
        statement = select(ContentPlan).where(
            ContentPlan.project_id == project_id,
            ContentPlan.publish_date >= start_date,
            ContentPlan.publish_date < end_date
        )
        posts = session.exec(statement).all()

        # Формируем JSON (упрощенный для скорости)
        export_data = []
        for post in posts:
            export_data.append({
                "id": post.id,
                "date": post.publish_date,
                "topic": post.topic,
                "engagement_level": post.engagement_level,
                "platforms": post.platforms
            })

        print(f"✅ Экспорт выполнен: {len(export_data)} постов")
        return {"posts": export_data, "total": len(export_data)}
    except Exception as e:
        print(f"❌ ОШИБКА ЭКСПОРТА: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка экспорта: {str(e)}")