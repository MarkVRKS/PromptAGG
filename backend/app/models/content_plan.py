from datetime import date
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import Optional, Dict, Any

# ----- модель контент плана -----
class ContentPlan(SQLModel, table=True):
    __tablename__ = "content_plan"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: str = Field(default="mns", index=True) 
    publish_date: date
    topic: str = ""
    
    platforms: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # СТРОКА С prompts УДАЛЕНА! Больше никаких зависимостей.

# ----- модель багажа идей -----
class Idea(SQLModel, table=True):
    __tablename__ = "ideas"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: str = Field(default="mns", index=True)
    text: str
    
# ----- модель для библиотеки промптов -----
class PromptTemplate(SQLModel, table=True):
    __tablename__ = "prompt_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str 
    title: str
    text: str