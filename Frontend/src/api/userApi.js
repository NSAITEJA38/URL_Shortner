import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://url-shortner-1-yjbd.onrender.com")
});

export const registerUser = (data) => API.post("/user/register", data);
export const loginUser = (data) => API.post("/user/login", data);
export const getMe = (token) => {
  return API.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const forgotPassword = (data) => API.post("/user/forgot-password", data);
export const resetPassword = (token, data) => API.put(`/user/reset-password/${token}`, data);
