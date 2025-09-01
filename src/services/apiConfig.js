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
      const Response = await api.get(
        `${endpoints.query}?q=${encodeURIComponent(query)}`
      );
      console.log("API Response:", Response);

      // Create a standardized response format
      let processedResponse = { response: null };

      // Handle the raw response data
      if (Response.data === undefined || Response.data === null) {
        // Handle null/undefined data
        console.warn("Warning: Server returned no data");
        processedResponse = {
          response:
            "No data returned from the server. Please make sure you've uploaded documents.",
          status: "error",
        };
      } else if (typeof Response.data === "string") {
        // Handle string response (simple text)
        processedResponse = { response: Response.data };
      } else if (typeof Response.data === "object") {
        // Handle object responses
        if (Object.keys(Response.data).length === 0) {
          // Empty object response
          console.warn("Warning: Server returned empty object");
          processedResponse = {
            response:
              "No relevant information found in your documents for this query.",
            status: "no_results",
          };
        } else if (Response.data.response) {
          // The response already has the structure we want
          processedResponse = Response.data;
        } else if (Response.data.error || Response.data.status === "error") {
          // Error reported in the response
          processedResponse = {
            response: Response.data.message || "Error from server",
            status: "error",
            details: Response.data,
          };
        } else {
          // Unknown object structure - use as is but ensure it has a response property
          processedResponse = {
            response: JSON.stringify(Response.data, null, 2),
            rawData: Response.data,
          };
        }
      } else {
        // Any other type of response
        processedResponse = {
          response: `Received: ${Response.data}`,
          type: typeof Response.data,
        };
      }

      console.log("Processed response:", processedResponse);
      return processedResponse;
    } catch (error) {
      console.error("API Error:", error);

      // Instead of throwing errors, return structured error responses
      // This ensures the UI always gets a consistent format

      if (error.response) {
        console.error("Error response:", error.response);

        // Handle specific status codes
        if (error.response.status === 404) {
          return {
            response:
              "The query endpoint was not found. Check your API configuration.",
            status: "error",
            statusCode: 404,
          };
        } else if (error.response.status === 400) {
          return {
            response:
              error.response.data?.message ||
              "Invalid query. Please try a different question.",
            status: "error",
            statusCode: 400,
          };
        } else if (error.response.status === 422) {
          return {
            response:
              error.response.data?.message ||
              "The server couldn't process your query. Please try rephrasing your question.",
            status: "error",
            statusCode: 422,
          };
        } else {
          return {
            response:
              error.response.data?.message ||
              `Server error: ${error.response.status} ${error.response.statusText}`,
            status: "error",
            statusCode: error.response.status,
          };
        }
      } else if (error.request) {
        console.error("No response received");
        return {
          response:
            "No response from server. Please ensure the backend server is running at " +
            (process.env.REACT_APP_API_URL || "http://localhost:8000"),
          status: "error",
          errorType: "network",
        };
      } else {
        console.error("Request setup error:", error.message);
        return {
          response: "Failed to send request: " + error.message,
          status: "error",
          errorType: "request",
        };
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
          // Accept all status codes to handle them manually
          return true;
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
      // Check for error status codes
      if (response.status >= 400) {
        console.error(`Upload error: HTTP ${response.status}`, response.data);

        if (response.status === 422) {
          // Handle validation errors (422 Unprocessable Entity)
          const errorMsg =
            response.data.detail ||
            "Server couldn't process the upload. Please check your files and try again.";

          throw new Error(
            Array.isArray(errorMsg)
              ? errorMsg
                  .map((err) => `${err.loc.join(".")}: ${err.msg}`)
                  .join("\n")
              : errorMsg
          );
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${response.statusText}`
        );
      }

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
      const Response = await api.get(
        `${endpoints.theme}?q=${encodeURIComponent(query)}`
      );
      return Response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to analyze themes"
      );
    }
  },
};

export default api;
