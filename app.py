from fastapi import FastAPI, UploadFile, File, HTTPException
import os
from neo4j import GraphDatabase
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List, Optional
import json
from fastapi import status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

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

# Base directory configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRIBUTORS_FILE = os.path.join(
    BASE_DIR, "frontend", "docs", "data", "contributors.json"
)
USERS_FILE = os.path.join(BASE_DIR, "frontend", "data", "users.json")
VERIFICATION_CODES_FILE = os.path.join(
    BASE_DIR, "frontend", "data", "verification_codes.json"
)


# User models and authentication
class UserBase(BaseModel):
    email: str
    role: Optional[str] = None
    is_verified: Optional[bool] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class VerificationCode(BaseModel):
    email: str
    code: str


class LoginData(BaseModel):
    email: str
    password: str


# Authentication configuration
SECRET_KEY = "your-secret-key"  # Replace with your actual secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


# Authentication helper functions
def write_users(data):
    with open(USERS_FILE, "w") as f:
        json.dump(data, f, indent=4)


def read_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def write_verification_codes(data):
    with open(VERIFICATION_CODES_FILE, "w") as f:
        json.dump(data, f, indent=4)


def read_verification_codes():
    if not os.path.exists(VERIFICATION_CODES_FILE):
        return []
    with open(VERIFICATION_CODES_FILE, "r") as f:
        return json.load(f)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(email: str):
    users = read_users()
    return next((user for user in users if user["email"] == email), None)


def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return User(**user)


# Define API endpoint - document list
@app.get("/documents/")
async def get_all_documents(current_user: User = Depends(get_current_user)):
    with driver.session() as session:
        result = session.run("MATCH (d: Document) RETURN d.title AS title")
        return {"documents": [record["title"] for record in result]}


# Define API endpoint for document management
@app.get("/api/documents")
async def get_documents_for_management(current_user: User = Depends(get_current_user)):
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
                "path": f"docs/{record['title']}.md",
                "category": (
                    record["category"] if record["category"] else "Uncategorized"
                ),
            }
            documents.append(doc)
        return {"documents": documents}


# Define API endpoint - document content
@app.get("/documents/{title}")
async def get_content(title: str, current_user: User = Depends(get_current_user)):
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
async def get_related_documents(
    title: str, current_user: User = Depends(get_current_user)
):
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
async def get_graph_data(current_user: User = Depends(get_current_user)):
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


def write_contributors(data):
    """Helper function to write contributors data"""
    try:
        print(f"Attempting to write to: {CONTRIBUTORS_FILE}")
        print(f"Directory exists: {os.path.exists(os.path.dirname(CONTRIBUTORS_FILE))}")
        print(f"File exists: {os.path.exists(CONTRIBUTORS_FILE)}")

        os.makedirs(os.path.dirname(CONTRIBUTORS_FILE), exist_ok=True)
        with open(CONTRIBUTORS_FILE, "w") as f:
            json.dump(data, f, indent=4)
            print(f"Successfully wrote data to {CONTRIBUTORS_FILE}")
        return True
    except Exception as e:
        print(f"Error writing contributors: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        return False


def read_contributors():
    """Helper function to read contributors data"""
    try:
        print(f"Attempting to read from: {CONTRIBUTORS_FILE}")
        with open(CONTRIBUTORS_FILE, "r") as f:
            data = json.load(f)
            print(f"Successfully read data from {CONTRIBUTORS_FILE}")
            return data
    except Exception as e:
        print(f"Error reading contributors: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        return {"contributors": []}


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


# Authentication endpoints
@app.post("/api/auth/register", response_model=User)
async def register(user: UserCreate):
    users_data = read_users()
    if any(u["email"] == user.email for u in users_data.get("users", [])):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = get_password_hash(user.password)
    users_data.setdefault("users", []).append(user_dict)

    if write_users(users_data):
        return User(**user_dict)
    raise HTTPException(status_code=500, detail="Failed to register user")


@app.post("/api/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user or isinstance(user, bool):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/auth/logout")
async def logout():
    # Since we're using JWT tokens, we don't need to do anything server-side
    # The client should remove the token
    return {"message": "Successfully logged out"}


@app.get("/api/auth/check")
async def check_auth(current_user: User = Depends(get_current_user)):
    return {"authenticated": True, "user": current_user}


# User management endpoints
@app.get("/api/users")
async def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return read_users()


@app.post("/api/users")
async def create_user(user: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users_data = read_users()
    if any(u["email"] == user.email for u in users_data.get("users", [])):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = get_password_hash(user.password)
    user_dict["is_verified"] = True
    users_data.setdefault("users", []).append(user_dict)

    if write_users(users_data):
        return User(**user_dict)
    raise HTTPException(status_code=500, detail="Failed to create user")


@app.put("/api/users/{user_id}")
async def update_user(
    user_id: str, user_update: UserBase, current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users_data = read_users()
    user_index = next(
        (i for i, u in enumerate(users_data["users"]) if u["id"] == user_id), -1
    )

    if user_index == -1:
        raise HTTPException(status_code=404, detail="User not found")

    # Only update fields that are provided
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    users_data["users"][user_index].update(update_data)

    if write_users(users_data):
        return User(**users_data["users"][user_index])
    raise HTTPException(status_code=500, detail="Failed to update user")


@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users_data = read_users()
    user_index = next(
        (i for i, u in enumerate(users_data["users"]) if u["id"] == user_id), -1
    )

    if user_index == -1:
        raise HTTPException(status_code=404, detail="User not found")

    users_data["users"].pop(user_index)

    if write_users(users_data):
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to delete user")


# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
