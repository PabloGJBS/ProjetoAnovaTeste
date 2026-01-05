from app.services.titles_loader import load_titles

def title_exists(title_id: str) -> bool:

    titles = load_titles()
    return any(t.get("id") == title_id for t in titles)

def get_title_by_id(title_id: str) -> dict | None:
    titles = load_titles()
    for t in titles:
        if t.get("id") == title_id:
            return t
    return None
