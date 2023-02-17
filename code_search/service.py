import os

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from code_search.config import ROOT_DIR

app = FastAPI()


@app.get("/api/search")
async def search(query: str):
    return {
        "result": query
    }

app.mount("/", StaticFiles(directory=os.path.join(ROOT_DIR, 'frontend', 'dist', 'spa'), html=True))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
