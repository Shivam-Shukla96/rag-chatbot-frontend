import React, { useState, useRef, useCallback } from "react";
import { chatService } from "../services/apiConfig";

const MAX_FILES = 100;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_TYPES = [".txt", ".pdf", ".doc", ".docx"];

const FileUploader = () => {
  const [files, setFiles] = useState([]); // Array of File objects
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Reset state when component unmounts
  React.useEffect(() => {
    return () => {
      setFiles([]);
      setStatus("");
      setError(null);
      setUploadProgress({});
      setOverallProgress(0);
    };
  }, []);

  const checkPDFContent = useCallback(async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const content = event.target.result;
        // Check for common indicators of text-based PDFs
        const hasTextMarkers =
          content.includes("/Type /Font") ||
          content.includes("/Subtype /Text") ||
          content.includes("/Filter /FlateDecode") ||
          content.includes("/ToUnicode") ;
        resolve(hasTextMarkers);
      };
      reader.readAsBinaryString(file.slice(0, 5120)); // Read first 5KB for faster processing
    });
  }, []);

  const validateFiles = useCallback(
    async (fileList) => {
      const errors = [];
      const validFiles = [];

      // Convert FileList to array and validate each file
      for (const file of Array.from(fileList)) {
        if (
          !ALLOWED_TYPES.some((type) => file.name.toLowerCase().endsWith(type))
        ) {
          errors.push(
            `${
              file.name
            }: Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`
          );
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds 10MB limit`);
          continue;
        }

        // if (file.name.toLowerCase().endsWith(".pdf")) {
        // if (file.name.toLowerCase().endsWith(".pdf")) {
        //   try {
        //     const isTextBased = await checkPDFContent(file);
        //     console.log(isTextBased, "isTextBased");
        //     if (!isTextBased) {
        //       errors.push(
        //         `${file.name}: This appears to be a scanned or image-based PDF. Please upload a text-based PDF or use an OCR tool first.`
        //       );
        //       continue;
        //     }
        //   } catch (err) {
        //     console.error("PDF validation error:", err);
        //     errors.push(
        //       `${file.name}: Error validating PDF content. Please try a different file.`
        //     );
        //     continue;
        //   }
        // }

        // If we get here, the file passed all validation checks
        validFiles.push(file);
      }

      // After checking all files, check if we have too many valid files
      if (validFiles.length > MAX_FILES) {
        return {
          validFiles: [],
          errors: [`Maximum ${MAX_FILES} files can be uploaded at once`],
        };
      }

      return { validFiles, errors };
    },
    [checkPDFContent]
  );

  const handleUpload = async () => {
    console.log("Starting upload... ");
    if (files.length === 0) {
      setError("Please select files first");
      return;
    }
    
    // Debug log - check what files we're trying to upload
    console.log("Files to upload:", files.map(f => ({ 
      name: f.name, 
      type: f.type,
      size: f.size,
      lastModified: new Date(f.lastModified).toISOString()
    })));

    try {
      setLoading(true);
      setError(null);
      setStatus("Preparing upload...");

      // Create FormData with all files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file);
        }
      });

      console.log(
        "Sending files:",
        Array.from(formData.getAll("files")).map((f) => ({
          name: f.name,
          size: f.size,
        }))
      );

      const response = await chatService.uploadFiles(formData, {
        onFileProgress: (fileName, progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileName]: Math.round(progress),
          }));
        },
        onOverallProgress: (progress) => {
          setOverallProgress(Math.round(progress));
          setStatus(`Uploading files: ${Math.round(progress)}%`);
        },
      });

      console.log("Upload response:", response);

      // Check for processing errors in the response
      if (response?.results) {
        const failedFiles = response.results.filter(
          (result) => result.message?.status === "error"
        );
        const successFiles = response.results.filter(
          (result) =>
            !result.message?.status || result.message.status !== "error"
        );

        if (failedFiles.length > 0) {
          const errorMessages = failedFiles.map(
            (file) => `${file.filename}: ${file.message.message}`
          );
          setError(errorMessages.join("\n"));
          setStatus(
            `Upload completed. ${successFiles.length} files processed successfully, ${failedFiles.length} files had processing errors.`
          );
        } else {
          setStatus(`Successfully processed ${response.total_files} files`);
          setFiles([]);
          fileInputRef.current.value = "";
        }
      } else {
        setStatus(`Upload completed successfully`);
        setFiles([]);
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Upload failed";

      if (error.response?.data?.results) {
        // Handle structured error response with tips for PDF errors
        const failedResults = error.response.data.results.filter(
          (r) => r.message?.status === "error"
        );
        if (failedResults.length > 0) {
          const errors = failedResults.map((r) => {
            const msg = r.message.message;
            if (
              msg.includes("Cannot convert to list of floats") ||
              msg.includes("Could not process PDF") ||
              msg.includes("Failed to extract text")
            ) {
              return {
                file: r.filename,
                message:
                  "This appears to be a scanned or image-based PDF. Please upload a text-based PDF or use an OCR tool first.",
                tips: [
                  "Use an OCR tool to convert scanned documents to searchable PDFs",
                  "Ensure the PDF contains actual text, not just images",
                  "Try opening the PDF and verifying you can select/copy text",
                ],
              };
            }
            return { file: r.filename, message: msg, tips: [] };
          });

          errorMessage = errors
            .map((err) => {
              let msg = `${err.file}: ${err.message}`;
              if (err.tips.length > 0) {
                msg +=
                  "\n\nTips:\n" + err.tips.map((tip) => `• ${tip}`).join("\n");
              }
              return msg;
            })
            .join("\n\n");
        }
      } else if (error.response?.data?.message) {
        // Handle direct error message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Handle network or other errors
        errorMessage = error.message;
      }

      setError(errorMessage);
      setStatus("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress({});
      setOverallProgress(0);
    }
  };

  const handleFileSelect = async (event) => {
    console.log("File selection changed");
    if (!event.target.files || event.target.files.length === 0) {
      console.log(event?.target, "event. target ");
      setError("No files selected");
      return;
    }

    setStatus("Validating files...");
    setError(null);

    try {
      const { validFiles, errors } = await validateFiles(event.target.files);

      if (errors.length > 0) {
        setError(errors.join("\n"));
        event.target.value = "";
        return;
      }

      setFiles(validFiles);
      setError(null);
      setStatus(`${validFiles.length} files selected`);
    } catch (err) {
      console.error("File validation error:", err);
      setError("Error validating files. Please try again.");
      event.target.value = "";
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
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept={ALLOWED_TYPES.join(",")}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="group px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-200 flex items-center hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
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
              Choose Files
            </button>
          </div>

          {files.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span>Selected Files ({files.length})</span>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setError(null);
                      setStatus("");
                      fileInputRef.current.value = "";
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-400 ml-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 text-center">
            Maximum {MAX_FILES} files, up to 10MB each
            <br />
            Supported formats: {ALLOWED_TYPES.join(", ")}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
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
            <div className="flex-1">
              <div className="font-medium mb-1">File Processing Error</div>
              <div className="text-sm whitespace-pre-wrap">
                {error.includes("Cannot convert to list of floats")
                  ? "The file could not be processed. Please try uploading a different PDF file, or ensure the PDF is text-based and not image-based."
                  : error.includes("Failed to upload files")
                  ? "Connection to server failed. Please ensure the backend server is running and try again."
                  : error}
              </div>
              {error.includes("Cannot convert to list of floats") && (
                <div className="mt-2 text-sm">
                  Tips:
                  <ul className="list-disc ml-4 mt-1">
                    <li>
                      If you're uploading a scanned document, try using an OCR
                      tool to convert it to a searchable PDF first.
                    </li>
                    <li>
                      Make sure the PDF contains actual text and not just images
                      of text.
                    </li>
                  </ul>
                </div>
              )}
              {error.includes("Failed to upload files") && (
                <div className="mt-2 text-sm">
                  Tips:
                  <ul className="list-disc ml-4 mt-1">
                    <li>
                      Check if the backend server is running on
                      http://localhost:8000
                    </li>
                    <li>Try refreshing the page and uploading again</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(status || loading) && (
        <div className="mt-4 bg-gray-700 p-4 rounded-lg space-y-4">
          {loading && (
            <>
              {/* Overall progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual file progress */}
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="truncate" title={fileName}>
                        {fileName}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
          disabled={loading || files.length === 0}
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
