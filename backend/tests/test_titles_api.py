import csv

import app.services.titles_loader as titles_loader


def _write_titles_csv(path):
    rows = [
        {
            "id": "t1",
            "type": "CDB",
            "issuer": "Banco A",
            "maturity_date": "2026-01-01",
            "indexer": "CDI",
            "rate": "10",
            "rate_text": "",
            "min_application": "1000",
            "rating": "AA",
            "source_sheet": "CSV",
            "imported_at": "2025-01-01T00:00:00",
        },
        {
            "id": "t2",
            "type": "LCA",
            "issuer": "Banco B",
            "maturity_date": "2026-06-01",
            "indexer": "CDI",
            "rate": "11",
            "rate_text": "",
            "min_application": "2000",
            "rating": "A",
            "source_sheet": "CSV",
            "imported_at": "2025-01-01T00:00:00",
        },
    ]

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def test_titles_list_and_grouped(client, tmp_path, monkeypatch):
    csv_path = tmp_path / "titles.csv"
    _write_titles_csv(csv_path)
    monkeypatch.setattr(titles_loader, "CSV_PATH", csv_path)

    resp = client.get("/api/v1/titles")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    resp_filtered = client.get("/api/v1/titles", params={"type": "cdb"})
    assert resp_filtered.status_code == 200
    assert len(resp_filtered.json()) == 1

    resp_grouped = client.get("/api/v1/titles/grouped")
    assert resp_grouped.status_code == 200
    data = resp_grouped.json()
    assert "CDB" in data
    assert "LCA" in data
