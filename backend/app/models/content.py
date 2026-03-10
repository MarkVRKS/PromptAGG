from sqlalchemy import Column, String, Integer, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime

from app.core.database import Base

class ContentPlan(Base):
    
    __tablename__ = "content_plan"
    
    id = Column(Integer, primary_key=True, index=True)
    
    platform = Column(String) #VK, TG, OK, etc.
    topic = Column(String) 
    ai_role = Column(String) #what's the role of ai-agent will be
    date = Column(Date)
    rubric = Column(String)
    format = Column(String)
    description = Column(Text)
    weekday = Column(String)
    # у каждой записи ContentPlan есть связанные записи в PromptHistory
    # back_populates="content_item" - двустороняя связь между таблицами
    # ну и каскадное удаление (если удалить что-то из контент-плана, оно удалиться и из PromptHistory)
    prompts = relationship("PromptHistory", back_populates="content_item", cascade="all, delete-orphan")
    
class PromptHistory(Base):
    
    __tablename__ = "prompt_history"
    
    id = Column(Integer, primary_key=True, index=True)
    
    #foreing key which linking with content-plan table
    content_plan_id = Column(Integer, ForeignKey("content_plan.id"))
    
    prompt_text = Column(Text) # prompt's text
    
    # автоматическое установление текущего времени по UTC при создании записи
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    content_item = relationship("ContentPlan", back_populates="prompts")