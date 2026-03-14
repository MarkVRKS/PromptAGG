from datetime import date
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .prompt_history import PromptHistory

class ContentPlan(SQLModel, table=True):
    
    __tablename__ = "content_plan"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    platform: str
    topic: str
    description: str
    role: str
    content_type: str
    publish_date: date
    
    prompts: List["PromptHistory"] = Relationship(back_populates="content_item")