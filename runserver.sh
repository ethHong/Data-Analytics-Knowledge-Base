#!/bin/bash

echo "Starting server..."
LOG_DIR="logs"
mkdir -p $LOG_DIR

echo "Log directory: $LOG_DIR"

# Start Neo4j in the background
neo4j start > $LOG_DIR/neo4j.log 2>&1 &

echo "Neo4j started"

# Start FastAPI with Uvicorn in the background
pipenv run uvicorn app:app --reload --host 0.0.0.0 --port 8000 > $LOG_DIR/fastapi.log 2>&1 &

echo "FastAPI started"

# Generate MkDocs navigation in the background
pipenv run python generate_mkdocs_nav.py > $LOG_DIR/mkdocs_nav.log 2>&1 &

echo "MkDocs navigation generated"

# Auto-refresh MkDocs in the background
pipenv run python auto_refresh_mkdocs.py > $LOG_DIR/mkdocs_refresh.log 2>&1 &

echo "MkDocs auto-refresh started"

# Initialize mkdocs (build only)
pipenv run mkdocs build -f frontend/mkdocs.yml > $LOG_DIR/mkdocs_build.log 2>&1 &

echo "MkDocs build started"

echo "Starting MkDocs server"
# Start MkDocs server (this is foreground task)
pipenv run mkdocs serve -f frontend/mkdocs.yml --dev-addr=0.0.0.0:8080 > $LOG_DIR/mkdocs_serve.log 2>&1


