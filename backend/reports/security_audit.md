# 🔒 InvenTrack Backend — Security Audit Report

**Date:** 2026-05-30
**Scope:** All Python files in `backend/app/`, plus `.env`, `Dockerfile`, `requirements.txt`
**Auditor:** Automated Security Review

---

## Executive Summary

| # | Audit Area | Verdict | Severity |
|---|------------|---------|----------|
| 1 | Password Hashing | ✅ PASS | — |
| 2 | JWT Validation | ⚠️ WARN | Medium |
| 3 | SQL Injection | ✅ PASS | — |
| 4 | Secrets Management | 🔴 FAIL | **Critical** |
| 5 | Resource Ownership | ✅ PASS | — |
| 6 | CORS Configuration | ⚠️ WARN | Medium |
| 7 | Unhandled Exceptions | ⚠️ WARN | Low |

**Overall Risk Rating: MEDIUM-HIGH** — primarily due to exposed database credentials and a weak JWT secret in production.

---

## 1. Password Hashing ✅ PASS

**Files reviewed:** [auth.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/auth.py#L26-L31)

```python
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
```

| Check | Result |
|-------|--------|
| Algorithm | bcrypt ✅ |
| Salt generation | `bcrypt.gensalt()` — auto-generates random 16-byte salt ✅ |
| Work factor | Default rounds = **12** (2^12 = 4096 iterations) ✅ |
| Timing-safe comparison | `bcrypt.checkpw` is constant-time ✅ |

> [!TIP]
> The default work factor of 12 is adequate for 2026. OWASP recommends a minimum of 10. If you want to future-proof, you can explicitly set `bcrypt.gensalt(rounds=13)`, but this doubles hashing time per login.

**Verdict:** No issues found.

---

## 2. JWT Token Validation ⚠️ WARN

**Files reviewed:** [auth.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/auth.py#L36-L67)

| Check | Result |
|-------|--------|
| Algorithm pinned | `ALGORITHM = "HS256"` and decoded with `algorithms=[ALGORITHM]` ✅ |
| Expiration enforced | `exp` claim is set; `python-jose` validates it by default ✅ |
| Subject validated | `user_id` from `sub` claim is checked against DB ✅ |
| Token type checked | ❌ No `typ` or `token_type` claim in JWT payload |
| Issuer / Audience checked | ❌ No `iss` or `aud` claims |

### Finding 2a — No Token-Type Claim (Low)

The JWT payload only contains `{"sub": user_id, "exp": ...}`. If you later add refresh tokens or email-verification tokens signed with the same secret, an attacker could reuse one token type as another.

**Recommendation:** Add a `"type": "access"` claim at creation and validate it at decode:

```diff
 def create_access_token(data: dict, ...):
     to_encode = data.copy()
+    to_encode["type"] = "access"
     ...

 def get_current_user(...):
     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
+    if payload.get("type") != "access":
+        raise credentials_exception
```

### Finding 2b — Weak Default Secret (Medium)

```python
SECRET_KEY: str = os.getenv("JWT_SECRET", "change-me-in-production")
```

The fallback `"change-me-in-production"` is a publicly known string. If the environment variable is ever missing, all tokens become forgeable.

The actual `.env` value is also just the placeholder text:
```
JWT_SECRET=replace-with-a-random-secret-string-at-least-32-chars
```

**Recommendation:** Generate a real secret and remove the default fallback:

```python
SECRET_KEY: str = os.environ["JWT_SECRET"]  # crash on startup if missing
```

Generate a proper secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## 3. SQL Injection ✅ PASS

**Files reviewed:** [crud.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/crud.py), [database.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/database.py)

| Check | Result |
|-------|--------|
| Raw SQL queries | Only `text("SELECT 1")` for connection test — no user input ✅ |
| ORM usage | All queries use SQLAlchemy ORM `.filter()` with column operators ✅ |
| String interpolation in queries | None found ✅ |
| Dynamic `.order_by()` from user input | Not used ✅ |

The entire data layer uses parameterized ORM queries. No raw string concatenation was found anywhere.

**Verdict:** No issues found.

---

## 4. Secrets Management 🔴 FAIL

**Files reviewed:** [.env](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/.env), [database.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/database.py), [auth.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/auth.py)

### Finding 4a — No `.gitignore` — Credentials at Risk of Being Committed (🔴 Critical)

> [!CAUTION]
> There is **no `.gitignore` file** anywhere in the project (neither in `backend/` nor at the project root). The `.env` file contains a **live PostgreSQL connection string with username and password** for a Render-hosted database:
>
> ```
> DATABASE_URL=postgresql://pgdb_xu6r_user:6jnK...@dpg-....render.com/pgdb_xu6r
> ```
>
> If this repository is ever pushed to GitHub, these credentials will be **permanently exposed** in git history.

**Recommendation — create immediately:**

```gitignore
# backend/.gitignore
.env
*.pyc
__pycache__/
venv/
*.db
```

If the `.env` has already been committed, the Render database password must be rotated.

### Finding 4b — No `.dockerignore` — `.env` Baked into Docker Image (Medium)

The `Dockerfile` uses `COPY . .` with no `.dockerignore`. This copies the `.env` (with real credentials) into the Docker image layer, which anyone with access to the image can extract.

**Recommendation — create:**

```dockerignore
# backend/.dockerignore
.env
.env.*
venv/
__pycache__/
*.db
.git/
```

### Finding 4c — Database Error Printed to stdout (Low)

In [database.py:L23](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/database.py#L23):

```python
print(f"WARNING: Could not connect to PostgreSQL ({e}). Falling back to SQLite.")
```

The exception `e` may contain the full connection string including the password.

**Recommendation:** Log the error type only:

```python
print(f"WARNING: Could not connect to PostgreSQL ({type(e).__name__}). Falling back to SQLite.")
```

### Finding 4d — JWT Secret Is a Placeholder (Medium)

The `.env` value `replace-with-a-random-secret-string-at-least-32-chars` is clearly a placeholder that was never replaced. Combined with the hardcoded fallback in auth.py, this means the signing key is effectively public.

---

## 5. Resource Ownership Verification ✅ PASS

**Files reviewed:** [main.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/main.py), [crud.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/crud.py)

Every authenticated endpoint injects `current_user` via the `get_current_user` dependency, and every CRUD function filters by `owner_id`:

| Endpoint | Ownership Filter |
|----------|-----------------|
| `GET /api/inventories` | `.filter(Inventory.owner_id == owner_id)` ✅ |
| `GET /api/inventories/{id}` | `.filter(Inventory.id == inv_id, Inventory.owner_id == owner_id)` ✅ |
| `PUT /api/inventories/{id}` | Same as above ✅ |
| `DELETE /api/inventories/{id}` | Same as above ✅ |
| `GET /api/inventories/{id}/categories` | Checks inventory ownership first ✅ |
| `POST /api/inventories/{id}/categories` | Checks inventory ownership first ✅ |
| `PUT .../categories/{cid}` | Joins through Inventory to verify `owner_id` ✅ |
| `DELETE .../categories/{cid}` | Same as above ✅ |
| `GET /api/items` | Joins Category → Inventory → `owner_id` filter ✅ |
| `POST /api/items` | Verifies category ownership via join ✅ |
| `GET /api/items/{id}` | Joins through to verify ownership ✅ |
| `PUT /api/items/{id}` | Same as above ✅ |
| `DELETE /api/items/{id}` | Same as above ✅ |
| `GET /api/dashboard/stats` | Filtered by `owner_id` ✅ |

> [!NOTE]
> The `update_item` endpoint in [crud.py:L385](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/crud.py#L385) allows changing `category_id` without verifying that the **new** category also belongs to the same owner. An authenticated user could move their item into another user's category if they guessed the UUID.

**Recommendation:** Add a secondary ownership check when `data.category_id` differs from the item's current `category_id`:

```python
if data.category_id != item.category_id:
    new_cat = (
        db.query(models.Category)
        .join(models.Inventory)
        .filter(models.Category.id == data.category_id,
                models.Inventory.owner_id == owner_id)
        .first()
    )
    if not new_cat:
        return None  # or raise
```

---

## 6. CORS Configuration ⚠️ WARN

**File reviewed:** [main.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/main.py#L20-L26)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Finding 6a — Wildcard Origin with Credentials (Medium)

> [!WARNING]
> `allow_origins=["*"]` combined with `allow_credentials=True` is **explicitly prohibited** by the CORS spec. Browsers will **reject** credentialed cross-origin requests when the server responds with `Access-Control-Allow-Origin: *`.
>
> FastAPI/Starlette works around this by echoing back the request's `Origin` header when credentials are enabled, which effectively allows **any origin** — this is equivalent to disabling CORS entirely.

**For development**, this is acceptable.
**For production**, restrict to your actual frontend domain:

```python
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## 7. Unhandled Exceptions ⚠️ WARN

### Finding 7a — No Global Exception Handler (Low)

If an unexpected exception occurs (e.g., database connection drops mid-request), FastAPI's default handler returns:

```json
{"detail": "Internal Server Error"}
```

This is safe — it does not leak stack traces. However, there is **no logging** of the error server-side, making debugging difficult.

**Recommendation:** Add a catch-all handler:

```python
import logging
logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )
```

### Finding 7b — Database Fallback Fails Silently (Low)

In [database.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/database.py#L22-L24), if PostgreSQL is unreachable, the app silently falls back to an **empty SQLite database**. In production this means:
- All existing data disappears
- New data is written to a local file that will be lost on container restart

This should be a hard failure in production.

### Finding 7c — OpenAPI/Docs Exposed (Informational)

`FastAPI(title="InvenTrack API")` enables `/docs` and `/openapi.json` by default. The server logs confirm they're being accessed. In production, disable them:

```python
app = FastAPI(
    title="InvenTrack API",
    docs_url=None if os.getenv("ENV") == "production" else "/docs",
    redoc_url=None if os.getenv("ENV") == "production" else "/redoc",
)
```

---

## Additional Findings

### 8. Missing Input Validation (Medium)

**File:** [schemas.py](file:///c:/Users/PREDATOR/Desktop/Fullstack/backend/app/schemas.py#L14-L17)

```python
class UserRegister(BaseModel):
    email: str      # ← no email format validation
    password: str   # ← no minimum length
    name: Optional[str] = None
```

| Field | Issue | Recommendation |
|-------|-------|----------------|
| `email` | Accepts any string (e.g., `"x"`) | Use `pydantic.EmailStr` |
| `password` | No length requirement | Add `min_length=8` |
| `status` (ItemCreate) | Accepts any string | Use `Literal["in-stock", "low-stock", "out-of-stock"]` |
| `quantity`, `price`, `cost` | No min value | Add `ge=0` constraint |

### 9. Missing Rate Limiting (Medium)

The `/api/auth/login` and `/api/auth/register` endpoints have no rate limiting. An attacker can brute-force passwords or create unlimited accounts.

**Recommendation:** Add `slowapi` or similar:

```bash
pip install slowapi
```

### 10. No HTTPS Enforcement (Informational)

The app runs on plain HTTP. In production behind a reverse proxy, add:

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])
```

---

## Priority Action Items

| Priority | Action | Finding |
|----------|--------|---------|
| 🔴 **P0** | Create `.gitignore` with `.env` exclusion | 4a |
| 🔴 **P0** | Generate a real JWT secret and update `.env` | 2b, 4d |
| 🔴 **P0** | Check git history — if `.env` was committed, rotate the Render DB password | 4a |
| 🟡 **P1** | Create `.dockerignore` | 4b |
| 🟡 **P1** | Strip exception details from database fallback log | 4c |
| 🟡 **P1** | Validate new `category_id` ownership in `update_item` | 5 (note) |
| 🟡 **P1** | Restrict CORS origins for production | 6a |
| 🟡 **P1** | Add email/password validation in schemas | 8 |
| 🟢 **P2** | Add `"type"` claim to JWTs | 2a |
| 🟢 **P2** | Add rate limiting to auth endpoints | 9 |
| 🟢 **P2** | Add global exception handler with logging | 7a |
| 🟢 **P2** | Disable OpenAPI docs in production | 7c |
| 🟢 **P2** | Fail hard (not fallback to SQLite) in production | 7b |

---

*Report generated from static analysis of the InvenTrack backend codebase.*
