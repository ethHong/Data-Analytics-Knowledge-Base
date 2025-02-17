import os
import yaml

MKDOCS_CONFIG_PATH = "frontend/mkdocs.yml"
MARKDOWN_DIR = "docs/markdowns/"  # Stay consistent with backend
INDEX_MD_PATH = "docs/index.md"  # Ensure Home is placed here


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

    # Update docs directory
    config["docs_dir"] = "../docs"  # Make sure it's consistent

    # Generate navigation correctly
    config["nav"] = [
        {"Home": "index.md"},
        {
            "Documents": [
                {"📄 " + f.replace(".md", ""): f"markdowns/{f}"} for f in markdown_files
            ]
        },
    ]

    config["extra_javascript"] = [
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js",
        "https://polyfill.io/v3/polyfill.min.js?features=es6",
    ]

    config["markdown_extensions"] = [{"pymdownx.arithmatex": {"generic": True}}]

    with open(MKDOCS_CONFIG_PATH, "w") as f:
        yaml.dump(config, f, default_flow_style=False, allow_unicode=True)

    print("✅ Updated mkdocs.yml with latest documents!")


if __name__ == "__main__":
    update_mkdocs_nav()
