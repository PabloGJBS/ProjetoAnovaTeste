import csv
from pathlib import Path

CSV_PATH = Path("app/data/titles.csv")

def load_titles() -> list[dict]:
    if not CSV_PATH.exists():
        return []
    with CSV_PATH.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        data = []
        for row in reader:
            row["rate"] = float(row["rate"]) if row.get("rate") not in (None, "", "nan") else None
            row["min_application"] = float(row["min_application"]) if row.get("min_application") not in (None, "", "nan") else None
            data.append(row)
        return data
