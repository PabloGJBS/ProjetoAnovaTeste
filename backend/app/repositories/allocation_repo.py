from sqlalchemy.orm import Session
from app.db.models import Allocation
from app.schemas.allocation import AllocationCreate

class AllocationRepository:
    def create(self, db: Session, data: AllocationCreate) -> Allocation:
        alloc = Allocation(
            client_id=data.client_id,
            title_id=data.title_id,
            amount=data.amount,
        )
        db.add(alloc)
        db.commit()
        db.refresh(alloc)
        return alloc

    def list_by_client(self, db: Session, client_id: int) -> list[Allocation]:
        return (
            db.query(Allocation)
            .filter(Allocation.client_id == client_id)
            .order_by(Allocation.id.desc())
            .all()
        )
