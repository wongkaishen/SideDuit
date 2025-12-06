"""
Test script to verify the root endpoint works.
Run this after starting the Django server.
"""
import requests

try:
    response = requests.get('http://127.0.0.1:8000/')
    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{response.json()}")
except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure to:")
    print("1. Activate virtual environment: backend/env/Scripts/activate")
    print("2. Start server: python manage.py runserver")
