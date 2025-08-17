import React, { useState } from "react";
import { chatService } from "../services/apiConfig";

const ThemeViewer = () => {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTheme = async () => {
    if (!query.trim()) {
      setError("Please enter a query first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getThemes(query);
      setSummary(response.themes);
    } catch (err) {
      setError(err.message || "Failed to analyze themes");
      setSummary("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-white">
      <div className="flex items-center mb-4">
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h2 className="text-2xl font-bold">Theme Analysis</h2>
      </div>

      <div className="relative">
        <input
          className="bg-gray-700 border border-gray-600 text-white px-4 py-3 w-full rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          onKeyPress={(e) => e.key === "Enter" && handleTheme()}
          placeholder="Enter text to analyze themes..."
        />
        <button
          className={`absolute right-2 top-2 px-4 py-1 rounded-md transition-all duration-200 flex items-center ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg"
          }`}
          onClick={handleTheme}
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
            <span>Analyze</span>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded-lg">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      )}

      {!loading && summary && (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-purple-300">
            Identified Themes:
          </h3>
          <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeViewer;
