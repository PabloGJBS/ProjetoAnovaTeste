from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.client_repo import ClientRepository
from app.schemas.client import ClientCreate, ClientOut
from app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/clients", tags=["clients"])
repo = ClientRepository()
user_repo = UserRepository()

@router.post(
    "",
    response_model=ClientOut,
    status_code=201,
    summary="Create client",
    description="Creates a client record.",
    responses={
        201: {"description": "Client created"},
        409: {"description": "Email or document already exists"},
        422: {"description": "Validation error"},
    },
)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    existing = repo.get_by_document(db, payload.document)
    if existing:
        raise HTTPException(status_code=409, detail="Client with this document already exists")
    existing_email = repo.get_by_email(db, payload.email)
    if existing_email:
        raise HTTPException(status_code=409, detail="Client with this email already exists")
    return repo.create(db, payload)

@router.get(
    "",
    response_model=list[ClientOut],
    summary="List clients",
    description="Returns all clients in descending order.",
)
def list_clients(db: Session = Depends(get_db)):
    return repo.list(db)

@router.get(
    "/email/{email}",
    response_model=ClientOut,
    summary="Get client by email",
    description="Returns a single client by email.",
    responses={404: {"description": "Client not found"}},
)
def get_client_by_email(email: str, db: Session = Depends(get_db)):
    client = repo.get_by_email(db, email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.get(
    "/{client_id}",
    response_model=ClientOut,
    summary="Get client by id",
    description="Returns a single client by id.",
    responses={404: {"description": "Client not found"}},
)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = repo.get(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.delete(
    "/{client_id}",
    response_model=dict[str, bool],
    summary="Delete client",
    description="Deletes a client and its linked user (if any).",
    responses={
        200: {"description": "Client deleted"},
        404: {"description": "Client not found"},
        409: {"description": "Cannot delete admin user"},
    },
)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = repo.get(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if client.email:
        user = user_repo.get_by_email(db, client.email)
        if user and user.role == "admin":
            raise HTTPException(status_code=409, detail="Cannot delete admin user")
        if user:
            user_repo.delete(db, user)

    repo.delete(db, client)
    return {"ok": True}
