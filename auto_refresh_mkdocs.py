import os
import time
import threading
import hashlib
from pathlib import Path

DEBOUNCE_DELAY = 5
CHECK_INTERVAL = 2
refresh_timer = None


class ContentWatcher:
    def __init__(self, watch_path):
        self.watch_path = Path(watch_path)
        self.previous_state = self._get_current_state()
        self.should_watch = True

    def _get_file_hash(self, file_path):
        try:
            with open(file_path, "rb") as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception:
            return None

    def _get_current_state(self):
        """Get current hash state of all markdown files"""
        state = {}
        for file_path in self.watch_path.glob("*.md"):
            state[str(file_path)] = self._get_file_hash(file_path)
        return state

    def _has_real_changes(self):
        current_state = self._get_current_state()

        # Check for deleted files
        deleted = set(self.previous_state.keys()) - set(current_state.keys())
        if deleted:
            print(f"📄 Deleted files: {[os.path.basename(f) for f in deleted]}")
            return True

        # Check for new files
        added = set(current_state.keys()) - set(self.previous_state.keys())
        if added:
            print(f"📄 New files: {[os.path.basename(f) for f in added]}")
            return True

        # Check for modified content
        for file_path in current_state:
            old_hash = self.previous_state.get(file_path)
            new_hash = current_state[file_path]
            if old_hash != new_hash:
                print(f"📄 Modified file: {os.path.basename(file_path)}")
                return True

        return False

    def watch(self):
        global refresh_timer

        while True:
            if self.should_watch and self._has_real_changes():
                print("⚡ Changes detected - Scheduling sync...")

                if refresh_timer:
                    refresh_timer.cancel()

                # Pause watching while syncing
                self.should_watch = False
                refresh_timer = threading.Timer(DEBOUNCE_DELAY, self._sync_and_resume)
                refresh_timer.start()

            time.sleep(CHECK_INTERVAL)

    def _sync_and_resume(self):
        self.sync_with_neo4j()
        self.previous_state = self._get_current_state()
        self.should_watch = True

    def sync_with_neo4j(self):
        print("⚡ Starting sync with Neo4j...")

        try:
            os.system("pipenv run python frontend/copy_markdowns.py")
            os.system("pipenv run python refresh_data.py")
            os.system("pipenv run python generate_mkdocs_nav.py")
            os.system("pipenv run mkdocs build -f frontend/mkdocs.yml")
            print("🚀 Successfully synced with Neo4j and MkDocs!")

        except Exception as e:
            print(f"❌ Error during sync: {e}")

    def stop(self):
        self.should_watch = False


# ✅ Main block
if __name__ == "__main__":
    path = "frontend/content/markdowns/"
    watcher = ContentWatcher(path)

    print("👀 Watching for Markdown file changes... Auto-syncing with Neo4j & MkDocs!")

    watch_thread = threading.Thread(target=watcher.watch)
    watch_thread.start()

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        watcher.stop()
        print("\n👋 Stopping file watcher...")
