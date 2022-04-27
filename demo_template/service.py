from fastapi import FastAPI

app = FastAPI()


@app.get("/api/predict")
async def predict(query: str):
    return {
        "result": query
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
