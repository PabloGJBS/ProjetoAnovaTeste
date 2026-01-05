from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.user_repo import UserRepository
from app.repositories.client_repo import ClientRepository
from app.schemas.auth import UserCreate, UserLogin, UserOut
from app.schemas.client import ClientCreate
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
repo = UserRepository()
client_repo = ClientRepository()

@router.post(
    "/register",
    response_model=UserOut,
    status_code=201,
    summary="Register user",
    description="Creates a user and a linked client record.",
    responses={
        201: {"description": "User created"},
        409: {"description": "Email or document already exists"},
        422: {"description": "Validation error"},
    },
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    existing = repo.get_by_email(db, email)
    if existing:
        raise HTTPException(status_code=409, detail="User with this email already exists")
    if client_repo.get_by_email(db, email):
        raise HTTPException(status_code=409, detail="Client with this email already exists")
    if client_repo.get_by_document(db, payload.document):
        raise HTTPException(status_code=409, detail="Client with this document already exists")

    user = repo.create(
        db,
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
        role="user",
    )

    client_repo.create(
        db,
        ClientCreate(name=payload.name, document=payload.document, email=email),
    )

    return user

@router.post(
    "/login",
    response_model=UserOut,
    summary="Login user",
    description="Validates credentials and returns user data.",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error"},
    },
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = repo.get_by_email(db, email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@router.get(
    "/users",
    response_model=list[UserOut],
    summary="List users",
    description="Returns all users registered in the system.",
)
def list_users(db: Session = Depends(get_db)):
    return repo.list(db)
