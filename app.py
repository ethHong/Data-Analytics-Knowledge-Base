from fastapi import FastAPI, UploadFile, File, HTTPException
import os
from neo4j import GraphDatabase
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List, Optional
import json

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


# Define API endpoint for document management
@app.get("/api/documents")
def get_documents_for_management():
    with driver.session() as session:
        result = session.run(
            """
            MATCH (d:Document)
            RETURN d.title AS title, d.category AS category, d.content AS content
        """
        )
        documents = []
        for record in result:
            doc = {
                "title": record["title"],
                "path": f"docs/{record['title'].lower().replace(' ', '-')}.md",
                "category": (
                    record["category"] if record["category"] else "Uncategorized"
                ),
            }
            documents.append(doc)
        return {"documents": documents}


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
            links.append({"source": record["source"], "target": record["target"]})

        node_list = list(nodes.values())
        return {"nodes": node_list, "links": links}


class Document(BaseModel):
    path: str
    title: str


class ContributorBase(BaseModel):
    name: str
    organization: str
    linkedin: Optional[str] = None
    image: Optional[str] = None


class ContributorCreate(ContributorBase):
    id: str


class ContributorUpdate(ContributorBase):
    pass


class Contributor(ContributorBase):
    id: str
    contributions: List[Document] = []


class ContributionUpdate(BaseModel):
    contributions: List[Document]


# Update the path to contributors.json - use one consistent location
CONTRIBUTORS_FILE = os.path.join("frontend", "docs", "data", "contributors.json")

# Ensure the data directory exists
os.makedirs(os.path.dirname(CONTRIBUTORS_FILE), exist_ok=True)


def read_contributors():
    """Helper function to read contributors data"""
    try:
        with open(CONTRIBUTORS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading contributors: {e}")
        return {"contributors": []}


def write_contributors(data):
    """Helper function to write contributors data"""
    try:
        os.makedirs(os.path.dirname(CONTRIBUTORS_FILE), exist_ok=True)
        with open(CONTRIBUTORS_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error writing contributors: {e}")
        return False


# Get all contributors
@app.get("/api/contributors", response_model=dict)
async def get_all_contributors():
    try:
        return read_contributors()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read contributors")


# Get single contributor
@app.get("/api/contributors/{contributor_id}", response_model=Contributor)
async def get_contributor(contributor_id: str):
    try:
        data = read_contributors()
        contributor = next(
            (c for c in data["contributors"] if c["id"] == contributor_id), None
        )

        if not contributor:
            raise HTTPException(status_code=404, detail="Contributor not found")

        return contributor
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read contributor")


# Create new contributor
@app.post("/api/contributors", response_model=Contributor)
async def create_contributor(contributor: ContributorCreate):
    try:
        data = read_contributors()

        # Check if ID already exists
        if any(c["id"] == contributor.id for c in data["contributors"]):
            raise HTTPException(status_code=400, detail="Contributor ID already exists")

        new_contributor = {**contributor.dict(), "contributions": []}

        data["contributors"].append(new_contributor)
        if not write_contributors(data):
            raise HTTPException(status_code=500, detail="Failed to save contributor")

        return new_contributor
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create contributor")


# Update contributor info
@app.put("/api/contributors/{contributor_id}", response_model=Contributor)
async def update_contributor_info(contributor_id: str, contributor: ContributorUpdate):
    try:
        data = read_contributors()
        contributor_index = next(
            (
                i
                for i, c in enumerate(data["contributors"])
                if c["id"] == contributor_id
            ),
            -1,
        )

        if contributor_index == -1:
            raise HTTPException(status_code=404, detail="Contributor not found")

        # Preserve contributions when updating info
        contributions = data["contributors"][contributor_index]["contributions"]
        updated_contributor = {
            **contributor.dict(),
            "id": contributor_id,
            "contributions": contributions,
        }

        data["contributors"][contributor_index] = updated_contributor
        if not write_contributors(data):
            raise HTTPException(status_code=500, detail="Failed to save contributor")

        return updated_contributor
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update contributor")


# Update contributor contributions
@app.put("/api/contributors/{contributor_id}/contributions", response_model=Contributor)
async def update_contributor_contributions(
    contributor_id: str, contribution_data: ContributionUpdate
):
    try:
        data = read_contributors()
        contributor_index = next(
            (
                i
                for i, c in enumerate(data["contributors"])
                if c["id"] == contributor_id
            ),
            -1,
        )

        if contributor_index == -1:
            raise HTTPException(status_code=404, detail="Contributor not found")

        # Update only the contributions field
        data["contributors"][contributor_index]["contributions"] = [
            doc.dict() for doc in contribution_data.contributions
        ]

        if not write_contributors(data):
            raise HTTPException(status_code=500, detail="Failed to save contributions")

        return data["contributors"][contributor_index]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update contributions")


# Delete contributor
@app.delete("/api/contributors/{contributor_id}")
async def delete_contributor(contributor_id: str):
    try:
        data = read_contributors()
        contributor_index = next(
            (
                i
                for i, c in enumerate(data["contributors"])
                if c["id"] == contributor_id
            ),
            -1,
        )

        if contributor_index == -1:
            raise HTTPException(status_code=404, detail="Contributor not found")

        data["contributors"].pop(contributor_index)
        if not write_contributors(data):
            raise HTTPException(status_code=500, detail="Failed to save changes")

        return {"status": "success"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete contributor")


# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
