import os

import uvicorn

if __name__ == "__main__":
    reload = os.environ.get("WHEELSENSE_RELOAD") == "1"
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=reload)
