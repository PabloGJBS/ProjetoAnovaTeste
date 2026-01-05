import csv
import io

import pandas as pd

import app.services.titles_importer as titles_importer


def test_import_titles_csv(client, tmp_path, monkeypatch):
    csv_path = tmp_path / "titles.csv"
    monkeypatch.setattr(titles_importer, "CSV_PATH", csv_path)

    payload = (
        "type,issuer,maturity_date,rate\n"
        "CDB,Banco X,2026-01-01,10.5\n"
        "LCA,Banco Y,2027-01-01,11.2\n"
    )

    files = {"file": ("titles.csv", payload, "text/csv")}
    headers = {"X-ADMIN-KEY": "carecaBrilhosa"}
    resp = client.post("/api/v1/import/titles", files=files, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["titles_count"] == 2

    with csv_path.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == 2


def test_import_titles_xlsx(client, tmp_path, monkeypatch):
    csv_path = tmp_path / "titles.csv"
    monkeypatch.setattr(titles_importer, "CSV_PATH", csv_path)

    df = pd.DataFrame(
        [
            {
                "Emissor": "Banco X",
                "Produto": "CDB",
                "Vencimento": "2026-01-01",
                "Indexador": "CDI",
                "Tx. Portal": 10.5,
                "Aplicação mínima": 1000,
                "Rating": "AA",
            }
        ]
    )

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Crédito bancário", index=False, startrow=5)

    files = {"file": ("titles.xlsx", buffer.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    headers = {"X-ADMIN-KEY": "carecaBrilhosa"}
    resp = client.post("/api/v1/import/titles", files=files, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["titles_count"] == 1

    with csv_path.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == 1


def test_import_titles_invalid_extension(client):
    files = {"file": ("titles.txt", "data", "text/plain")}
    headers = {"X-ADMIN-KEY": "carecaBrilhosa"}
    resp = client.post("/api/v1/import/titles", files=files, headers=headers)
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert detail["error"] == "invalid_extension"
    assert detail["filename"] == "titles.txt"


def test_import_titles_empty_file(client):
    files = {"file": ("titles.csv", b"", "text/csv")}
    headers = {"X-ADMIN-KEY": "carecaBrilhosa"}
    resp = client.post("/api/v1/import/titles", files=files, headers=headers)
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert detail["error"] == "empty_file"
    assert detail["filename"] == "titles.csv"
