// import React, { useState, useRef, useEffect } from "react";
// import { chatService } from "../services/apiConfig";

// // Message type definitions for chat history
// const MessageTypes = {
//   USER: "user",
//   AI: "ai",
//   ERROR: "error",
//   LOADING: "loading",
// };

// const QueryBox = () => {
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Chat history as an array of messages
//   const [chatHistory, setChatHistory] = useState([]);

//   // Reference to scroll to bottom of chat
//   const chatContainerRef = useRef(null);

//   // Auto-scroll to bottom when chat history changes
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop =
//         chatContainerRef.current.scrollHeight;
//     }
//   }, [chatHistory]);

//   const handleQuery = async () => {
//     if (!query.trim()) {
//       setError("Please enter a question");
//       return;
//     }

//     try {
//       const currentQuery = query;

//       // Clear input and add user message to chat history
//       setQuery("");
//       setError(null);

//       // Add user message to chat history
//       setChatHistory((prev) => [
//         ...prev,
//         { type: MessageTypes.USER, content: currentQuery },
//       ]);

//       // Add loading message
//       setChatHistory((prev) => [
//         ...prev,
//         { type: MessageTypes.LOADING, id: Date.now() },
//       ]);

//       setLoading(true);

//       console.log("Sending query:", currentQuery); // Debug log
//       const response = await chatService.sendQuery(currentQuery);
//       console.log("Received response:", response); // Debug log
//       console.log("Received response:", response?.response); // Debug log
//       console.log("Received sources :", response?.sources); // Debug log

//       // Remove loading message and add AI response
//       setChatHistory((prev) => {
//         const filtered = prev.filter(
//           (msg) => msg.type !== MessageTypes.LOADING
//         );
//         return [
//           ...filtered,
//           {
//             type: MessageTypes.AI,
//             // content: response.answer || response.data || response,
//             content: response.response || response.data || response,
//           },
//         ];

//       });
//     } catch (err) {
//       console.error("Query error:", err); // Debug log

//       // Remove loading message and add error message
//       setChatHistory((prev) => {
//         const filtered = prev.filter(
//           (msg) => msg.type !== MessageTypes.LOADING
//         );
//         return [
//           ...filtered,
//           {
//             type: MessageTypes.ERROR,
//             content:
//               err.message ||
//               "Failed to get response. Please ensure the backend server is running.",
//           },
//         ];
//       });

//       setError(
//         err.message ||
//           "Failed to get response. Please ensure the backend server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   console.log("Chat history:--", chatHistory);

//   return (
//     <div className="h-[70vh]  p-6 rounded-xl  text-white max-w-3xl mx-auto flex flex-col">
//       {/* <h2 className="text-2xl font-bold mb-2 flex items-center">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-6 w-6 mr-2"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
//           />
//         </svg>
//         AI Chat Assistant
//       </h2> */}

//       {/* Chat messages area with flex-grow to fill available space */}
//       <div
//         ref={chatContainerRef}
//         className="flex-grow overflow-y-auto no-scrollbar mb-4 rounded-lg p-4  scroll-smooth"
//       >
//         {chatHistory.length === 0 && (
//           <div className="text-gray-500 text-center py-10">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-12 w-12 mx-auto mb-4 text-gray-600"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1}
//                 d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
//               />
//             </svg>
//             <p>Upload your documents and query about their content.</p>
//           </div>
//         )}

//         {/* Render chat history */}
//         {chatHistory.map((message, index) => {
//           // User message
//           if (message.type === MessageTypes.USER) {
//             return (
//               <div
//                 key={`user-${index}`}
//                 className="bg-blue-500 bg-opacity-20 text-white p-4 rounded-lg mb-3 ml-auto max-w-[80%]"
//               >
//                 <p className="whitespace-pre-wrap">{message?.content}</p>
//               </div>
//             );
//           }

