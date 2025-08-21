import axios from "axios";

// Base configuration for axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
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
      console.log(
        "Sending query to:",
        `${endpoints.query}?q=${encodeURIComponent(query)}`
      );
      const response = await api.get(
        `${endpoints.query}?q=${encodeURIComponent(query)}`
      );
      console.log("API Response:", response);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        throw new Error(
          error.response.data?.message ||
            `Server error: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.request) {
        console.error("No response received");
        throw new Error(
          "No response from server. Please ensure the backend server is running at " +
            (process.env.REACT_APP_API_URL || "http://localhost:8000")
        );
      } else {
        console.error("Request setup error:", error.message);
        throw new Error("Failed to send request: " + error.message);
      }
    }
  },

  // Upload multiple files
  async uploadFiles(formData, { onFileProgress, onOverallProgress }) {
    try {
      const totalFiles = formData.getAll("files").length;
      let completedFiles = 0;

      console.log("Uploading files:", {
        count: totalFiles,
        endpoint: endpoints.upload,
        baseURL: api.defaults.baseURL,
      });

      const response = await api.post(endpoints.upload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: function (status) {
          return status < 500; // Accept all status codes less than 500
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted =
            (progressEvent.loaded * 100) / progressEvent.total;

          // Update overall progress
          onOverallProgress?.(percentCompleted);

          // Estimate individual file progress
          const files = formData.getAll("files");
          files.forEach((file, index) => {
            const fileProgress = Math.min(
              100,
              percentCompleted / totalFiles +
                (100 / totalFiles) * completedFiles
            );
            onFileProgress?.(file.name, fileProgress);
          });
        },
      });

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);

      // Handle nested error messages in the response
      if (error.response?.data?.results) {
        const results = error.response.data.results;
        if (Array.isArray(results)) {
          const failedFiles = results
            .filter((result) => result.message?.status === "error")
            .map((result) => {
              const errorMsg = result.message.message;
              // Enhanced PDF-specific error messages
              if (
                errorMsg.includes("Cannot convert to list of floats") ||
                errorMsg.includes("Could not process PDF") ||
                errorMsg.includes("Failed to extract text")
              ) {
                return {
                  filename: result.filename,
                  message: `The file "${result.filename}" could not be processed. Please ensure it's a text-based PDF and not an image-based or scanned document.`,
                  tips: [
                    "If you're uploading a scanned document, use an OCR tool to convert it to a searchable PDF first.",
                    "Make sure the PDF contains actual text and not just images of text.",
                    "Try opening the PDF and checking if you can select and copy text from it.",
                  ],
                };
              }
              return {
                filename: result.filename,
                message: errorMsg,
                tips: [],
              };
            });

          if (failedFiles.length > 0) {
            const errorMessage = failedFiles
              .map((file) => {
                let msg = `${file.message}`;
                if (file.tips.length > 0) {
                  msg +=
                    "\n\nTips:\n" +
                    file.tips.map((tip) => `• ${tip}`).join("\n");
                }
                return msg;
              })
              .join("\n\n");
            throw new Error(errorMessage);
          }
        }
      }

      // Generic error handling for other types of errors
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to upload files. Please try again or contact support if the issue persists.";

      throw new Error(
        Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage
      );
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
