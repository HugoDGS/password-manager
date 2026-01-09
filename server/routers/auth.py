from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import get_conn
from crypto import hash_master_password, verify_master_password, generate_kdf_salt
from auth import create_token

router = APIRouter(prefix="/api/auth")


class RegisterRequest(BaseModel):
    email: EmailStr
    master_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    master_password: str


@router.post("/register", status_code=201)
def register(body: RegisterRequest):
    if len(body.master_password) < 8:
        raise HTTPException(status_code=400, detail="Master password must be at least 8 characters")

    master_hash = hash_master_password(body.master_password)
    kdf_salt = generate_kdf_salt()

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (body.email,))
            if cur.fetchone():
                raise HTTPException(status_code=409, detail="Email already registered")
            cur.execute(
                "INSERT INTO users (email, master_hash, kdf_salt) VALUES (%s, %s, %s) RETURNING id",
                (body.email, master_hash, kdf_salt),
            )
            user_id = cur.fetchone()["id"]

    token = create_token(user_id)
    return {"access_token": token, "token_type": "bearer", "kdf_salt": kdf_salt}


@router.post("/login")
def login(body: LoginRequest):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, master_hash, kdf_salt FROM users WHERE email = %s", (body.email,))
            user = cur.fetchone()

    if not user or not verify_master_password(user["master_hash"], body.master_password):
        raise HTTPException(status_code=401, detail="Invalid email or master password")

    token = create_token(user["id"])
    return {"access_token": token, "token_type": "bearer", "kdf_salt": user["kdf_salt"]}
