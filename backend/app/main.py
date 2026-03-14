from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import init_db
from .models.content_plan import ContentPlan
from .models.prompt_history import PromptHistory
from .api.content import router as content_router


# что подсказала нейронка
# можно юзнуть lifespan, т.к. @app.on_event("startup") - устаревает
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db() #действие при запуске
    yield
    
app = FastAPI(title="PromptAGG", version="1.0.0", lifespan=lifespan)
app.include_router(content_router)

# настройка CORS, чтобы REACT-фронт мог делать запросы к бэку
# CORS - Cross-Origin Resourses Sharing (совместное испльзование ресурсов между источниками)

# <<*>> - все методы

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #список источников, которым разрешено отправлять запросы из других источников(на продакшене лучше указать конкретный адрес)
    allow_credentials=True, #файлы куки должны поддерживаться для междоменных запросов
    allow_methods=["*"], #Конкреетные методы HTTP(GET, POST) (я разрешил все)
    allow_headers=["*"] #конкретные HTTP-заголовки (я разрешил все)
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {
        "message": "PromptAGG работает"
    }