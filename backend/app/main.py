from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.routers import auth, users, matches, news, community


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for Expo / React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "project": "THE RED",
        "club": "Manchester United",
        "version": settings.VERSION
    }


# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(matches.router, prefix=settings.API_V1_PREFIX)
app.include_router(news.router, prefix=settings.API_V1_PREFIX)
app.include_router(community.router, prefix=settings.API_V1_PREFIX)


# Safe global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Never leak internal stack traces to clients
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )
