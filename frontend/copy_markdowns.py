# frontend/copy_markdowns.py
import os
import shutil
from pathlib import Path

SRC = Path("frontend/content/markdowns")
DST = Path("frontend/docs/markdowns")

# Create destination if needed
DST.mkdir(parents=True, exist_ok=True)

# Clear existing .md files
for file in DST.glob("*.md"):
    file.unlink()

# Copy all markdowns from source
for file in SRC.glob("*.md"):
    shutil.copy(file, DST)

print("✅ Markdown files copied to docs/markdowns/")
