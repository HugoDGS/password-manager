# Password Manager

Zero-knowledge password vault — all credentials are encrypted client-side before storage.

## Stack

- **Server** — FastAPI, PostgreSQL, Argon2, AES-256 (Fernet), PBKDF2
- **Client** — React, Vite
- **Container** — Docker, docker-compose

## Security model

- Master password hashed with **Argon2id** (never stored in plaintext)
- Vault encryption key derived via **PBKDF2-SHA256** (480 000 iterations) from master password + user salt
- All vault entries encrypted with **AES-256** (Fernet) — server stores only ciphertext
- **JWT** sessions (HS256, configurable expiry)
- The server cannot decrypt any entry without the master password

## Features

- Register / login with master password
- Store credentials (title, username, password, URL, notes)
- Show / hide passwords, one-click copy
- Password generator with strength meter and configurable options
- Search vault entries

## Getting started

```bash
# Development
cd server && pip install -r requirements.txt && cp .env.example .env
uvicorn main:app --reload

cd client && npm install && npm run dev
```

```bash
# Docker
docker-compose up --build
```
