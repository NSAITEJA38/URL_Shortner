import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const createShortUrl = (data) => {
  return API.post("/shorten", data);
};

export const getAllUrls = () => {
  return API.get("/urls");
};

export const getSingleUrl = (shortCode) => {
  return API.get(`/url/${shortCode}`);
};

export const getUrlStats = (shortCode) => {
  return API.get(`/stats/${shortCode}`);
};

export const updateUrl = (shortCode, data) => {
  return API.put(`/url/${shortCode}`, data);
};

export const deleteUrl = (shortCode) => {
  return API.delete(`/url/${shortCode}`);
};

export const deactivateUrl = (shortCode) => {
  return API.patch(`/url/${shortCode}/deactivate`);
};

export const activateUrl = (shortCode) => {
  return API.patch(`/url/${shortCode}/activate`);
};