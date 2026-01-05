from __future__ import annotations

import csv
import io
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

CSV_PATH = Path("app/data/titles.csv")
CSV_PATH.parent.mkdir(parents=True, exist_ok=True)


OUT_COLUMNS = [
    "id",
    "type",
    "issuer",
    "maturity_date",
    "indexer",
    "rate",
    "rate_text",
    "min_application",
    "rating",
    "source_sheet",
    "imported_at",
]

def _to_date_str(value: Any) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)) or pd.isna(value):
        return ""
    try:
        return pd.to_datetime(value).date().isoformat()
    except Exception:
        return ""

def _clean_str(v: Any) -> str:
    if v is None or (isinstance(v, float) and pd.isna(v)) or pd.isna(v):
        return ""
    return str(v).strip()

def _to_float(v: Any) -> float | None:
    if v is None or (isinstance(v, float) and pd.isna(v)) or pd.isna(v):
        return None

    s = str(v).strip()
    if not s:
        return None


    s = s.replace("R$", "").strip()


    s = s.replace(".", "").replace(",", ".") if re.search(r"\d+,\d+", s) else s


    m = re.search(r"(-?\d+(\.\d+)?)", s)
    if not m:
        return None
    try:
        return float(m.group(1))
    except Exception:
        return None

def _parse_rate_text(rate_text: str) -> tuple[float | None, str]:
    t = rate_text.upper().replace(" ", "")

    m = re.match(r"(\d+(\.\d+)?)%CDI", t)
    if m:
        return float(m.group(1)), "CDI"

    m = re.match(r"CDI\+(\d+(\.\d+)?)%", t)
    if m:
        return float(m.group(1)), "CDI+"

    m = re.match(r"IPCA\+(\d+(\.\d+)?)%", t)
    if m:
        return float(m.group(1)), "IPCA+"

    m = re.match(r"PRE\+(\d+(\.\d+)?)%", t)
    if m:
        return float(m.group(1)), "PRE+"

    return None, ""

def _normalize_from_credito_bancario(xls: pd.ExcelFile) -> pd.DataFrame:

    df = pd.read_excel(xls, sheet_name="Crédito bancário", header=5)

    needed = ["Emissor", "Produto", "Vencimento", "Indexador", "Tx. Portal", "Aplicação mínima", "Rating"]
    for c in needed:
        if c not in df.columns:

            return pd.DataFrame(columns=OUT_COLUMNS)

    df = df.dropna(subset=["Emissor", "Produto"])

    out = pd.DataFrame({
        "type": df["Produto"].map(_clean_str),
        "issuer": df["Emissor"].map(_clean_str),
        "maturity_date": df["Vencimento"].apply(_to_date_str),
        "indexer": df["Indexador"].map(_clean_str),
        "rate": pd.to_numeric(df["Tx. Portal"], errors="coerce"),
        "rate_text": "",
        "min_application": df["Aplicação mínima"].apply(_to_float),
        "rating": df["Rating"].map(_clean_str),
        "source_sheet": "Crédito bancário",
    })
    return out

def _normalize_from_liq_diaria(xls: pd.ExcelFile) -> pd.DataFrame:

    df = pd.read_excel(xls, sheet_name="Liq. diária", header=3)

    needed = ["EMISSOR", "PRODUTO", "VENCIMENTO", "INDEXADOR", "TX. PORTAL", "APLICAÇÃO MÍNIMA", "RATING"]
    for c in needed:
        if c not in df.columns:
            return pd.DataFrame(columns=OUT_COLUMNS)

    df = df.dropna(subset=["EMISSOR", "PRODUTO"])

    out = pd.DataFrame({
        "type": df["PRODUTO"].map(_clean_str),
        "issuer": df["EMISSOR"].map(_clean_str),
        "maturity_date": df["VENCIMENTO"].apply(_to_date_str),
        "indexer": df["INDEXADOR"].map(_clean_str),
        "rate": pd.to_numeric(df["TX. PORTAL"], errors="coerce"),
        "rate_text": "",
        "min_application": df["APLICAÇÃO MÍNIMA"].apply(_to_float),
        "rating": df["RATING"].map(_clean_str),
        "source_sheet": "Liq. diária",
    })
    return out

