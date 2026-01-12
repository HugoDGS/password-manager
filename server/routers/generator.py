from fastapi import APIRouter
from pydantic import BaseModel
from utils.generator import generate_password, password_strength

router = APIRouter(prefix="/api/generator")


class GenerateRequest(BaseModel):
    length: int = 16
    use_upper: bool = True
    use_digits: bool = True
    use_symbols: bool = True


@router.post("/generate")
def generate(body: GenerateRequest):
    password = generate_password(
        length=min(max(body.length, 4), 128),
        use_upper=body.use_upper,
        use_digits=body.use_digits,
        use_symbols=body.use_symbols,
    )
    return {"password": password, "strength": password_strength(password)}


@router.post("/strength")
def check_strength(body: dict):
    return password_strength(body.get("password", ""))
