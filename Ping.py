import requests
import time
import os

URL = os.environ.get("REPLIT_URL", "https://yourapp.replit.app")

while True:
    try:
        r = requests.get(URL)
        print(f"Pinged! Status: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(270)
