import secrets
import string

LOWER = string.ascii_lowercase
UPPER = string.ascii_uppercase
DIGITS = string.digits
SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?"


def generate_password(
    length: int = 16,
    use_upper: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True,
) -> str:
    if length < 4:
        length = 4

    charset = LOWER
    required = [secrets.choice(LOWER)]

    if use_upper:
        charset += UPPER
        required.append(secrets.choice(UPPER))
    if use_digits:
        charset += DIGITS
        required.append(secrets.choice(DIGITS))
    if use_symbols:
        charset += SYMBOLS
        required.append(secrets.choice(SYMBOLS))

    remaining = [secrets.choice(charset) for _ in range(length - len(required))]
    password_list = required + remaining
    secrets.SystemRandom().shuffle(password_list)
    return "".join(password_list)


def password_strength(password: str) -> dict:
    score = 0
    feedback = []

    if len(password) >= 8:
        score += 1
    else:
        feedback.append("Use at least 8 characters")

    if len(password) >= 16:
        score += 1

    if any(c in UPPER for c in password):
        score += 1
    else:
        feedback.append("Add uppercase letters")

    if any(c in DIGITS for c in password):
        score += 1
    else:
        feedback.append("Add numbers")

    if any(c in SYMBOLS for c in password):
        score += 1
    else:
        feedback.append("Add special characters")

    levels = {0: "very-weak", 1: "weak", 2: "fair", 3: "good", 4: "strong", 5: "very-strong"}
    return {"score": score, "level": levels[score], "feedback": feedback}
