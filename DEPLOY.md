# Deploying to Vercel + Railway + Qdrant Cloud

This repo is set up for a three-service split:

| Piece | Where | Cost |
|---|---|---|
| Frontend (React/Vite static build) | Vercel | Free |
| Backend (FastAPI + UniXcoder) | Railway | ~$5–10/mo |
| Vector database | Qdrant Cloud | Free tier (1 GB) |

Total setup time: ~30 minutes plus the migration copy (a few minutes on top).

---

## 1. Create a Qdrant Cloud cluster

1. Sign up at https://cloud.qdrant.io.
2. Create a free-tier cluster (1 GB is plenty for this dataset).
3. Copy the cluster URL and generate an API key. You will need both below.

## 2. Migrate the collections into Qdrant Cloud

Make sure your local Qdrant container is running and has these collections:

- `code-files` (file contents used by the file endpoint)
- `code-signatures` (MiniLM embeddings of function signatures)
- `code-snippets-unixcoder` (UniXcoder embeddings; still building on first run)

Then copy them into the cloud cluster:

```bash
export SRC_URL=http://localhost:6333
export DST_URL=https://your-cluster-id.aws.cloud.qdrant.io:6333
export DST_API_KEY=your-cloud-api-key
python -m tools.migrate_to_qdrant_cloud
```

If a collection is not yet ready locally (for example the UniXcoder run is
still going), the script prints `skip` for it and moves on. Re-run once
it's ready.

## 3. Deploy the backend to Railway

1. Push this repo to GitHub.
2. In Railway, click **New Project → Deploy from GitHub Repo** and pick this
   repo. Railway detects [Dockerfile](Dockerfile) and [railway.json](railway.json).
3. Set the following service variables in Railway:

   | Variable | Value |
   |---|---|
   | `QDRANT_URL` | your Qdrant Cloud URL (e.g. `https://xxx.aws.cloud.qdrant.io:6333`) |
   | `QDRANT_API_KEY` | your Qdrant Cloud API key |
   | `CORS_ORIGINS` | your Vercel frontend URL (see step 4). Comma-separate multiple. |
   | `WORKERS` | `1` (raise only if you upgrade RAM significantly) |

4. Railway will build and expose a URL like `https://code-search-api.up.railway.app`.
   Wait for the health check at `/api/health` to pass; first boot takes ~30–60s
   because the UniXcoder model loads into memory.
5. Copy that URL — you'll paste it into Vercel next.

**Sizing note.** UniXcoder plus MiniLM want about 2 GB of RAM to be comfortable.
The free/Hobby "Starter" instance (512 MB) will OOM. Use Railway's **Hobby**
plan (2 GB) or higher.

## 4. Deploy the frontend to Vercel

1. In Vercel, click **Add New → Project** and import this repo.
2. Set the **Root Directory** to `frontend`. Vercel picks up
   [vercel.json](frontend/vercel.json) automatically.
3. Under **Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | your Railway backend URL, no trailing slash |

4. Click **Deploy**. Vercel gives you a URL like
   `https://code-search.vercel.app`.
5. Go back to Railway and update `CORS_ORIGINS` with that exact URL. Railway
   redeploys automatically.

## 5. Verify

- Hit the frontend URL — you should see the hero.
- Run one of the demo queries. You should see results (semantic if UniXcoder
  is loaded, "Warming Up" keyword mode otherwise).
- Click into a code card and hit "load more lines" — the file endpoint should
  return 200s.

## Troubleshooting

- **Search returns 500 with a Qdrant 404 error**: the target collection was
  not migrated. Re-run `python -m tools.migrate_to_qdrant_cloud`.
- **CORS error in browser console**: the frontend URL isn't in `CORS_ORIGINS`
  on Railway. Add it (comma-separated for multiple).
- **Backend crashes on boot with OOM**: raise the Railway plan to at least
  2 GB, or switch to a MiniLM-only build (drop UniXcoder from `CodeSearcher`).
- **Slow first request**: normal. UniXcoder loads once per container, then
  requests are fast.

## Custom domain

Both Vercel and Railway support custom domains. If you attach one to the
frontend, remember to update `CORS_ORIGINS` on Railway to include it.
