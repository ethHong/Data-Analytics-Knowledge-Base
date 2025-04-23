from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI()

# Constants
CONTRIBUTORS_FILE = "frontend/docs/data/contributors.json"


# Models
class User(BaseModel):
    email: str
    role: str


class ContributorCreate(BaseModel):
    id: str
    name: str
    organization: str
    linkedin: Optional[str] = None
    image: Optional[str] = None


class ContributorUpdate(BaseModel):
    name: str
    organization: str
    linkedin: Optional[str] = None
    image: Optional[str] = None


class ContributorContributions(BaseModel):
    contributions: List[dict]


# Helper functions
def read_json_file(file_path: str) -> dict:
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


def write_json_file(file_path: str, data: dict) -> None:
    try:
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing file: {str(e)}")


# Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # This is a simplified version. In production, you would verify the token
    # and get the user from your database
    try:
        # For now, we'll just check if the token exists in localStorage
        return User(email="admin@example.com", role="admin")
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/api/contributors")
async def get_all_contributors(current_user: User = Depends(get_current_user)):
    """Get all contributors"""
    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        return {"contributors": contributors_data.get("contributors", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/contributors/{contributor_id}")
async def get_contributor(
    contributor_id: str, current_user: User = Depends(get_current_user)
):
    """Get a single contributor by ID"""
    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        contributor = next(
            (
                c
                for c in contributors_data.get("contributors", [])
                if c["id"] == contributor_id
            ),
            None,
        )
        if not contributor:
            raise HTTPException(status_code=404, detail="Contributor not found")
        return contributor
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contributors")
async def create_contributor(
    contributor: ContributorCreate, current_user: User = Depends(get_current_user)
):
    """Create a new contributor (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admins can create contributors"
        )

    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        new_contributor = {
            "id": contributor.id,
            "name": contributor.name,
            "organization": contributor.organization,
            "linkedin": contributor.linkedin,
            "image": contributor.image,
            "contributions": [],
        }
        contributors_data["contributors"].append(new_contributor)
        write_json_file(CONTRIBUTORS_FILE, contributors_data)
        return new_contributor
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/contributors/{contributor_id}")
async def update_contributor(
    contributor_id: str,
    contributor: ContributorUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a contributor (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admins can update contributors"
        )

    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        contributor_index = next(
            (
                i
                for i, c in enumerate(contributors_data["contributors"])
                if c["id"] == contributor_id
            ),
            None,
        )
        if contributor_index is None:
            raise HTTPException(status_code=404, detail="Contributor not found")

        # Preserve existing contributions
        existing_contributions = contributors_data["contributors"][
            contributor_index
        ].get("contributions", [])

        contributors_data["contributors"][contributor_index].update(
            {
                "name": contributor.name,
                "organization": contributor.organization,
                "linkedin": contributor.linkedin,
                "image": contributor.image,
                "contributions": existing_contributions,  # Preserve existing contributions
            }
        )

        write_json_file(CONTRIBUTORS_FILE, contributors_data)
        return contributors_data["contributors"][contributor_index]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/contributors/{contributor_id}")
async def delete_contributor(
    contributor_id: str, current_user: User = Depends(get_current_user)
):
    """Delete a contributor (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admins can delete contributors"
        )

    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        contributors_data["contributors"] = [
            c for c in contributors_data["contributors"] if c["id"] != contributor_id
        ]
        write_json_file(CONTRIBUTORS_FILE, contributors_data)
        return {"message": "Contributor deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/contributors/{contributor_id}/contributions")
async def update_contributor_contributions(
    contributor_id: str,
    contributions: ContributorContributions,
    current_user: User = Depends(get_current_user),
):
    """Update a contributor's contributions (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admins can update contributions"
        )

    try:
        contributors_data = read_json_file(CONTRIBUTORS_FILE)
        contributor_index = next(
            (
                i
                for i, c in enumerate(contributors_data["contributors"])
                if c["id"] == contributor_id
            ),
            None,
        )
        if contributor_index is None:
            raise HTTPException(status_code=404, detail="Contributor not found")

        contributors_data["contributors"][contributor_index][
            "contributions"
        ] = contributions.contributions
        write_json_file(CONTRIBUTORS_FILE, contributors_data)
        return {"message": "Contributions updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
