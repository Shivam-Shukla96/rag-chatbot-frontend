import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import QueryBox from "./components/QueryBox";
import ThemeViewer from "./components/ThemeViewer";
import Sidebar from "./components/Sidebar";

function App() {
  const [activeSection, setActiveSection] = useState("upload");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    window.innerWidth < 1024
  );

  const renderContent = () => {
    switch (activeSection) {
      case "upload":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
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
              Document Upload
            </h2>
            <FileUploader />
          </div>
        );
      case "chat":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6  flex items-center">
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
              Chat with Your Documents
            </h2>
            <QueryBox />
          </div>
        );
      case "theme":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
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
              Theme Analysis
            </h2>
            <ThemeViewer />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </aside>

        {/* Overlay for mobile */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/20  lg:hidden z-10"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-72"
          } lg:ml-72`}
        >
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">{renderContent()}</div>

                {/* Footer */}
                <footer className=" pb-2 px-6"> 
                  <div className="text-center text-sm text-gray-400">
                    Powered by advanced AI technology
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
