import csv

import app.services.titles_loader as titles_loader
from app.repositories.client_repo import ClientRepository
from app.repositories.allocation_repo import AllocationRepository
from app.schemas.client import ClientCreate
from app.schemas.allocation import AllocationCreate
from app.services.title_catalog import title_exists, get_title_by_id


def _write_titles_csv(path):
    rows = [
        {
            "id": "srv-1",
            "type": "CDB",
            "issuer": "Banco Z",
            "maturity_date": "2026-01-01",
            "indexer": "CDI",
            "rate": "10.0",
            "rate_text": "",
            "min_application": "1000",
            "rating": "AA",
            "source_sheet": "CSV",
            "imported_at": "2025-01-01T00:00:00",
        }
    ]

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def test_client_and_allocation_repos(db):
    client_repo = ClientRepository()
    allocation_repo = AllocationRepository()

    client = client_repo.create(
        db, ClientCreate(name="Eva", document="00011122233", email="eva@example.com")
    )
    fetched = client_repo.get(db, client.id)
    assert fetched is not None

    alloc = allocation_repo.create(
        db, AllocationCreate(client_id=client.id, title_id="title-000001", amount=500.0)
    )
    listed = allocation_repo.list_by_client(db, client.id)
    assert listed[0].id == alloc.id


def test_title_catalog(tmp_path, monkeypatch):
    csv_path = tmp_path / "titles.csv"
    _write_titles_csv(csv_path)
    monkeypatch.setattr(titles_loader, "CSV_PATH", csv_path)

    assert title_exists("srv-1") is True
    assert get_title_by_id("srv-1")["issuer"] == "Banco Z"
    assert title_exists("missing") is False
