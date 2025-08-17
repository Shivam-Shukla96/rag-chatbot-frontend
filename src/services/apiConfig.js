import axios from "axios";

// Base configuration for axios
const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 600000, // 60 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints
export const endpoints = {
  query: "/query/",
  upload: "/upload/",
  theme: "/theme/",
};

// API service functions
export const chatService = {
  // Send a query to the chatbot
  async sendQuery(query) {
    try {
      const response = await api.get(
        `${endpoints.query}?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to get response from the chatbot"
      );
    }
  },

  // Upload a file
  async uploadFile(formData, onUploadProgress) {
    try {
      const response = await api.post(endpoints.upload, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted =
            (progressEvent.loaded * 100) / progressEvent.total;
          onUploadProgress?.(percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to upload file");
    }
  },

  // Get themes analysis
  async getThemes(query) {
    try {
      const response = await api.get(
        `${endpoints.theme}?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to analyze themes"
      );
    }
  },
};

export default api;
