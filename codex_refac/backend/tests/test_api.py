import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient


# Ensure backend path on sys.path for direct imports
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main_simple import app  # noqa: E402


client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data and "BudGuide" in data["message"]


def test_health():
    r = client.get("/api/v1/health/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"


def test_products_list():
    r = client.get("/api/v1/products/?limit=3")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 3


def test_chat_message():
    payload = {"text": "Looking for sleep help"}
    r = client.post("/api/v1/chat/message", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert "products" in data
