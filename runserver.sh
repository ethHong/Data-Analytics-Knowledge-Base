#!/bin/bash

# Start Neo4j in the background
neo4j start &

# Start FastAPI with Uvicorn in the background
#pipenv run uvicorn app:app --reload --port 8000 &
pipenv run uvicorn app:app --reload --host 0.0.0.0 --port 8000 &

# Generate MkDocs navigation in the background
pipenv run python generate_mkdocs_nav.py &

# Auto-refresh MkDocs in the background
pipenv run python auto_refresh_mkdocs.py &

# Initialize mkdocs
pipenv run mkdocs build -f frontend/mkdocs.yml &

# Start MkDocs server
#pipenv run mkdocs serve -f frontend/mkdocs.yml --dev-addr=127.0.0.1:8080
pipenv run mkdocs serve -f frontend/mkdocs.yml --dev-addr=0.0.0.0:8080