//           // AI response
//           if (message?.type === MessageTypes.AI) {
//             return (
//               <div
//                 key={`ai-${index}`}
//                 className="bg-gray-700 p-4 rounded-lg shadow-inner mb-3 max-w-[80%] animate-fadeIn"
//               >
//                 <div className="whitespace-pre-wrap">{message?.content}</div>
//               </div>
//             );
//           }

//           // Error message
//           if (message.type === MessageTypes.ERROR) {
//             return (
//               <div
//                 key={`error-${index}`}
//                 className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-3 max-w-[90%]"
//               >
//                 <div className="flex items-center">
//                   <svg
//                     className="h-5 w-5 mr-2 flex-shrink-0"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   <div className="whitespace-pre-wrap">{message.content}</div>
//                 </div>
//               </div>
//             );
//           }

//           // Loading indicator
//           if (message.type === MessageTypes.LOADING) {
//             return (
//               <div
//                 key={`loading-${message.id}`}
//                 className="bg-gray-700 p-4 rounded-lg animate-pulse mb-3 max-w-[60%]"
//               >
//                 <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
//                 <div className="h-4 bg-gray-600 rounded w-1/2"></div>
//               </div>
//             );
//           }

//           return null;
//         })}
//       </div>

//       {/* Chat input area at the bottom */}
//       <div className="relative flex">
//         <textarea
//           className="flex-grow bg-gray-700 border border-gray-600 text-white px-4 py-3 pr-16 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none min-h-[50px] max-h-[150px]"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Type your question..."
//           onKeyPress={(e) =>
//             e.key === "Enter" &&
//             !e.shiftKey &&
//             (e.preventDefault(), handleQuery())
//           }
//           rows={Math.min(5, Math.max(1, query.split("\n").length))}
//           style={{ overflow: "auto" }}
//         />
//         <button
//           className={`absolute right-2 bottom-2 px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
//             loading
//               ? "bg-gray-500 cursor-not-allowed"
//               : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
//           }`}
//           onClick={handleQuery}
//           disabled={loading}
//         >
//           {loading ? (
//             <svg
//               className="animate-spin h-5 w-5 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//           ) : (
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//               />
//             </svg>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QueryBox;

import React, { useState, useRef, useEffect } from "react";
import { chatService } from "../services/apiConfig";

// Message type definitions for chat history
const MessageTypes = {
  USER: "user",
  AI: "ai",
  ERROR: "error",
  LOADING: "loading",
};

