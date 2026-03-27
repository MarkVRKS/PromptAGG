from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import init_db
from .models.content_plan import ContentPlan
from .api.content import router as content_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db() #создание таблиц при запуске
    yield
    
app = FastAPI(
    title="PromptAGG Pro", 
    version="2.0.0", 
    lifespan=lifespan
    )

origins = [
    "http://localhost:5173",         
    "https://promptagg-web.vercel.app/",  
]
# настройка CORS, чтобы REACT-фронт мог делать запросы к бэку
# CORS - Cross-Origin Resourses Sharing (совместное испльзование ресурсов между источниками)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, #файлы куки должны поддерживаться для междоменных запросов
    allow_methods=["*"], #Конкреетные методы HTTP(GET, POST) (я разрешил все)
    allow_headers=["*"] #конкретные HTTP-заголовки (я разрешил все)
)

# подключаем все роутеры
app.include_router(content_router)

@app.get('/')
def read_root():
    return {
        "status": "online",
        "message": "PromptAGG Pro Backend is Ready"
    }