import axios from "axios";
import { getToken } from "../components/auth/token";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

http.interceptors.request.use(async (config) => {
  // attach token only for your backend APIs
  if (config.url?.startsWith("/api")) {
    const token = await getToken();
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
