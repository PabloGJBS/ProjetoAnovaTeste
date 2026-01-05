from sqlalchemy.orm import Session
from app.db.models import Client
from app.schemas.client import ClientCreate

class ClientRepository:
    def create(self, db: Session, data: ClientCreate) -> Client:
        client = Client(name=data.name, document=data.document, email=data.email)
        db.add(client)
        db.commit()
        db.refresh(client)
        return client

    def get(self, db: Session, client_id: int) -> Client | None:
        return db.query(Client).filter(Client.id == client_id).first()

    def get_by_document(self, db: Session, document: str) -> Client | None:
        return db.query(Client).filter(Client.document == document).first()

    def get_by_email(self, db: Session, email: str) -> Client | None:
        return db.query(Client).filter(Client.email == email).first()

    def list(self, db: Session) -> list[Client]:
        return db.query(Client).order_by(Client.id.desc()).all()

    def delete(self, db: Session, client: Client) -> None:
        db.delete(client)
        db.commit()
