FROM node:current as builder

COPY frontend /frontend
WORKDIR /frontend

RUN npm install; npm run build

FROM python:3.10-slim

# Copy only requirements to cache them in docker layer
WORKDIR /code
COPY requirements.txt /code/

# Project initialization:
RUN pip install -r requirements.txt

# Install pre-trained models here
# Example:
RUN python -c 'from sentence_transformers import SentenceTransformer; SentenceTransformer("all-MiniLM-L6-v2");'
RUN python -c 'from transformers import RobertaTokenizer, RobertaModel, RobertaConfig; RobertaTokenizer.from_pretrained("microsoft/unixcoder-base") ; RobertaModel.from_pretrained("microsoft/unixcoder-base") ; RobertaConfig.from_pretrained("microsoft/unixcoder-base");'

# Creating folders, and files for a project:
COPY . /code

COPY --from=builder /frontend/dist /code/frontend/dist

CMD uvicorn code_search.service:app --host 0.0.0.0 --port 8000 --workers ${WORKERS:-1}
