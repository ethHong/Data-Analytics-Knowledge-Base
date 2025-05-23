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
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

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
    is_verified: Optional[bool] = False


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
        return {"users": []}
    with open(USERS_FILE, "r") as f:
        data = json.load(f)
        # Ensure we always return a dictionary with a "users" key
        if isinstance(data, list):
            return {"users": data}
        return data


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
    users_data = read_users()
    return next(
        (user for user in users_data.get("users", []) if user["email"] == email), None
    )


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
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    with driver.session() as session:
        result = session.run("MATCH (d: Document) RETURN d.title AS title")
        return {"documents": [record["title"] for record in result]}


# Define API endpoint for document management
@app.get("/api/documents")
async def get_documents_for_management(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
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
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
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
UPLOAD_DIR = "frontend/docs/markdowns/"


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


# API endpoint for deleting markdown files
@app.delete("/delete_markdown/{filename}")
async def delete_markdown(filename: str):
    file_path = os.path.join("frontend/docs/markdowns", filename)
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        # Delete the file
        os.remove(file_path)

        # Run refresh script to update the graph
        os.system("pipenv run python refresh_data.py")

        return {
            "message": "File deleted and graph updated successfully",
            "filename": filename,
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# API Endpoint for graph - make it public
@app.get("/graph/")
async def get_graph_data():  # Remove authentication requirement
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
    contributions: Optional[List[Document]] = None


class Contributor(ContributorBase):
    id: str
    contributions: List[Document] = []


class ContributionUpdate(BaseModel):
    contributions: List[Document]


# Initialize a global variable to track file modified time
CONTRIBUTORS_LAST_MODIFIED = 0


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

        # Update the last modified time
        global CONTRIBUTORS_LAST_MODIFIED
        CONTRIBUTORS_LAST_MODIFIED = os.path.getmtime(CONTRIBUTORS_FILE)
        return True
    except Exception as e:
        print(f"Error writing contributors: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        return False


def read_contributors():
    """Helper function to read contributors data with no caching"""
    global CONTRIBUTORS_LAST_MODIFIED

    try:
        print(f"Attempting to read from: {CONTRIBUTORS_FILE}")

        # Check if the file exists
        if not os.path.exists(CONTRIBUTORS_FILE):
            print(f"Contributors file does not exist at {CONTRIBUTORS_FILE}")
            return {"contributors": []}

        # Check if the file has been modified
        current_mtime = os.path.getmtime(CONTRIBUTORS_FILE)
        if current_mtime > CONTRIBUTORS_LAST_MODIFIED:
            print(
                f"File modified since last read. Last: {CONTRIBUTORS_LAST_MODIFIED}, Current: {current_mtime}"
            )
            CONTRIBUTORS_LAST_MODIFIED = current_mtime

        # Always read directly from file
        with open(CONTRIBUTORS_FILE, "r") as f:
            data = json.load(f)
            print(
                f"Successfully read data from {CONTRIBUTORS_FILE}, size: {len(json.dumps(data))} bytes"
            )

            # Double check data structure
            if "contributors" not in data:
                print("WARNING: 'contributors' key missing in data, adding empty list")
                data["contributors"] = []

            return data
    except Exception as e:
        print(f"Error reading contributors: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        return {"contributors": []}


# Get all contributors - public access
@app.get("/api/contributors", response_model=dict)
async def get_all_contributors():
    try:
        return read_contributors()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read contributors")


# Get single contributor - public access
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


# Create new contributor - admin only
@app.post("/api/contributors", response_model=Contributor)
async def create_contributor(
    contributor: ContributorCreate, current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
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


# Update contributor info - admin only
@app.put("/api/contributors/{contributor_id}", response_model=Contributor)
async def update_contributor_info(
    contributor_id: str,
    contributor: ContributorUpdate,
    current_user: User = Depends(get_current_user),
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
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

        # Check if contributions are being updated
        contributor_dict = contributor.dict(exclude_unset=True)
        if "contributions" not in contributor_dict:
            # Preserve existing contributions when not updating them
            print("Preserving existing contributions")
            contributor_dict["contributions"] = data["contributors"][contributor_index][
                "contributions"
            ]
        else:
            print(f"Updating contributions to: {contributor_dict['contributions']}")

        # Add the ID to the updated contributor
        contributor_dict["id"] = contributor_id

        # Update the contributor in the data
        data["contributors"][contributor_index] = contributor_dict

        # Write the updated data
        if not write_contributors(data):
            raise HTTPException(status_code=500, detail="Failed to save contributor")

        return contributor_dict
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating contributor: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update contributor: {str(e)}"
        )


# Delete contributor - admin only
@app.delete("/api/contributors/{contributor_id}")
async def delete_contributor(
    contributor_id: str, current_user: User = Depends(get_current_user)
):
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
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
    user_dict["is_verified"] = False
    users_data.setdefault("users", []).append(user_dict)

    if write_users(users_data):
        return User(**user_dict)
    raise HTTPException(status_code=500, detail="Failed to create user")


@app.post("/api/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
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


# Add a new endpoint to update user verification status
@app.put("/api/users/{user_id}/verify")
async def update_user_verification(
    user_id: str, is_verified: bool, current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users_data = read_users()
    user_index = next(
        (i for i, u in enumerate(users_data["users"]) if u["id"] == user_id), -1
    )

    if user_index == -1:
        raise HTTPException(status_code=404, detail="User not found")

    users_data["users"][user_index]["is_verified"] = is_verified

    if write_users(users_data):
        return {"status": "success", "is_verified": is_verified}
    raise HTTPException(
        status_code=500, detail="Failed to update user verification status"
    )


# Create a custom static files handler that blocks markdown access
class CustomStaticFiles(StaticFiles):
    async def __call__(self, scope, receive, send):
        path = scope["path"]
        # Check if this is a markdown path - if so, we'll handle it separately
        if path.startswith("/markdowns/"):
            # Return a 404 response to let the dedicated endpoint handle it
            from starlette.responses import PlainTextResponse

            response = PlainTextResponse("Not Found", status_code=404)
            await response(scope, receive, send)
            return
        return await super().__call__(scope, receive, send)


# Public markdown serving (no authentication required)
@app.get("/markdowns/{path:path}")
async def serve_markdown(path: str):
    """Serve markdown files without authentication"""
    # Handle both with and without trailing slash
    if path.endswith("/"):
        path = path[:-1]

    # Replace %20 with spaces if present in the URL
    path = path.replace("%20", " ")

    # Try with various extensions or no extension
    possible_paths = [
        os.path.join("frontend/docs/markdowns", path),
        os.path.join("frontend/docs/markdowns", path + ".md"),
        os.path.join("frontend/docs/markdowns", f"{path}.md"),
        os.path.join("frontend/docs/markdowns", path, "index.md"),
    ]

    # Debug: List all available files
    print(f"Looking for markdown: {path}")
    all_files = os.listdir("frontend/docs/markdowns")
    print(f"Available markdown files: {all_files}")

    # Try each possible path
    for file_path in possible_paths:
        print(f"Trying path: {file_path}")
        if os.path.exists(file_path) and os.path.isfile(file_path):
            print(f"Serving markdown file from: {file_path}")
            return FileResponse(file_path)

    # Try direct matching with the files we have
    for file in all_files:
        if file.lower() == f"{path.lower()}.md" or file.lower() == path.lower():
            file_path = os.path.join("frontend/docs/markdowns", file)
            print(f"Found by direct matching: {file_path}")
            return FileResponse(file_path)

    # If we got here, no file was found
    print(f"Markdown file not found for path: {path}")
    print(f"Tried paths: {possible_paths}")
    raise HTTPException(status_code=404, detail="Markdown file not found")


# Authentication middleware
class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only admin paths need authentication now
        if "/admin/" in request.url.path:
            # Get the token from the request headers or cookies
            token = None
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

            # If no token, redirect to login
            if not token:
                return RedirectResponse(url="/auth/login.html", status_code=302)

            # Verify token
            try:
                jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            except:
                return RedirectResponse(url="/auth/login.html", status_code=302)

        response = await call_next(request)
        return response


# Add the middleware (only once)
app.add_middleware(AuthMiddleware)

# Mount static directories (only once for each)
app.mount("/js", StaticFiles(directory="frontend/docs/js"), name="js")
app.mount("/css", StaticFiles(directory="frontend/docs/css"), name="css")
app.mount("/images", StaticFiles(directory="frontend/docs/images"), name="images")
app.mount("/auth", StaticFiles(directory="frontend/docs/auth"), name="auth")
app.mount("/admin", StaticFiles(directory="frontend/docs/admin"), name="admin")
app.mount("/data", StaticFiles(directory="frontend/docs/data"), name="data")


# Serve specific HTML files
@app.get("/")
async def serve_index():
    return FileResponse("frontend/docs/index.html")


@app.get("/contributors")
async def serve_contributors():
    return FileResponse("frontend/docs/contributors.html")


@app.get("/graph")
async def serve_graph():
    return FileResponse("frontend/docs/graph.html")


@app.get("/document-viewer")
async def serve_document_viewer():
    return FileResponse("frontend/docs/document-viewer.html")


# Mount the root directory AFTER all specific routes
# This ensures the specific routes take precedence
app.mount("/", CustomStaticFiles(directory="frontend/docs", html=True), name="root")


# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn

    # Start the markdown file watcher in the background
    try:
        from watch_markdown_changes import start_watcher

        observer = start_watcher()
        print("📁 Started markdown file watcher in the background")
    except Exception as e:
        print(f"⚠️ Warning: Could not start markdown file watcher: {str(e)}")

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)


# Add admin API endpoint for direct file update
@app.post("/api/admin/updateContributors")
async def update_contributors_file(
    data: dict, current_user: User = Depends(get_current_user)
):
    """Admin endpoint to directly update the contributors file with detailed logging."""
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    try:
        # Log everything for debugging
        print(f"Admin update request received")
        print(f"Current contributors file path: {CONTRIBUTORS_FILE}")

        # Read the existing data first
        contributors_data = read_contributors()

        # Find the contributor to update
        if "contributorId" not in data:
            raise HTTPException(status_code=400, detail="Missing contributorId")

        contributor_id = data["contributorId"]
        print(f"Updating contributor with ID: {contributor_id}")

        # Find the contributor index
        contributor_index = -1
        for i, contributor in enumerate(contributors_data["contributors"]):
            if contributor["id"] == contributor_id:
                contributor_index = i
                break

        if contributor_index == -1:
            raise HTTPException(status_code=404, detail="Contributor not found")

        # Update the contributions
        if "contributions" in data:
            contributors_data["contributors"][contributor_index]["contributions"] = (
                data["contributions"]
            )
            print(f"Updated contributions for contributor {contributor_id}")

        # Write to both possible locations to ensure consistency
        success = write_contributors(contributors_data)

        # Also try to write to the potential frontend/data location
        alternate_path = os.path.join(BASE_DIR, "frontend", "data", "contributors.json")
        try:
            print(f"Also writing to alternate path: {alternate_path}")
            os.makedirs(os.path.dirname(alternate_path), exist_ok=True)
            with open(alternate_path, "w") as f:
                json.dump(contributors_data, f, indent=4)
                print(f"Successfully wrote data to alternate path")
        except Exception as e:
            print(f"Warning: Could not write to alternate path: {str(e)}")
            # Continue as this is just a backup attempt

        if success:
            return {"status": "success", "message": "Contributors file updated"}
        else:
            raise HTTPException(
                status_code=500, detail="Failed to update contributors file"
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in admin update: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update contributors: {str(e)}"
        )


# Add specific endpoint for contributions update
@app.put("/api/contributors/{contributor_id}/contributions")
async def update_contributor_contributions(
    contributor_id: str,
    contributions_data: ContributionUpdate,
    current_user: User = Depends(get_current_user),
):
    """Special endpoint just for updating a contributor's contributions."""
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    try:
        print(f"Updating contributions for contributor: {contributor_id}")
        print(f"Received contributions data: {contributions_data}")

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

        # Update only contributions, preserving all other fields
        data["contributors"][contributor_index][
            "contributions"
        ] = contributions_data.contributions
        print(f"Updated contributions for {contributor_id}")

        # Write to both locations
        main_success = write_contributors(data)

        # Also try to write to the alternate location
        alternate_path = os.path.join(BASE_DIR, "frontend", "data", "contributors.json")
        alt_success = False
        try:
            print(f"Also writing to alternate path: {alternate_path}")
            os.makedirs(os.path.dirname(alternate_path), exist_ok=True)
            with open(alternate_path, "w") as f:
                json.dump(data, f, indent=4)
                print(f"Successfully wrote data to alternate path")
            alt_success = True
        except Exception as e:
            print(f"Warning: Could not write to alternate path: {str(e)}")
            # Continue as this is just a backup attempt

        if not main_success and not alt_success:
            raise HTTPException(
                status_code=500, detail="Failed to save contributions to any location"
            )

        # Return the full contributor object with updated contributions
        return data["contributors"][contributor_index]
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating contributions: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update contributions: {str(e)}"
        )


# Add a direct debug endpoint to modify the file with forced reload
@app.post("/api/debug/update_contributor")
async def debug_update_contributor(
    data: dict, current_user: User = Depends(get_current_user)
):
    """Debug endpoint to directly modify contributors file with detailed logging and force reload."""
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    try:
        # Require contributorId and contributions
        if "contributorId" not in data or "contributions" not in data:
            raise HTTPException(
                status_code=400, detail="Missing contributorId or contributions"
            )

        contributor_id = data["contributorId"]
        contributions = data["contributions"]

        print(f"DEBUG: Starting direct update for contributor {contributor_id}")

        # Force reload the contributors file
        try:
            with open(CONTRIBUTORS_FILE, "r") as f:
                contributors_data = json.load(f)
                print(
                    f"DEBUG: Read contributors file directly, size: {len(json.dumps(contributors_data))} bytes"
                )
        except Exception as e:
            print(f"DEBUG: Error reading contributors file: {str(e)}")
            contributors_data = {"contributors": []}

        # Find the contributor to update
        contributor_index = -1
        for i, contributor in enumerate(contributors_data.get("contributors", [])):
            if contributor.get("id") == contributor_id:
                contributor_index = i
                break

        if contributor_index == -1:
            raise HTTPException(status_code=404, detail="Contributor not found")

        # Update the contributions
        print(
            f"DEBUG: Before update: {contributors_data['contributors'][contributor_index].get('contributions', [])}"
        )
        contributors_data["contributors"][contributor_index][
            "contributions"
        ] = contributions
        print(
            f"DEBUG: After update: {contributors_data['contributors'][contributor_index]['contributions']}"
        )

        # Write to both possible locations with detailed logging
        os.makedirs(os.path.dirname(CONTRIBUTORS_FILE), exist_ok=True)
        try:
            with open(CONTRIBUTORS_FILE, "w") as f:
                json.dump(contributors_data, f, indent=4)
                print(
                    f"DEBUG: Successfully wrote {len(json.dumps(contributors_data))} bytes to {CONTRIBUTORS_FILE}"
                )
        except Exception as e:
            print(f"DEBUG: Error writing to main file: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to write to main file: {str(e)}"
            )

        # Also try the alternate location
        alternate_path = os.path.join(BASE_DIR, "frontend", "data", "contributors.json")
        try:
            os.makedirs(os.path.dirname(alternate_path), exist_ok=True)
            with open(alternate_path, "w") as f:
                json.dump(contributors_data, f, indent=4)
                print(f"DEBUG: Successfully wrote to alternate path {alternate_path}")
        except Exception as e:
            print(f"DEBUG: Warning: Could not write to alternate path: {str(e)}")

        # Clear any cached data
        print("DEBUG: Trying to clear cached data")

        # Return explicit success with the updated contributor data
        return {
            "status": "success",
            "message": "Contributor file updated directly",
            "updated_contributor": contributors_data["contributors"][contributor_index],
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"DEBUG: Error in direct update: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update contributor: {str(e)}"
        )


# Create a new synchronized endpoint for contributors
@app.post("/api/contributors/sync", response_model=dict)
async def sync_contributors(data: dict, current_user: User = Depends(get_current_user)):
    """
    Completely synchronize the contributors data across all locations.
    This is a complete rewrite that guarantees consistency.
    """
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    try:
        # Validate the data structure
        if "contributors" not in data:
            raise HTTPException(
                status_code=400,
                detail="Invalid data format - missing 'contributors' key",
            )

        # Log the operation
        print(f"Syncing contributors data: {len(data['contributors'])} contributors")

        # Make a fresh copy to avoid reference issues
        contributors_data = {"contributors": []}

        # Copy each contributor with proper validation
        for contributor in data["contributors"]:
            # Ensure required fields
            if (
                "id" not in contributor
                or "name" not in contributor
                or "organization" not in contributor
            ):
                print(f"Warning: Skipping invalid contributor data: {contributor}")
                continue

            # Create a clean contributor record
            clean_contributor = {
                "id": contributor["id"],
                "name": contributor["name"],
                "organization": contributor["organization"],
                "linkedin": contributor.get("linkedin", ""),
                "image": contributor.get("image", ""),
                "contributions": contributor.get("contributions", []),
            }

            # Validate contributions format if present
            if clean_contributor["contributions"]:
                valid_contributions = []
                for contrib in clean_contributor["contributions"]:
                    if (
                        isinstance(contrib, dict)
                        and "title" in contrib
                        and "path" in contrib
                    ):
                        valid_contributions.append(
                            {"title": contrib["title"], "path": contrib["path"]}
                        )
                clean_contributor["contributions"] = valid_contributions

            # Add to our clean data
            contributors_data["contributors"].append(clean_contributor)

        # Write the data to all possible locations
        success_locations = []

        # 1. Primary location (frontend/docs/data)
        try:
            primary_path = CONTRIBUTORS_FILE
            os.makedirs(os.path.dirname(primary_path), exist_ok=True)
            with open(primary_path, "w") as f:
                json.dump(contributors_data, f, indent=4)
            print(f"Successfully wrote data to primary location: {primary_path}")
            success_locations.append(primary_path)
        except Exception as e:
            print(f"Error writing to primary location: {str(e)}")

        # 2. Secondary location (frontend/data)
        try:
            secondary_path = os.path.join(
                BASE_DIR, "frontend", "data", "contributors.json"
            )
            os.makedirs(os.path.dirname(secondary_path), exist_ok=True)
            with open(secondary_path, "w") as f:
                json.dump(contributors_data, f, indent=4)
            print(f"Successfully wrote data to secondary location: {secondary_path}")
            success_locations.append(secondary_path)
        except Exception as e:
            print(f"Error writing to secondary location: {str(e)}")

        # Reset the modified time tracker to force a fresh read
        global CONTRIBUTORS_LAST_MODIFIED
        CONTRIBUTORS_LAST_MODIFIED = 0

        # Return success with information
        if not success_locations:
            raise HTTPException(
                status_code=500, detail="Failed to write data to any location"
            )

        return {
            "status": "success",
            "message": f"Data synchronized to {len(success_locations)} locations",
            "locations": success_locations,
            "contributors_count": len(contributors_data["contributors"]),
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in contributors sync: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to sync contributors: {str(e)}"
        )
