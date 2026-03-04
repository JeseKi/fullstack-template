.PHONY: build dev lint test check

setup:
	pip install uv --break-system-packages
	uv venv .venv --python 3.11
	. .venv/bin/activate && uv pip install -r requirements.txt
	npm i -g pnpm
	pnpm i

build:
	pnpm build

compile:
	uv pip compile requirements.in -o requirements.txt

dev:
	python run.py

lint:
	pnpm lint
	ruff check --fix
	mypy .

test:
	python -m pytest . -q

check: lint test
run: build dev
