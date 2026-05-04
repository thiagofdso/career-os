SHELL := /bin/bash

.PHONY: install build test run run-backend run-frontend run-mcp

install:
	npm install
	npm run build

build:
	npm run build

test:
	npm test

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
