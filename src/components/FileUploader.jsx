import React, { useState, useRef } from "react";
import { chatService } from "../services/apiConfig";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      setStatus("Uploading...");

      const res = await chatService.uploadFile(formData, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      setStatus(`Successfully uploaded: ${res.chunks} chunks processed`);
      setFile(null);
      fileInputRef.current.value = "";
    } catch (error) {
      setError(error.message || "Upload failed. Please try again.");
      setStatus("");
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h2 className="text-2xl font-bold">Upload Document</h2>
      </div>

      <div className="bg-gray-700 p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setError(null);
                setStatus("");
              }}
              accept=".txt,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 flex items-center"
            >
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              Choose File
            </button>
          </div>

          {file && (
            <div className="text-sm text-gray-300 text-center">
              Selected: {file.name}
            </div>
          )}
        </div>
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

      {(status || loading) && (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg">
          {loading && (
            <div className="w-full bg-gray-600 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          <p className="text-sm text-center text-gray-300">{status}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
          }`}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2"
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
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Upload Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