def _normalize_from_dpges(xls: pd.ExcelFile) -> pd.DataFrame:

    df = pd.read_excel(xls, sheet_name="DPGEs", header=2)

    needed = ["Emissor", "Prazo (dias)", "Taxa Cliente", "Aplicação Mínima", "Rating"]
    for c in needed:
        if c not in df.columns:
            return pd.DataFrame(columns=OUT_COLUMNS)

    df = df.dropna(subset=["Emissor", "Taxa Cliente"])


    rate_text = df["Taxa Cliente"].map(_clean_str)
    parsed = rate_text.apply(_parse_rate_text)

    out = pd.DataFrame({
        "type": "DPGE",
        "issuer": df["Emissor"].map(_clean_str),
        "maturity_date": "",
        "indexer": parsed.apply(lambda x: x[1]),
        "rate": parsed.apply(lambda x: x[0]),
        "rate_text": rate_text,
        "min_application": df["Aplicação Mínima"].apply(_to_float),
        "rating": df["Rating"].map(_clean_str),
        "source_sheet": "DPGEs",
    })
    return out

def _normalize_from_titulos_publicos(xls: pd.ExcelFile) -> pd.DataFrame:

    df = pd.read_excel(xls, sheet_name="Títulos Públicos", header=4)

    if "Título" not in df.columns or "Vencimento" not in df.columns:
        return pd.DataFrame(columns=OUT_COLUMNS)


    rate_col = None
    for c in df.columns:
        if isinstance(c, str) and "Taxa do portal" in c:
            rate_col = c
            break

    df = df.dropna(subset=["Título", "Vencimento"])

    out = pd.DataFrame({
        "type": df["Título"].map(_clean_str),
        "issuer": "Tesouro Nacional",
        "maturity_date": df["Vencimento"].apply(_to_date_str),
        "indexer": "",
        "rate": pd.to_numeric(df[rate_col], errors="coerce") if rate_col else None,
        "rate_text": "",
        "min_application": None,
        "rating": "",
        "source_sheet": "Títulos Públicos",
    })
    return out

def excel_to_normalized_df(file_bytes: bytes) -> pd.DataFrame:
    xls = pd.ExcelFile(io.BytesIO(file_bytes), engine="openpyxl")

    frames = []

    if "Crédito bancário" in xls.sheet_names:
        frames.append(_normalize_from_credito_bancario(xls))

    if "Liq. diária" in xls.sheet_names:
        frames.append(_normalize_from_liq_diaria(xls))

    if "DPGEs" in xls.sheet_names:
        frames.append(_normalize_from_dpges(xls))

    if "Títulos Públicos" in xls.sheet_names:
        frames.append(_normalize_from_titulos_publicos(xls))

    if not frames:
        return pd.DataFrame(columns=OUT_COLUMNS)

    df = pd.concat(frames, ignore_index=True)

    imported_at = datetime.now(timezone.utc).isoformat()
    df.insert(0, "id", [uuid.uuid4().hex for _ in range(len(df))])
    df["imported_at"] = imported_at


    for c in OUT_COLUMNS:
        if c not in df.columns:
            df[c] = ""

    return df[OUT_COLUMNS]

def save_normalized_csv(df: pd.DataFrame) -> int:
    df.to_csv(CSV_PATH, index=False)
    return len(df)

def save_csv_uploaded(file_bytes: bytes) -> int:

    text = file_bytes.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    required = {"type", "issuer", "maturity_date", "rate"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise ValueError(f"CSV inválido. Precisa conter colunas: {sorted(required)}")

    rows = []
    imported_at = datetime.now(timezone.utc).isoformat()
    for r in reader:
        rows.append({
            "id": uuid.uuid4().hex,
            "type": _clean_str(r.get("type")),
            "issuer": _clean_str(r.get("issuer")),
            "maturity_date": _clean_str(r.get("maturity_date")),
            "indexer": _clean_str(r.get("indexer", "")),
            "rate": _to_float(r.get("rate")),
            "rate_text": _clean_str(r.get("rate_text", "")),
            "min_application": _to_float(r.get("min_application")),
            "rating": _clean_str(r.get("rating", "")),
            "source_sheet": _clean_str(r.get("source_sheet", "CSV")),
            "imported_at": imported_at,
        })

    df = pd.DataFrame(rows, columns=OUT_COLUMNS)
    df.to_csv(CSV_PATH, index=False)
    return len(df)
