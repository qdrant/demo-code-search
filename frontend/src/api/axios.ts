import axios from "axios";

/**
 * In development we use "/" so Vite's proxy in vite.config.ts forwards
 * /api/* to the local FastAPI server. In production the frontend and
 * backend live on different origins, so VITE_API_URL points at the
 * deployed backend (e.g. https://code-search-api.up.railway.app).
 */
const baseURL = import.meta.env.VITE_API_URL || "/";

export const api = axios.create({
  baseURL,
  validateStatus: () => true,
});
