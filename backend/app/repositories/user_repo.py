from sqlalchemy.orm import Session
from app.db.models import User

class UserRepository:
    model = User

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, name: str, email: str, password_hash: str, role: str) -> User:
        user = User(name=name, email=email, password_hash=password_hash, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def list(self, db: Session) -> list[User]:
        return db.query(User).order_by(User.id.desc()).all()

    def delete(self, db: Session, user: User) -> None:
        db.delete(user)
        db.commit()
