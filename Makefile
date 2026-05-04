SHELL := /bin/bash

.PHONY: install build test run run-backend run-frontend run-mcp

install:
	npm install
	npm --prefix frontend install
	npm --prefix backend install
	npm --prefix mcp-server install
	$(MAKE) build

build:
	npm --prefix frontend run build

test:
	npm run test:e2e

run:
	@trap 'kill 0' INT TERM EXIT; \
	$(MAKE) run-backend & \
	$(MAKE) run-frontend & \
	$(MAKE) run-mcp & \
	wait

run-backend:
	cd backend && npm run dev

run-frontend:
	cd frontend && npm run dev -- --host --port 3000

run-mcp:
	cd mcp-server && npm run dev
