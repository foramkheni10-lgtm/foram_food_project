import axios from "axios";

const api = axios.create({
  baseURL: "https://foram-food-project.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartfoodcourt_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;