import os
import time
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

DEBOUNCE_DELAY = 5
refresh_timer = None


class MarkdownChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        global refresh_timer
        if event.src_path.endswith(".md"):
            print(
                f"📄 Detected {event.event_type} in {os.path.basename(event.src_path)} - Scheduling refresh..."
            )

            # Cancel the previous timer and set a new one
            if refresh_timer:
                refresh_timer.cancel()

            refresh_timer = threading.Timer(DEBOUNCE_DELAY, self.full_refresh)
            refresh_timer.start()

    def full_refresh(self):
        print("⚡ Starting full refresh: Comparing directory with Neo4j...")

        try:
            # Run full reset: Compare directory vs Neo4j and update accordingly
            os.system("pipenv run python refresh_data.py")

            # Rebuild MkDocs navigation and regenerate site
            os.system("pipenv run python generate_mkdocs_nav.py")
            os.system("pipenv run mkdocs build -f frontend/mkdocs.yml")

            print("🚀 Successfully refreshed MkDocs and Neo4j!")

        except Exception as e:
            print(f"❌ Error during full refresh: {e}")


# ✅ Main block
if __name__ == "__main__":
    path = "frontend/docs/markdowns/"
    observer = Observer()
    event_handler = MarkdownChangeHandler()
    observer.schedule(event_handler, path, recursive=False)
    observer.start()

    print("👀 Watching for Markdown file changes... Auto-refreshing MkDocs & Neo4j!")
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
