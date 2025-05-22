#!/bin/bash

LOG_DIR="logs"
mkdir -p $LOG_DIR

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Starting server...${RESET}"
echo -e "${YELLOW}Log directory: $LOG_DIR${RESET}"

# Start Neo4j

# --- Step 1: Fix Neo4j permissions ---
echo -e "${BLUE}Fixing Neo4j permissions...${RESET}"
sudo chown -R neo4j:neo4j /var/log/neo4j /var/lib/neo4j /etc/neo4j
sudo chmod 755 /var/log/neo4j

# Create log files if not exist and set permissions
for file in debug.log http.log query.log security.log; do
    sudo touch /var/log/neo4j/$file
    sudo chown neo4j:neo4j /var/log/neo4j/$file
done

# --- Step 2: Start Neo4j ---
neo4j start 2>&1 | tee -a $LOG_DIR/neo4j.log &
echo -e "${GREEN}[✓] Neo4j started${RESET}"

# Start FastAPI
pipenv run uvicorn app:app --reload --host 0.0.0.0 --port 8000 2>&1 | tee -a $LOG_DIR/fastapi.log &
echo -e "${GREEN}[✓] FastAPI started${RESET}"

# Generate MkDocs navigation
pipenv run python generate_mkdocs_nav.py 2>&1 | tee -a $LOG_DIR/mkdocs_nav.log &
echo -e "${GREEN}[✓] MkDocs navigation generated${RESET}"

# Copy assets
pipenv run python frontend/copy_assets.py 2>&1 | tee -a $LOG_DIR/assets_copy.log &
echo -e "${GREEN}[✓] Assets copied to site directory${RESET}"

# Auto-refresh MkDocs
pipenv run python auto_refresh_mkdocs.py 2>&1 | tee -a $LOG_DIR/mkdocs_refresh.log &
echo -e "${GREEN}[✓] MkDocs auto-refresh started${RESET}"

# MkDocs build
pipenv run mkdocs build -f frontend/mkdocs.yml 2>&1 | tee -a $LOG_DIR/mkdocs_build.log &
echo -e "${GREEN}[✓] MkDocs build started${RESET}"

# MkDocs server
echo -e "${BLUE}Starting MkDocs server...${RESET}"
pipenv run mkdocs serve -f frontend/mkdocs.yml --dev-addr=0.0.0.0:8080 2>&1 | tee -a $LOG_DIR/mkdocs_serve.log
