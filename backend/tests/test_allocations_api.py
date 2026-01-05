import csv

import app.services.titles_loader as titles_loader


def _write_titles_csv(path):
    rows = [
        {
            "id": "title-000001",
            "type": "CDB",
            "issuer": "Banco X",
            "maturity_date": "2026-01-01",
            "indexer": "CDI",
            "rate": "10.5",
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


def test_create_allocation_and_portfolio(client, tmp_path, monkeypatch):
    csv_path = tmp_path / "titles.csv"
    _write_titles_csv(csv_path)
    monkeypatch.setattr(titles_loader, "CSV_PATH", csv_path)

    client_payload = {"name": "Carol", "document": "12312312312", "email": "carol@example.com"}
    create_client = client.post("/api/v1/clients", json=client_payload)
    assert create_client.status_code == 201
    client_id = create_client.json()["id"]

    payload = {
        "client_id": client_id,
        "title_id": "title-000001",
        "amount": 1500.0,
    }
    resp = client.post("/api/v1/allocations", json=payload)
    assert resp.status_code == 201

    list_resp = client.get(f"/api/v1/allocations/client/{client_id}")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    portfolio_resp = client.get(f"/api/v1/allocations/client/{client_id}/portfolio")
    assert portfolio_resp.status_code == 200
    items = portfolio_resp.json()["items"]
    assert items[0]["title"]["id"] == "title-000001"


def test_allocation_title_not_found(client):
    client_payload = {"name": "Dan", "document": "32132132132", "email": "dan@example.com"}
    create_client = client.post("/api/v1/clients", json=client_payload)
    assert create_client.status_code == 201
    client_id = create_client.json()["id"]

    payload = {"client_id": client_id, "title_id": "missing-0001", "amount": 100.0}
    resp = client.post("/api/v1/allocations", json=payload)
    assert resp.status_code == 404
