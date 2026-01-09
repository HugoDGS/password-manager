from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_conn
from auth import get_current_user
from crypto import encrypt, decrypt, derive_vault_key

router = APIRouter(prefix="/api/vault")


class EntryRequest(BaseModel):
    title: str
    username: str
    password: str
    url: Optional[str] = None
    notes: Optional[str] = None
    master_password: str


class EntryResponse(BaseModel):
    id: int
    title: str
    username: str
    password: str
    url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


def get_user_salt(user_id: int) -> str:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT kdf_salt FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row["kdf_salt"]


def decrypt_entry(row: dict, key: bytes) -> EntryResponse:
    return EntryResponse(
        id=row["id"],
        title=row["title"],
        username=decrypt(row["username_enc"], key),
        password=decrypt(row["password_enc"], key),
        url=decrypt(row["url_enc"], key) if row["url_enc"] else None,
        notes=decrypt(row["notes_enc"], key) if row["notes_enc"] else None,
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


@router.get("", response_model=list[EntryResponse])
def list_entries(master_password: str, user_id: int = Depends(get_current_user)):
    salt = get_user_salt(user_id)
    key = derive_vault_key(master_password, salt)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM vault_entries WHERE user_id = %s ORDER BY updated_at DESC",
                (user_id,),
            )
            rows = cur.fetchall()

    try:
        return [decrypt_entry(dict(r), key) for r in rows]
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid master password")


@router.post("", response_model=EntryResponse, status_code=201)
def create_entry(body: EntryRequest, user_id: int = Depends(get_current_user)):
    salt = get_user_salt(user_id)
    key = derive_vault_key(body.master_password, salt)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO vault_entries (user_id, title, username_enc, password_enc, url_enc, notes_enc)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                (
                    user_id,
                    body.title,
                    encrypt(body.username, key),
                    encrypt(body.password, key),
                    encrypt(body.url, key) if body.url else None,
                    encrypt(body.notes, key) if body.notes else None,
                ),
            )
            row = cur.fetchone()

    return decrypt_entry(dict(row), key)


@router.put("/{entry_id}", response_model=EntryResponse)
def update_entry(entry_id: int, body: EntryRequest, user_id: int = Depends(get_current_user)):
    salt = get_user_salt(user_id)
    key = derive_vault_key(body.master_password, salt)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE vault_entries
                   SET title=%s, username_enc=%s, password_enc=%s, url_enc=%s, notes_enc=%s, updated_at=NOW()
                   WHERE id=%s AND user_id=%s RETURNING *""",
                (
                    body.title,
                    encrypt(body.username, key),
                    encrypt(body.password, key),
                    encrypt(body.url, key) if body.url else None,
                    encrypt(body.notes, key) if body.notes else None,
                    entry_id,
                    user_id,
                ),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    return decrypt_entry(dict(row), key)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, user_id: int = Depends(get_current_user)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM vault_entries WHERE id=%s AND user_id=%s RETURNING id",
                (entry_id, user_id),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Entry not found")
