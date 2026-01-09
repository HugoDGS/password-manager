from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import init_db
from routers import auth as auth_router, vault as vault_router

load_dotenv()

app = FastAPI(title="Password Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(auth_router.router)
app.include_router(vault_router.router)

@app.get("/health")
def health():
    return {"status": "ok"}
