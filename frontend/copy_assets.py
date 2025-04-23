import os
import shutil
from pathlib import Path

# Copy JS files from docs to site
SRC_JS = Path("frontend/docs/js")
DST_JS = Path("frontend/site/js")

# Create destination directories if needed
DST_JS.mkdir(parents=True, exist_ok=True)

# Copy all JS files
for file in SRC_JS.glob("*.js"):
    print(f"Copying {file} to {DST_JS}")
    shutil.copy(file, DST_JS)

print("✅ JS files copied to site/js/")
