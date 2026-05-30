from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, crud
from app.database import engine, get_db
from app.auth import (
    create_access_token,
    get_current_user,
    verify_password,
)

# ── App init ──────────────────────────────────────────────────────────────────

app = FastAPI(title="InvenTrack API")

# CORS middleware MUST be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "InvenTrack API"}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{data.email}' is already registered. Each email address must be unique.",
        )
    user = crud.create_user(db, data)
    token = create_access_token({"sub": user.id})
    return schemas.Token(access_token=token, token_type="bearer")


@app.post("/api/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.id})
    return schemas.Token(access_token=token, token_type="bearer")


@app.get("/api/auth/me", response_model=schemas.UserPublic)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_dashboard_stats(db, current_user.id)


# ── Inventories ───────────────────────────────────────────────────────────────

@app.get("/api/inventories", response_model=List[schemas.InventoryOut])
def list_inventories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_inventories(db, current_user.id)


@app.post("/api/inventories", response_model=schemas.InventoryOut, status_code=status.HTTP_201_CREATED)
def create_inventory(
    data: schemas.InventoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_inventory(db, data, current_user.id)


@app.get("/api/inventories/{inv_id}", response_model=schemas.InventoryOut)
def get_inventory(
    inv_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory {inv_id} not found")
    return inv


@app.put("/api/inventories/{inv_id}", response_model=schemas.InventoryOut)
def update_inventory(
    inv_id: str,
    data: schemas.InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inv = crud.update_inventory(db, inv_id, data, current_user.id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory {inv_id} not found")
    return inv


@app.delete("/api/inventories/{inv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(
    inv_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    deleted = crud.delete_inventory(db, inv_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory {inv_id} not found")


# ── Categories ────────────────────────────────────────────────────────────────

@app.get("/api/inventories/{inv_id}/categories", response_model=List[schemas.CategoryOut])
def list_categories(
    inv_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cats = crud.get_categories(db, inv_id, current_user.id)
    if cats is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory {inv_id} not found")
    return cats


@app.post(
    "/api/inventories/{inv_id}/categories",
    response_model=schemas.CategoryOut,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    inv_id: str,
    data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cat = crud.create_category(db, inv_id, data, current_user.id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Inventory {inv_id} not found")
    return cat


@app.put("/api/inventories/{inv_id}/categories/{cid}", response_model=schemas.CategoryOut)
def update_category(
    inv_id: str,
    cid: str,
    data: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cat = crud.update_category(db, inv_id, cid, data, current_user.id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category {cid} not found in Inventory {inv_id}")
    return cat


@app.delete("/api/inventories/{inv_id}/categories/{cid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    inv_id: str,
    cid: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    deleted = crud.delete_category(db, inv_id, cid, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category {cid} not found in Inventory {inv_id}")


# ── Items ─────────────────────────────────────────────────────────────────────

@app.get("/api/items", response_model=List[schemas.ItemOut])
def list_items(
    cat_id: Optional[str] = None,
    inv_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_items(db, current_user.id, cat_id=cat_id, inv_id=inv_id)


@app.post("/api/items", response_model=schemas.ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(
    data: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = crud.create_item(db, data, current_user.id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {data.category_id} not found",
        )
    return item


@app.get("/api/items/{item_id}", response_model=schemas.ItemOut)
def get_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = crud.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
    return item


@app.put("/api/items/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: str,
    data: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = crud.update_item(db, item_id, data, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
    return item


@app.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    deleted = crud.delete_item(db, item_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
