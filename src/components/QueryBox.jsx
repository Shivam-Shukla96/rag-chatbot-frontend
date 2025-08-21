import React, { useState } from "react";
import { chatService } from "../services/apiConfig";

const QueryBox = () => {
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAnswers(""); // Clear previous answers
      console.log("Sending query:", query); // Debug log
      const response = await chatService.sendQuery(query);
      console.log("Received response:", response); // Debug log
      setAnswers(response.answer || response.data || response);
    } catch (err) {
      console.error("Query error:", err); // Debug log
      setError(
        err.message ||
          "Failed to get response. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-white max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        Ask a Question
      </h2>

      <div className="relative">
        <input
          className="bg-gray-700 border border-gray-600 text-white px-4 py-3 w-full rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question..."
          onKeyPress={(e) => e.key === "Enter" && handleQuery()}
        />
        <button
          className={`absolute right-2 top-2 px-4 py-1 rounded-md transition-all duration-200 flex items-center ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
          }`}
          onClick={handleQuery}
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <span>Ask</span>
          )}
        </button>
      </div>

      <div className="mt-6 rounded-lg overflow-hidden">
        {loading && (
          <div className="bg-gray-700 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div
            className={`bg-white text-gray-800 p-4 rounded-lg shadow-inner ${
              answers ? "animate-fadeIn" : "text-gray-500"
            }`}
          >
            {answers || "No answers yet. Ask me anything!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryBox;
