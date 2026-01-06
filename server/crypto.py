import os
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)


def hash_master_password(master_password: str) -> str:
    return ph.hash(master_password)


def verify_master_password(stored_hash: str, master_password: str) -> bool:
    try:
        return ph.verify(stored_hash, master_password)
    except VerifyMismatchError:
        return False


def generate_kdf_salt() -> str:
    return base64.b64encode(os.urandom(32)).decode()


def derive_vault_key(master_password: str, salt_b64: str) -> bytes:
    salt = base64.b64decode(salt_b64)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480_000,
        backend=default_backend(),
    )
    return base64.urlsafe_b64encode(kdf.derive(master_password.encode()))


def encrypt(plaintext: str, key: bytes) -> str:
    return Fernet(key).encrypt(plaintext.encode()).decode()


def decrypt(token: str, key: bytes) -> str:
    return Fernet(key).decrypt(token.encode()).decode()
