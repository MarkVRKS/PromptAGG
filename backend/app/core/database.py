import os #работает с файлами
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv

load_dotenv()

# RAILWAY автоматически предоставляет DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:123@localhost:5432/promptagg")

# движок SQLAlchemy для взаимодействия с базой данных
engine = create_engine(DATABASE_URL, echo=True)

# функция, которая будет создавать таблицы на основе моделей (prompt_histroy, content_plan)
def init_db():
    SQLModel.metadata.create_all(engine)
    
# генератор сессий для эндпоинтов, для автоматического управления сессиями БД через FastAPI Depends()
#FastAPI вызывает функцию
#Открывает БД
#ПАУЗА: даёт сессию эндпоинту
#ПОДОЛЖЕНИЕ: FastAPI вернул ответ -> with закрывает сессию
def get_session():
    with Session(engine) as session: #открывает сессию БД автоматически, выполняет код внутри блока и закрывает сессию автоматически (даже при ошибках)
        yield session #передаёт session в эндпоинт, но не завершает функцию, FastAPI использует сессию в POST/GET, а после ответа код продолжается (даже после yield)
        