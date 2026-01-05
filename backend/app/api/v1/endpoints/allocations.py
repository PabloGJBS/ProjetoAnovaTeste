from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.models import Allocation, Client
from app.db.session import get_db
from app.repositories.client_repo import ClientRepository
from app.repositories.allocation_repo import AllocationRepository
from app.schemas.allocation import (
    AllocationCreate,
    AllocationOut,
    PortfolioOut,
    RecentAllocationOut,
)
from app.services.title_catalog import title_exists, get_title_by_id

router = APIRouter(prefix="/allocations", tags=["allocations"])
client_repo = ClientRepository()
alloc_repo = AllocationRepository()

@router.post(
    "",
    response_model=AllocationOut,
    status_code=201,
    summary="Create allocation",
    description="Registers an allocation for a client and title.",
    responses={
        201: {"description": "Allocation created"},
        404: {"description": "Client or title not found"},
        422: {"description": "Validation error"},
    },
)
def create_allocation(payload: AllocationCreate, db: Session = Depends(get_db)):
    client = client_repo.get(db, payload.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if not title_exists(payload.title_id):
        raise HTTPException(status_code=404, detail="Title not found in catalog (CSV). Import titles first.")

    return alloc_repo.create(db, payload)

@router.get(
    "/client/{client_id}",
    response_model=list[AllocationOut],
    summary="List allocations by client",
    description="Returns all allocations for a client.",
    responses={404: {"description": "Client not found"}},
)
def list_allocations_by_client(client_id: int, db: Session = Depends(get_db)):
    client = client_repo.get(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return alloc_repo.list_by_client(db, client_id)

@router.get(
    "/client/{client_id}/portfolio",
    response_model=PortfolioOut,
    summary="Get client portfolio",
    description="Returns allocations enriched with title data.",
    responses={404: {"description": "Client not found"}},
)
def portfolio(client_id: int, db: Session = Depends(get_db)):
    client = client_repo.get(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    allocs = alloc_repo.list_by_client(db, client_id)


    out = []
    for a in allocs:
        title = get_title_by_id(a.title_id)
        out.append({
            "allocation_id": a.id,
            "amount": a.amount,
            "created_at": a.created_at,
            "title": title,
        })
    return {"client_id": client_id, "items": out}

@router.get(
    "/recent",
    response_model=list[RecentAllocationOut],
    summary="List recent allocations",
    description="Returns the most recent allocations with client and title info.",
)
def recent_allocations(
    limit: int = Query(20, ge=1, le=100, description="Max number of records"),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Allocation, Client)
        .join(Client, Allocation.client_id == Client.id)
        .order_by(Allocation.id.desc())
        .limit(limit)
        .all()
    )

    out = []
    for alloc, client in rows:
        title = get_title_by_id(alloc.title_id)
        out.append(
            {
                "allocation_id": alloc.id,
                "amount": alloc.amount,
                "created_at": alloc.created_at,
                "client": {
                    "id": client.id,
                    "name": client.name,
                    "document": client.document,
                    "email": client.email,
                },
                "title": title,
            }
        )
    return out
