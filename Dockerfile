FROM node:22-alpine AS builder

COPY frontend /frontend
WORKDIR /frontend

RUN npm ci && npm run build

FROM python:3.12-slim

# Copy only requirements first so dependency installs are cached in their own layer
WORKDIR /code
COPY requirements.txt /code/

RUN pip install --no-cache-dir -r requirements.txt

# Bake the pre-trained models into the image
RUN python -c 'from sentence_transformers import SentenceTransformer; SentenceTransformer("all-MiniLM-L6-v2");'
RUN python -c 'from transformers import RobertaTokenizer, RobertaModel, RobertaConfig; RobertaTokenizer.from_pretrained("microsoft/unixcoder-base") ; RobertaModel.from_pretrained("microsoft/unixcoder-base") ; RobertaConfig.from_pretrained("microsoft/unixcoder-base");'

COPY . /code

COPY --from=builder /frontend/dist /code/frontend/dist

# Railway/Fly.io/Render pass a PORT env var; fall back to 8000 locally.
CMD uvicorn code_search.service:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WORKERS:-1}
