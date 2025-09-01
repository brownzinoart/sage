import sys
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main_simple import app  # noqa: E402

client = TestClient(app)


def research_enabled() -> bool:
    r = client.get("/api/v1/sage/health")
    if r.status_code != 200:
        return False
    data = r.json()
    return bool(data.get("educational_research"))


def test_sage_health_ok():
    r = client.get("/api/v1/sage/health")
    assert r.status_code == 200
    assert "gemini_available" in r.json()


def test_dosage_endpoint():
    if not research_enabled():
        return  # gracefully skip
    payload = {"compound": "CBD", "condition": "sleep", "experience_level": "new"}
    r = client.post("/api/v1/sage/dosage", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("compound")
    assert data.get("guidelines")


def test_research_endpoint():
    if not research_enabled():
        return
    payload = {"topic": "CBD for sleep", "max_results": 5}
    r = client.post("/api/v1/sage/research", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "research_results" in data
