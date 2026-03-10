from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class ContentBase(BaseModel):
    platform: str
    topic: str
    ai_role: str
    date: datetime.date #можно убрать datetime.
    rubric: str
    format: str
    weekday: str

class ContentCreate(ContentBase):
    description: Optional[str] = None #Поле может быть пустым

class ContentRead(ContentBase):
    id:int
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
        
class PromptRead(BaseModel):
    id: int
    content_plan_id: int
    prompt_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True