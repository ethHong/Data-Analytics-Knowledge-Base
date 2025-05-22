import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
import subprocess
import sys
import threading


class MarkdownChangeHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_refresh_time = 0
        self.refresh_lock = threading.Lock()
        self.refresh_timer = None

    def on_any_event(self, event):
        # Skip temporary files and hidden files
        if event.src_path.endswith(".swp") or os.path.basename(
            event.src_path
        ).startswith("."):
            return

        # Only respond to markdown files
        if not event.is_directory and (
            event.src_path.endswith(".md") or "markdowns" in event.src_path
        ):
            print(f"🔍 Detected change in: {event.src_path}")
            print(f"🔄 Event type: {event.event_type}")

            # Debounce - wait a short time before refreshing to avoid multiple refreshes for batch changes
            self._schedule_refresh()

    def _schedule_refresh(self):
        """Schedule a refresh with debouncing to prevent multiple rapid refreshes."""
        with self.refresh_lock:
            # Cancel any pending refresh
            if self.refresh_timer:
                self.refresh_timer.cancel()

            # Schedule a new refresh in 3 seconds
            self.refresh_timer = threading.Timer(3.0, self._do_refresh)
            self.refresh_timer.start()

    def _do_refresh(self):
        """Actually perform the refresh."""
        # Check if enough time has passed since last refresh
        current_time = time.time()
        if current_time - self.last_refresh_time < 5:
            print("⏱️ Skipping refresh - too soon after last refresh")
            return

        print("🔄 Triggering database refresh...")
        try:
            # Use pipenv to ensure correct environment
            result = subprocess.run(
                ["pipenv", "run", "python", "refresh_data.py"],
                capture_output=True,
                text=True,
            )
            print(f"✅ Refresh completed with exit code: {result.returncode}")
            if result.stdout:
                print(f"📝 Output: {result.stdout}")
            if result.stderr:
                print(f"⚠️ Errors: {result.stderr}")

            # Update the last refresh time
            self.last_refresh_time = current_time
        except Exception as e:
            print(f"❌ Error refreshing database: {str(e)}")


def start_watcher():
    """Start the watcher in a background thread."""
    # Path to watch
    markdown_path = "frontend/docs/markdowns"

    # Create observer and handler
    event_handler = MarkdownChangeHandler()
    observer = Observer()

    # Schedule the observer to watch the markdown directory
    observer.schedule(event_handler, markdown_path, recursive=True)

    # Start the observer
    observer.start()
    print(f"👀 Watching for changes in {markdown_path}...")

    return observer


if __name__ == "__main__":
    observer = start_watcher()

    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # Stop the observer gracefully on Ctrl+C
        observer.stop()

    # Wait until the observer finishes
    observer.join()