const QueryBox = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    try {
      const currentQuery = query;
      setQuery("");
      setError(null);

      setChatHistory((prev) => [
        ...prev,
        { type: MessageTypes.USER, content: currentQuery },
        { type: MessageTypes.LOADING, id: Date.now() },
      ]);

      setLoading(true);

      console.log("About to fetch response for query:", currentQuery);
      const response = await chatService.sendQuery(currentQuery);

      // Log the full response for debugging
      console.log("Raw response from API:", response);

      // Since apiConfig now returns a standardized format,
      // we can simplify the processing here dramatically
      let aiContent = "";

      console.log("Working with response:", response);

      try {
        // Extra safety check for null/undefined response
        if (response === null || response === undefined) {
          console.error("Received null/undefined response from API");
          aiContent = "Error: No response received from the server.";
        }
        // Check if we have a response property (our standard format)
        else if (
          response &&
          typeof response === "object" &&
          "response" in response
        ) {
          aiContent = response.response || "No content in response";

          // Add sources if available
          if (
            response.sources &&
            Array.isArray(response.sources) &&
            response.sources.length > 0
          ) {
            aiContent += "\n\nSources:\n" + response.sources.join("\n");
          }

          // Check for status flags
          if (response.status === "error" || response.status === "no_results") {
            console.warn("Response indicates an issue:", response.status);
          }
        }
        // Direct string response from backend
        else if (typeof response === "string") {
          console.log("Received direct string response");
          aiContent = response;
        }
        // Raw response from backend in unexpected format
        else if (typeof response === "object") {
          console.error(
            "Response object missing 'response' property:",
            response
          );

          // Try to extract anything useful
          if ("text" in response) aiContent = response.text;
          else if ("content" in response) aiContent = response.content;
          else if ("answer" in response) aiContent = response.answer;
          else if ("data" in response) {
            aiContent =
              typeof response.data === "string"
                ? response.data
                : "Response data received (see console for details)";
          } else {
            // Last resort - stringify the object
            aiContent =
              "Backend response format issue. Response received:\n\n" +
              JSON.stringify(response, null, 2);
          }
        } else {
          // This shouldn't happen with our new apiConfig, but just in case
          console.error(
            "Completely unexpected response format:",
            response,
            typeof response
          );
          aiContent = `Error: Received unexpected response type: ${typeof response}`;
        }
      } catch (parseError) {
        console.error("Error while processing response:", parseError);
        aiContent =
          "Error processing server response. Please check the browser console for details.";
      }

      // Remove loading and add the appropriate message type based on response status
      setChatHistory((prev) => {
        const filtered = prev.filter(
          (msg) => msg.type !== MessageTypes.LOADING
        );

        // If response indicates an error, show as error message
        // Otherwise show as AI message
        if (response && response.status === "error") {
          return [
            ...filtered,
            {
              type: MessageTypes.ERROR,
              content: aiContent,
            },
          ];
        } else {
          return [
            ...filtered,
            {
              type: MessageTypes.AI,
              content: aiContent,
            },
          ];
        }
      });
    } catch (err) {
      // This catch block should rarely execute now, since our API service
      // converts errors to structured responses instead of throwing them
      console.error("Unexpected query error:", err);

      const errorMessage =
        "An unexpected error occurred while processing your query. Please try again later.";

      console.log("Displaying error to user:", errorMessage);

      setChatHistory((prev) => {
        const filtered = prev.filter(
          (msg) => msg.type !== MessageTypes.LOADING
        );
        return [
          ...filtered,
          {
            type: MessageTypes.ERROR,
            content: errorMessage,
          },
        ];
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[70vh] p-6 rounded-xl text-white max-w-3xl mx-auto flex flex-col">
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto no-scrollbar mb-4 rounded-lg p-4 scroll-smooth"
      >
        {chatHistory.length === 0 && (
          <div className="text-gray-500 text-center py-10">
            <p>Upload your documents and query about their content.</p>
          </div>
        )}

        {chatHistory.map((message, index) => {
          if (message.type === MessageTypes.USER) {
            return (
              <div
                key={`user-${index}`}
                className="bg-blue-500 bg-opacity-20 text-white p-4 rounded-lg mb-3 ml-auto max-w-[80%]"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            );
          }

          if (message.type === MessageTypes.AI) {
            return (
              <div
                key={`ai-${index}`}
                className="bg-gray-700 p-4 rounded-lg shadow-inner mb-3 max-w-[80%] animate-fadeIn"
              >
                <pre className="whitespace-pre-wrap">{message.content}</pre>
              </div>
            );
          }

          if (message.type === MessageTypes.ERROR) {
            return (
              <div
                key={`error-${index}`}
                className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-3 max-w-[90%]"
              >
                <div className="flex items-center">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            );
          }

          if (message.type === MessageTypes.LOADING) {
            return (
              <div
                key={`loading-${message.id}`}
                className="bg-gray-700 p-4 rounded-lg animate-pulse mb-3 max-w-[60%]"
              >
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="relative flex">
        <textarea
          className="flex-grow bg-gray-700 border border-gray-600 text-white px-4 py-3 pr-16 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none min-h-[50px] max-h-[150px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question..."
          onKeyPress={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), handleQuery())
          }
          rows={Math.min(5, Math.max(1, query.split("\n").length))}
          style={{ overflow: "auto" }}
        />
        <button
          className={`absolute right-2 bottom-2 px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
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
              stroke="currentColor"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default QueryBox;
