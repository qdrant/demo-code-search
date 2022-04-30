import os

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from demo_template.config import ROOT_DIR

app = FastAPI()


@app.get("/api/predict")
async def predict(query: str):
    return {
        "result": query
    }

app.mount("/", StaticFiles(directory=os.path.join(ROOT_DIR, 'frontend', 'dist', 'spa'), html=True))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
