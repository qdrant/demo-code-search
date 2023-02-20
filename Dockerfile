FROM node:current as builder

COPY frontend /frontend
WORKDIR /frontend

RUN npm install; npx quasar build

FROM python:3.9-slim

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=1.3.2

RUN pip install "poetry==$POETRY_VERSION"

# Copy only requirements to cache them in docker layer
WORKDIR /code
COPY poetry.lock pyproject.toml /code/

# Project initialization:
RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-interaction --no-ansi

# Install pre-trained models here
# Example:
RUN python -c 'from sentence_transformers import SentenceTransformer; SentenceTransformer("all-MiniLM-L6-v2");'
RUN python -c 'from transformers import RobertaTokenizer, RobertaModel, RobertaConfig; RobertaTokenizer.from_pretrained("microsoft/unixcoder-base") ; RobertaModel.from_pretrained("microsoft/unixcoder-base") ; RobertaConfig.from_pretrained("microsoft/unixcoder-base");'

# Creating folders, and files for a project:
COPY . /code

COPY --from=builder /frontend/dist /code/frontend/dist

CMD uvicorn code_search.service:app --host 0.0.0.0 --port 8000 --workers ${WORKERS:-1}
