import os

# Environment variables are now loaded securely from .env file via dotenv in main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
