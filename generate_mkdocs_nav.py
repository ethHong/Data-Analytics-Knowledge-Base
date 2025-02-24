import os
import yaml
import re

MKDOCS_CONFIG_PATH = "frontend/mkdocs.yml"
MARKDOWN_DIR = "frontend/docs/markdowns/"  # Stay consistent with backend
INDEX_MD_PATH = "frontend/docs/index.md"  # Ensure Home is placed here


def extract_docs_category(content):
    """Extract category from markdown content."""
    category_match = re.search(
        r"(?:\*\*)?category_specifier(?:\*\*)?\s*:\s*['\"]?([^'\"]+)['\"]?",
        content,
    )
    return category_match.group(1).strip() if category_match else "Uncategorized"


def clean_orphaned_nav(config, markdown_files):
    """Remove nav entries for deleted markdown files."""
    valid_files = {f"markdowns/{file}" for file in markdown_files}

    cleaned_nav = []
    for entry in config.get("nav", []):
        if isinstance(entry, dict):
            for category, items in entry.items():
                if isinstance(items, list):
                    # Filter out missing markdown file references
                    valid_items = [
                        doc for doc in items if list(doc.values())[0] in valid_files
                    ]
                    if valid_items:
                        cleaned_nav.append({category: valid_items})
                else:
                    # Keep non-markdown entries (like Home or Knowledge Graph)
                    if (
                        items in valid_files
                        or items == "index.md"
                        or items == "graph.html"
                    ):
                        cleaned_nav.append({category: items})
        else:
            cleaned_nav.append(entry)
    return cleaned_nav


def update_mkdocs_nav():
    """Update mkdocs.yml with correct document paths."""
    with open(MKDOCS_CONFIG_PATH, "r") as f:
        config = yaml.safe_load(f)

    # Ensure index.md exists in docs
    if not os.path.exists(INDEX_MD_PATH):
        os.system(f"cp frontend/docs/index.md {INDEX_MD_PATH}")

    # Get all Markdown files in `docs/markdowns/`
    markdown_files = [f for f in os.listdir(MARKDOWN_DIR) if f.endswith(".md")]
    markdown_files.sort()

    # Categorize docs
    categories = {}
    for filename in markdown_files:
        filepath = os.path.join(MARKDOWN_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as file:
            content = file.read()
            category = extract_docs_category(content)
            if category not in categories:
                categories[category] = []
            categories[category].append(
                {"📄 " + filename.replace(".md", ""): f"markdowns/{filename}"}
            )

    # Update docs directory
    config["docs_dir"] = "docs"

    # Generate navigation correctly
    config["nav"] = [{"Home": "index.md"}]
    config["nav"].append({"Knowledge Graph": "graph.html"})  # Removed extra whitespace

    for category, docs in sorted(categories.items()):
        config["nav"].append(
            {f"📁{category}": sorted(docs, key=lambda x: list(x.keys())[0])}
        )

    # Clean up orphaned nav entries
    config["nav"] = clean_orphaned_nav(config, markdown_files)

    # Extra scripts and styles
    config["extra_javascript"] = [
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js",
        "https://polyfill.io/v3/polyfill.min.js?features=es6",
        "https://d3js.org/d3.v7.min.js",
        "js/graph.js",
    ]

    config["extra_css"] = ["css/custom.css"]

    config["markdown_extensions"] = [{"pymdownx.arithmatex": {"generic": True}}]

    with open(MKDOCS_CONFIG_PATH, "w") as f:
        yaml.dump(config, f, default_flow_style=False, allow_unicode=True)

    print("✅ Updated mkdocs.yml with latest documents!")


if __name__ == "__main__":
    update_mkdocs_nav()
