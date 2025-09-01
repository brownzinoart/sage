PY = python

.PHONY: install dev test lint format run-backend run-frontend

install:
	cd backend && $(PY) -m pip install --upgrade pip && pip install -r requirements.txt

dev:
	cd backend && pip install -r requirements-dev.txt

test:
	cd backend && pytest -q

run-backend:
	cd backend && uvicorn main_simple:app --host 0.0.0.0 --port 5001

run-frontend:
	cd frontend && npm install && npm run dev

.PHONY: dev-all stop-all status logs

dev-all:
	mkdir -p .logs .pids
	# Backend
	cd backend && nohup uvicorn main_simple:app --host 0.0.0.0 --port 5001 > ../.logs/backend.log 2>&1 & echo $$! > ../.pids/backend.pid
	# Frontend
	cd frontend && NEXT_PUBLIC_API_URL=http://localhost:5001 nohup npm run dev > ../.logs/frontend.log 2>&1 & echo $$! > ../.pids/frontend.pid
	@echo "Started. Backend PID=$$(cat .pids/backend.pid), Frontend PID=$$(cat .pids/frontend.pid)"

stop-all:
	-@[ -f .pids/backend.pid ] && kill $$(cat .pids/backend.pid) 2>/dev/null || true
	-@[ -f .pids/frontend.pid ] && kill $$(cat .pids/frontend.pid) 2>/dev/null || true
	@echo "Stopped (if running)."

status:
	@echo "Backend PID:"; [ -f .pids/backend.pid ] && cat .pids/backend.pid || echo "not started"
	@echo "Frontend PID:"; [ -f .pids/frontend.pid ] && cat .pids/frontend.pid || echo "not started"

logs:
	@echo "=== Backend (tail -n 50) ==="; [ -f .logs/backend.log ] && tail -n 50 .logs/backend.log || echo "no backend log"
	@echo "=== Frontend (tail -n 50) ==="; [ -f .logs/frontend.log ] && tail -n 50 .logs/frontend.log || echo "no frontend log"
