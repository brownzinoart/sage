# Codex Refactor

Refactored, modular layout of the Sage/BudGuide application. This organizes backend, frontend, serverless functions, and shared assets into a single, consistent monorepo that is easier to develop, deploy, and maintain.

Structure
- backend: FastAPI app (cleaned config defaults, unified Sage service)
- frontend: Next.js app (API route targets local functions; env-based API URL supported)
- functions: Netlify functions (moved from netlify/functions; no secrets committed)
- data, migrations, scripts, public, docs: Collocated content used by backend/frontend
- netlify.toml: Uses functions/ directory; remove in-repo secrets
- docker-compose.yml: Local dev for Postgres, Redis, backend, and frontend

Key Improvements
- Unified Sage service: API uses CleanSageService consistently to avoid duplicate logic.
- Safer config defaults: backend/app/core/config.py now has dev-safe defaults so imports don’t fail without .env.
- Stable IDs: chat API ensures valid UUIDs for ProductInfo IDs.
- Serverless consolidation: functions moved to codex_refac/functions and referenced by frontend API route.
- Secrets hygiene: Removed hard-coded GEMINI_API_KEY from Netlify config; use env vars.
- Monorepo: All assets in one place with clear boundaries for deploy targets.
 - Structured logging: Request ID middleware + centralized logging for better observability.
 - Pydantic defaults: Replaced mutable defaults with default_factory for reliability.
 - Config parsing: Robust ALLOWED_ORIGINS parsing and DATA_DIR override for sample data.
- Tests + CI: Added basic API tests and GitHub Actions workflow.
 - Enhanced research: Exposed research tools via MCP server (evidence, dosage, interactions, legal, mechanisms) with graceful fallbacks.

Run Locally
- Backend: uvicorn main_simple:app --host 0.0.0.0 --port 5001 (or main:app at :8000)
- Frontend: cd frontend && npm install && npm run dev
- Docker: docker compose up from codex_refac to run full stack
- Tests: make test (or cd backend && pytest)

Environment
- NEXT_PUBLIC_API_URL: frontend -> backend base URL (default http://localhost:5001)
- GEMINI_API_KEY: required for AI features (configure via env, not netlify.toml)
 - DATA_DIR: optional override for sample data directory

Research Endpoints (API)
- POST `/api/v1/sage/research`: topic → returns aggregated papers with credibility + relevance analysis.
- POST `/api/v1/sage/dosage`: compound + condition → evidence‑based dosage guidelines with safety notes.
- POST `/api/v1/sage/interactions`: compounds[, medications] → FDA‑derived interaction risks and recommendation.
- POST `/api/v1/sage/legal`: location[, product_type, compounds] → jurisdiction legal guidance.
- POST `/api/v1/sage/mechanism`: compound[, target_system, detail_level] → scientific mechanism summary.

Notes
- Research features depend on the embedded MCP educational server. If external sources are unavailable, the system falls back to cached data, terpene knowledge base, and literature‑derived defaults.

Notes
- The enhanced MCP research features remain optional; endpoints guard availability.
- Data loading uses data/*.json via MockDatabase.
