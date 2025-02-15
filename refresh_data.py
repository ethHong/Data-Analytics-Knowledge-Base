from neo4j import GraphDatabase
import os

# Connect on Neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "sh96699669"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


# Loading markdown


def load_markdown_to_neo4j():
    markdown_dir = "docs/markdowns/"
    with driver.session() as session:

        result = session.run("MATCH (d:Document) RETURN d.title AS title")
        stored_titles = {record["title"] for record in result}
        current_files = {
            filename.replace(".markdown", "")
            for filename in os.listdir(markdown_dir)
            if filename.endswith(".markdown")
        }

        for title in stored_titles - current_files:  # Files removed from directory
            session.run(
                "MATCH (d:Document {title: $title}) DETACH DELETE d", title=title
            )

        for filename in os.listdir(markdown_dir):
            if filename.endswith(".markdown"):
                filepath = os.path.join(markdown_dir, filename)
                with open(filepath, "r", encoding="utf-8") as file:
                    content = file.read()
                    title = filename.replace(".markdown", "")
                    # Run Neo4j query to add markdown content
                    session.run(
                        "MERGE (d:Document {title: $title}) "  # Create node if not exists
                        "SET d.content = $content",  # Set content property
                        title=title,
                        content=content,
                    )


# Scan docs and create relationships
def update_relationships():
    with driver.session() as session:
        # Get all document titles
        result = session.run("MATCH (d:Document) RETURN d.title AS title")
        titles = [record["title"] for record in result]

        for title in titles:
            # Remove all existing relationships for this document
            session.run(
                "MATCH (d:Document {title: $title})-[r:RELATED_TO]->() DELETE r",
                title=title,
            )

            # Retrieve the content of the document
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


load_markdown_to_neo4j()
update_relationships()
