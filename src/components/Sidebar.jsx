import React, { useEffect, useCallback } from "react";

const Sidebar = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
}) => {
  // Handle responsive collapse
  const handleResize = useCallback(() => {
    const shouldCollapse = window.innerWidth < 1024;
    setIsCollapsed(shouldCollapse);
  }, [setIsCollapsed]);

  // Set initial state and add resize listener
  useEffect(() => {
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
  const menuItems = [
    {
      id: "upload",
      title: "Document Upload",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      ),
    },
    {
      id: "chat",
      title: "Chat with Document",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      ),
    },
    {
      id: "theme",
      title: "Theme Analysis",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      ),
    },
  ];

  return (
    <div
      className={`relative h-full bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      } px-4 py-6 space-y-6 shadow-2xl`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-gray-800 rounded-full p-1.5 border border-gray-700 hover:bg-gray-700 transition-colors duration-200 hover:border-gray-600 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Logo Section */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center" : "space-x-3 px-2"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-8 w-8 text-blue-500 transition-transform duration-300 ${
            isCollapsed ? "scale-110" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {!isCollapsed && <span className="text-xl font-bold">DocChat AI</span>}
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            } px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-300 hover:bg-gray-800"
            }`}
            title={isCollapsed ? item.title : ""}
          >
            <span
              className={`transition-transform duration-200 ${
                activeSection === item.id ? "scale-110" : ""
              }`}
            >
              {item.icon}
            </span>
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </button>
        ))}
      </nav>

      {/* Status Section */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "space-x-2"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            {!isCollapsed && (
              <span className="text-sm text-gray-400">AI System Active</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
