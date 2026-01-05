import random
from sqlalchemy import inspect, text
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import engine, SessionLocal
from app.db.models import Base, Client, Allocation, User
from app.repositories.user_repo import UserRepository
from app.services.titles_loader import load_titles

# Demo users configuration
DEMO_USERS = [
    {
        "name": "Gustavo",
        "email": "gustavo@email.com",
        "password": "123456",
        "document": "11111111111",
    },
    {
        "name": "Ana",
        "email": "ana@email.com",
        "password": "123456",
        "document": "22222222222",
    },
    {
        "name": "Maria",
        "email": "maria@email.com",
        "password": "123456",
        "document": "33333333333",
    },
]

def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_clients_columns()
    _ensure_users_table()
    _ensure_demo_users()

def _ensure_clients_columns():
    inspector = inspect(engine)
    if "clients" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("clients")}

    with engine.begin() as conn:
        if "document" not in columns:
            conn.execute(text("ALTER TABLE clients ADD COLUMN document VARCHAR(20)"))
        if "email" not in columns:
            conn.execute(text("ALTER TABLE clients ADD COLUMN email VARCHAR(120)"))
        if "created_at" not in columns:
            conn.execute(text("ALTER TABLE clients ADD COLUMN created_at DATETIME"))

def _ensure_users_table():
    repo = UserRepository()
    db = SessionLocal()
    try:
        admin_email = settings.admin_email.strip().lower()
        existing = repo.get_by_email(db, admin_email)
        admin_hash = hash_password(settings.admin_password)
        if not existing:
            repo.create(
                db,
                name="Admin",
                email=admin_email,
                password_hash=admin_hash,
                role="admin",
            )
            return

        updated = False
        if existing.role != "admin":
            existing.role = "admin"
            updated = True
        if existing.password_hash != admin_hash:
            existing.password_hash = admin_hash
            updated = True
        if existing.name != "Admin":
            existing.name = "Admin"
            updated = True
        if existing.email != admin_email:
            existing.email = admin_email
            updated = True
        if updated:
            db.add(existing)
            db.commit()
    finally:
        db.close()

def _ensure_demo_users():
    """Create demo users with clients and random allocations."""
    db = SessionLocal()
    repo = UserRepository()
    
    try:
        titles = load_titles()
        if not titles:
            # No titles available, skip demo data creation
            return
        
        for demo in DEMO_USERS:
            email = demo["email"].strip().lower()
            
            # Check if user already exists
            existing_user = repo.get_by_email(db, email)
            if existing_user:
                continue
            
            # Create user
            user = repo.create(
                db,
                name=demo["name"],
                email=email,
                password_hash=hash_password(demo["password"]),
                role="user",
            )
            
            # Check if client with this document exists
            existing_client = db.query(Client).filter(Client.document == demo["document"]).first()
            if existing_client:
                client = existing_client
            else:
                # Create client linked to this user
                client = Client(
                    name=demo["name"],
                    document=demo["document"],
                    email=email,
                )
                db.add(client)
                db.commit()
                db.refresh(client)
            
            # Create random allocations (2-5 allocations per user)
            num_allocations = random.randint(2, 5)
            selected_titles = random.sample(titles, min(num_allocations, len(titles)))
            
            for title in selected_titles:
                title_id = title.get("id")
                if not title_id:
                    continue
                
                # Random amount between 10,000 and 500,000
                amount = random.randint(10, 500) * 1000
                
                allocation = Allocation(
                    client_id=client.id,
                    title_id=title_id,
                    amount=amount,
                )
                db.add(allocation)
            
            db.commit()
            
    finally:
        db.close()
