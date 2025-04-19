import os
import time
import threading
from pathlib import Path
from datetime import datetime

DEBOUNCE_DELAY = 5
CHECK_INTERVAL = 2
refresh_timer = None


class ContentWatcher:
    def __init__(self, watch_path):
        self.watch_path = Path(watch_path)
        self.previous_state = self._get_current_state()
        self.should_watch = True
        self.last_sync_time = datetime.now()

    def _get_current_state(self):
        """Get current state of all markdown files using modification times"""
        state = {}
        try:
            for file_path in self.watch_path.glob("*.md"):
                mtime = os.path.getmtime(file_path)
                state[str(file_path)] = mtime
        except Exception as e:
            print(f"Error reading directory: {e}")
        return state

    def _has_changes(self):
        """Check if any files have been modified since last sync"""
        current_state = self._get_current_state()

        # Check for deleted files
        deleted = set(self.previous_state.keys()) - set(current_state.keys())
        if deleted:
            print(
                f"📄 Detected deleted files: {[os.path.basename(f) for f in deleted]}"
            )
            return True

        # Check for new files
        added = set(current_state.keys()) - set(self.previous_state.keys())
        if added:
            print(f"📄 Detected new files: {[os.path.basename(f) for f in added]}")
            return True

        # Check for modified files
        for file_path, current_mtime in current_state.items():
            if file_path in self.previous_state:
                if current_mtime > self.last_sync_time.timestamp():
                    print(f"📄 Detected modified file: {os.path.basename(file_path)}")
                    return True

        return False

    def watch(self):
        global refresh_timer

        while True:
            if self.should_watch and self._has_changes():
                print("⚡ Changes detected - Scheduling sync...")

                if refresh_timer:
                    refresh_timer.cancel()

                # Pause detection during sync
                self.should_watch = False

                refresh_timer = threading.Timer(DEBOUNCE_DELAY, self._sync_and_resume)
                refresh_timer.start()

            time.sleep(CHECK_INTERVAL)

    def _sync_and_resume(self):
        """Perform sync and resume watching"""
        self.sync_with_neo4j()

        # Resume watching
        self.previous_state = self._get_current_state()
        self.last_sync_time = datetime.now()
        self.should_watch = True

    def sync_with_neo4j(self):
        """Sync changes with Neo4j"""
        print("⚡ Starting sync with Neo4j...")

        try:
            # Run sync operations
            os.system("pipenv run python refresh_data.py")
            os.system("pipenv run python generate_mkdocs_nav.py")
            os.system("pipenv run mkdocs build -f frontend/mkdocs.yml")
            print("🚀 Successfully synced with Neo4j!")

        except Exception as e:
            print(f"❌ Error during sync: {e}")

    def stop(self):
        self.should_watch = False


# ✅ Main block
if __name__ == "__main__":
    path = "frontend/docs/markdowns/"
    watcher = ContentWatcher(path)

    print("👀 Watching for Markdown file changes... Auto-syncing with Neo4j!")

    watch_thread = threading.Thread(target=watcher.watch)
    watch_thread.start()

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        watcher.stop()
        print("\n👋 Stopping file watcher...")
