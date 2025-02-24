from neo4j import GraphDatabase
import os
import re
import threading

# Connect to Neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "sh96699669"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


# Helper function to sanitize filenames for titles
def sanitize_title(filename):
    return re.sub(r"[^A-Za-z\s]", "", filename.replace(".md", "")).strip()


# Function to perform a single refresh after batch changes
def schedule_refresh():
    if not hasattr(schedule_refresh, "timer"):
        schedule_refresh.timer = None

    if schedule_refresh.timer:
        schedule_refresh.timer.cancel()

    schedule_refresh.timer = threading.Timer(
        5.0, full_sync
    )  # Wait 5 seconds after the last change
    schedule_refresh.timer.start()


# Full sync function for the database
def full_sync():
    print("🚀 Starting full sync with markdown directory...")
    markdown_dir = "frontend/docs/markdowns/"
    existing_files = {
        sanitize_title(f): os.path.join(markdown_dir, f)
        for f in os.listdir(markdown_dir)
        if f.endswith(".md")
    }

    with driver.session() as session:
        result = session.run("MATCH (d:Document) RETURN d.title AS title")
        db_titles = {record["title"] for record in result}
        print(f"🗄️ Existing DB nodes before sync: {db_titles}")
        print(f"📂 Current files in directory: {set(existing_files.keys())}")

        if not existing_files:
            session.run("MATCH (d:Document) DETACH DELETE d")
            print("🗑️ All documents deleted as directory is empty.")
        else:
            titles_to_delete = db_titles - set(existing_files.keys())
            for title in titles_to_delete:
                session.run(
                    "MATCH (d:Document {title: $title}) DETACH DELETE d", title=title
                )
                print(f"❌ Deleted node for title: {title}")

            for title, filepath in existing_files.items():
                with open(filepath, "r", encoding="utf-8") as file:
                    content = file.read()
                    category_match = re.search(
                        r"(?:\*\*)?category_specifier(?:\*\*)?\s*:\s*['\"]?([^'\"]+)['\"]?",
                        content,
                    )
                    category = (
                        category_match.group(1).strip()
                        if category_match
                        else "Uncategorized"
                    )

                    session.run(
                        "MERGE (d:Document {title: $title}) SET d.content = $content, d.category = $category",
                        title=title,
                        content=content,
                        category=category,
                    )
                    print(f"✅ Synced document: {title}")

        remove_duplicates()
        update_relationships_for_all()
        print("🔄 Sync complete.")


# Remove duplicate nodes based on title
def remove_duplicates():
    with driver.session() as session:
        session.run(
            "MATCH (d:Document) WITH d.title AS title, COLLECT(d) AS nodes WHERE SIZE(nodes) > 1 "
            "FOREACH (n IN TAIL(nodes) | DETACH DELETE n)"
        )
        print("🗑️ Removed duplicate nodes.")


# Update relationships for all documents
def update_relationships_for_all():
    with driver.session() as session:
        result = session.run("MATCH (d:Document) RETURN d.title AS title")
        titles = [record["title"] for record in result]

        for title in titles:
            session.run(
                "MATCH (d:Document {title: $title})-[r:RELATED_TO]->() DELETE r",
                title=title,
            )
            content_result = session.run(
                "MATCH (d:Document {title: $title}) RETURN d.content AS content",
                title=title,
            )
            record = content_result.single()
            if record and record["content"]:
                content = record["content"]
                for other_title in titles:
                    if other_title in content and other_title != title:
                        session.run(
                            "MATCH (a:Document {title: $title}), (b:Document {title: $other_title}) "
                            "MERGE (a)-[:RELATED_TO]->(b)",
                            title=title,
                            other_title=other_title,
                        )
        print("🔗 Updated relationships for all documents.")


# MAIN EXECUTION
if __name__ == "__main__":
    full_sync()
