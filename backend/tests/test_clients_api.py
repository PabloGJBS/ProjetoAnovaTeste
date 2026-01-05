def test_create_and_get_client(client):
    payload = {"name": "Alice", "document": "12345678900", "email": "alice@example.com"}
    resp = client.post("/api/v1/clients", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == payload["name"]
    assert data["document"] == payload["document"]

    get_resp = client.get(f"/api/v1/clients/{data['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["document"] == payload["document"]

    list_resp = client.get("/api/v1/clients")
    assert list_resp.status_code == 200
    assert any(c["id"] == data["id"] for c in list_resp.json())

    email_resp = client.get(f"/api/v1/clients/email/{payload['email']}")
    assert email_resp.status_code == 200
    assert email_resp.json()["id"] == data["id"]


def test_duplicate_document(client):
    payload = {"name": "Bob", "document": "99999999999", "email": "bob@example.com"}
    resp1 = client.post("/api/v1/clients", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/clients", json=payload)
    assert resp2.status_code == 409
