from fastapi import FastAPI, UploadFile, File, HTTPException
import os
from neo4j import GraphDatabase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()  # Initialize APP

# CORS middleware : avoid browser blocking request to API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allow requests from any domain (use specific URLs for production)
    allow_credentials=True,  # Allow cookies, authorization headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Connect to neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "sh96699669"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


# Define API andpoint - document list
# # Call function when requests GET / documents/
@app.get("/documents/")
def get_all_documents():
    with driver.session() as session:
        result = session.run("MATCH (d: Document) RETURN d.title AS title")
        return {"documents": [record["title"] for record in result]}


# Define API endpoint - document content
@app.get("/documents/{title}")
def get_content(title: str):
    with driver.session() as session:
        result = session.run(
            "MATCH (d: Document {title: $title}) RETURN d.content AS content",
            title=title,
        )

        record = result.single()  # Only get single doc
        if record:
            return {"title": title, "content": record["content"]}
        else:
            return {"error": "Document not found"}


# Define API endpoint - get related documents
@app.get("/documents/{title}/related")
def get_related_documents(title: str):
    with driver.session() as session:

        result = session.run(
            "MATCH (d: Document {title: $title}) -[:RELATED_TO] -> (related: Document) RETURN related.title as related_titles",
            title=title,
        )

        return {
            "title": title,
            "related_documents": [record["related_titles"] for record in result],
        }


# Add upload feature
UPLOAD_DIR = "docs/markdowns/"


# API endpoint for uploading markdown files
@app.post("/upload/")
async def upload_markdown(file: UploadFile = File(...)):
    # async: let server handle multiple requests at the same time
    # File(...): required parameter
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # run regresh script
        os.system("pipenv run python refresh_data.py")
        return {
            "message": "File uploaded and updated DB successfully",
            "filename": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API Endpoint for graph
@app.get("/graph/")
def get_graph_data():
    with driver.session() as session:
        # First get all nodes
        nodes_result = session.run(
            """
            MATCH (d:Document)
            RETURN d.title AS title, d.category AS category
            """
        )
        
        # Then get all relationships
        links_result = session.run(
            """
            MATCH (d:Document)-[r:RELATED_TO]->(other:Document)
            RETURN d.title AS source, d.category AS source_category,
                   other.title AS target, other.category AS target_category
            """
        )

        # Create nodes dictionary
        nodes = {}
        for record in nodes_result:
            nodes[record["title"]] = {
                "id": record["title"],
                "category": record["category"],
            }

        # Create links list
        links = []
        for record in links_result:
            links.append({
                "source": record["source"],
                "target": record["target"]
            })

        node_list = list(nodes.values())
        return {"nodes": node_list, "links": links}


# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
