from fastapi import APIRouter, Depends, HTTPException #импорт создания группы маршрутов, механизма внедрения зависимостей, возврат HTTP-ошибок
from sqlmodel import Session, select
from typing import List
from ..core.database import get_session
from ..models.content_plan import ContentPlan

router = APIRouter(prefix="/content-plan", tags=["Content Plan"])
# я тегаю чтобы Swagger был заполнен

# создаю эндпоинт POST /content-plan/ | определяем структуру json-ответа
@router.post("/", response_model=ContentPlan)
# FastAPI берёт json из body-запроса вилидирует его и преобразует в объект ContentPlan
def create_content_item(item: ContentPlan, session: Session = Depends(get_session)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

# создаю эндпоинт GET /content-plan/
@router.get("/", response_model=List[ContentPlan])
def read_content_plan(session: Session = Depends(get_session)):
    #тут получаем все записи для календаря
    statement = select(ContentPlan)
    results = statement.exec(statement).all() #отправляем запрос в БД
    return results