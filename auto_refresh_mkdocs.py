import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class MarkdownChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        """Detect changes in markdown files and refresh both MkDocs and Neo4j."""
        if event.src_path.endswith(".md") and event.event_type in [
            "created",
            "deleted",
            "modified",
        ]:
            print(
                "📄 Markdown files changed! Updating navigation & restarting MkDocs & refreshing DB..."
            )

            # Sync with Neo4j (important for adding/removing documents)
            os.system("pipenv run python refresh_data.py")

            # Update navigation for MkDocs
            os.system("pipenv run python generate_mkdocs_nav.py")

            # Refresh MkDocs site
            os.system("pipenv run mkdocs build -f frontend/mkdocs.yml")


if __name__ == "__main__":
    path = "frontend/docs/markdowns/"
    event_handler = MarkdownChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=False)
    observer.start()

    print("👀 Watching for Markdown file changes... Auto-refreshing MkDocs & Neo4j!")
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
