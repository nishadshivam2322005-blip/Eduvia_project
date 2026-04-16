from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, upload, skills
import models.models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eduvia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://eduvia-zeta.vercel.app",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(skills.router, prefix="/skills", tags=["skills"])

@app.get("/")
def root():
    return {"message": "Eduvia API running"}