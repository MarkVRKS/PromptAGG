from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from ..core.database import get_session
from ..models.content_plan import ContentPlan, Idea, PromptTemplate

router = APIRouter(prefix="/content-plan", tags=["Content Plan"])

# --- эндпоинты для постов ---
@router.get("/", response_model=List[ContentPlan])
def get_posts(project_id: str = "mns", session: Session = Depends(get_session)):
    statement = select(ContentPlan).where(ContentPlan.project_id == project_id)
    results = session.exec(statement).all()
    return results

@router.post("/", response_model=ContentPlan)
def create_post(post: ContentPlan, session: Session = Depends(get_session)):
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.put("/{post_id}", response_model=ContentPlan)
def update_post(post_id: int, update_post: ContentPlan, session: Session = Depends(get_session)):
    post = session.get(ContentPlan, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Пост не найден")
    
    post.topic = update_post.topic
    post.publish_date = update_post.publish_date
    post.platforms = update_post.platforms
    
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(ContentPlan, post_id)
    if post:
        session.delete(post)
        session.commit()
    return {"message": "Пост удален"}

# --- эндпоинты для багажа идей ---
@router.get("/ideas/", response_model=List[Idea])
def get_idea(project_id: str = "mns", session: Session = Depends(get_session)):
    statement = select(Idea).where(Idea.project_id == project_id)
    results = session.exec(statement).all()
    return results

@router.post("/ideas/", response_model=Idea)
def create_idea(idea: Idea, session: Session = Depends(get_session)):
    session.add(idea)
    session.commit()
    session.refresh(idea)
    return idea

@router.delete("/ideas/{idea_id}")
def delete_idea(idea_id: int, session: Session = Depends(get_session)):
    idea = session.get(Idea, idea_id)
    if idea:
        session.delete(idea)
        session.commit()
    return {"message": "Идея удалена"}

# --- эндпоинты для библиотеки промптов ---
@router.get("/library/", response_model=List[PromptTemplate])
def get_library(session: Session = Depends(get_session)):
    statement = select(PromptTemplate)
    results = session.exec(statement).all() 
    return results

@router.post("/library/", response_model=PromptTemplate)
def create_library_prompt(prompt: PromptTemplate, session: Session = Depends(get_session)):
    session.add(prompt)
    session.commit()
    session.refresh(prompt)
    return prompt

@router.delete("/library/{prompt_id}")
def delete_library_prompt(prompt_id: int, session: Session = Depends(get_session)):
    prompt = session.get(PromptTemplate, prompt_id)
    if prompt:
        session.delete(prompt)
        session.commit()
    return {"message": "Шаблон удалён"}