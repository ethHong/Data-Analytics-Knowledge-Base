from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Catch all markdown access attempts
@app.get("/markdowns/{path:path}")
@app.get("/docs/markdowns/{path:path}")
async def catch_markdown_access(request: Request, path: str):
    """Redirect all markdown access attempts to login"""
    return RedirectResponse(url="/auth/login.html")


# Mount static files EXCEPT markdowns
app.mount("/js", StaticFiles(directory="frontend/docs/js"), name="js")
app.mount("/css", StaticFiles(directory="frontend/docs/css"), name="css")
app.mount("/images", StaticFiles(directory="frontend/docs/images"), name="images")
app.mount("/auth", StaticFiles(directory="frontend/docs/auth"), name="auth")
app.mount("/admin", StaticFiles(directory="frontend/docs/admin"), name="admin")
app.mount("/data", StaticFiles(directory="frontend/docs/data"), name="data")

# Import and include the API routes
from app import app as api_app

app.mount("/api", api_app)

# Serve other static files but exclude markdowns
app.mount("/", StaticFiles(directory="frontend/docs", html=True), name="root")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
