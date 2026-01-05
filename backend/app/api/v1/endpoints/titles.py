from fastapi import APIRouter, Query
from app.services.titles_loader import load_titles
from app.schemas.title import TitleOut

router = APIRouter(prefix="/titles", tags=["titles"])

@router.get(
    "",
    response_model=list[TitleOut],
    summary="List titles",
    description="Returns titles from the CSV catalog. You can filter by type.",
)
def list_titles(type: str | None = Query(None, description="Filter by title type, ex: CDB")):
    data = load_titles()
    if type:
        t = type.strip().upper()
        data = [x for x in data if (x.get("type") or "").strip().upper() == t]
    return data

@router.get(
    "/grouped",
    response_model=dict[str, list[TitleOut]],
    summary="List titles grouped by type",
    description="Returns titles grouped by type key.",
)
def list_titles_grouped():
    data = load_titles()
    grouped: dict[str, list[dict]] = {}
    for item in data:
        key = (item.get("type") or "UNKNOWN").strip().upper()
        grouped.setdefault(key, []).append(item)
    return grouped
