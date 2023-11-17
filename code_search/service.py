import os

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from code_search.config import ROOT_DIR
from code_search.searcher import CombinedSearcher
from code_search.get_file import FileGet

app = FastAPI()

searcher = CombinedSearcher()
get_file = FileGet()


@app.get("/api/search")
async def search(query: str):
    return {
        "result": searcher.search(query, limit=5)
    }

@app.get("/api/file")
async def file(path: str):
    return {
        "result": get_file.get(path)
    }


app.mount("/", StaticFiles(directory=os.path.join(ROOT_DIR, 'frontend', 'dist'), html=True))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
