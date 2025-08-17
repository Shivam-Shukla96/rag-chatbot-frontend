# AI Chatbot Frontend

A modern, responsive React-based frontend for an AI chatbot application.

## System Overview

### Architecture

- **Frontend**: React.js with Tailwind CSS
- **API Integration**: Axios for HTTP requests
- **Styling**: Tailwind CSS for responsive and modern UI

### Components Structure

```
src/
├── components/
│   ├── FileUploader.jsx    # Handles file upload functionality
│   ├── QueryBox.jsx        # Main chat interface component
│   └── ThemeViewer.jsx     # Theme-related component
├── services/
│   └── apiConfig.js        # API configuration and endpoints
├── App.jsx                 # Main application component
└── index.js               # Application entry point
```

### Data Flow

1. **User Input**

   - User enters a question in the QueryBox component
   - Input is captured in local state using useState hook

2. **API Communication**

   - When user clicks "Ask", the query is sent to backend
   - Request is made to `http://localhost:8000/query/` endpoint
   - Axios handles the HTTP GET request

3. **Response Handling**
   - Response from API is processed
   - Answer is displayed in the UI
   - Error states are handled and displayed to user

### Features

- Real-time query processing
- Error handling
- Loading states for better UX
- Responsive design
- File upload capability

## Setup Instructions

1. **Installation**

   ```bash
   npm install
   ```

2. **Running the Development Server**

   ```bash
   npm start
   ```

3. **Building for Production**
   ```bash
   npm run build
   ```

## Tech Stack

- React.js
- Tailwind CSS
- Axios
- PostCSS

## Project Structure

The project follows a component-based architecture where each feature is encapsulated in its own component. This ensures:

- Maintainable code
- Reusable components
- Clear separation of concerns
- Easy testing and debugging

## Best Practices

- Component-based architecture
- State management using React hooks
- Responsive design principles
- Error handling
- Loading state management
- API abstraction layer
