#!/bin/bash
# Ensure you have a .env file configured with the required variables
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
