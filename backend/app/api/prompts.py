from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..core.database import get_session
from ..models.content_plan import ContentPlan
from ..models.prompt_history import PromptHistory
from ..services.prompt_media import generate_media_prompt
from ..services.prompt_text import generate_text_prompt

router = APIRouter(prefix="/generate", tags=["Генерация"])

@router.post("/{item_id}", response_model=PromptHistory)
def create_prompt(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ContentPlan, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    if item.content_type == "text":
        final_text = generate_text_prompt(item)
    else:
        final_text = generate_media_prompt(item)
        
    new_history = PromptHistory(
        prompt_text = final_text,
        content_plan_id = item.id
    )
    session.add(new_history)
    session.commit()
    session.refresh(new_history)
    
    return new_history

# реализиуем показ истории промтов
@router.get("/history/{item_id}", response_model=List[PromptHistory])
def get_item_history(item_id: int, session: Session = Depends(get_session)):
    statement = select(PromptHistory).where(PromptHistory.content_plan_id == item_id)
    results = statement.exec(statement).all()
    return results