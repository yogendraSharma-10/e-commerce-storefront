import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Global styles for the application

// Optional: Import context providers for global state management.
// These would typically be defined in a 'context' directory (e.g., './context/AuthContext').
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';
// import { ThemeProvider } from './context/ThemeProvider';
// import { NotificationProvider } from './context/NotificationContext'; // For cross-service notifications

/**
 * The main entry point for the React E-commerce Storefront application.
 * This file sets up the root component, client-side routing, and any global context providers.
 *
 * It leverages React 18's `createRoot` API for improved performance and concurrent features.
 */

// Get the root DOM element where the React application will be mounted.
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to render the application.
if (!rootElement) {
  console.error('Error: Root element with ID "root" not found in the DOM. Please check client/public/index.html.');
  // In a production environment, you might want to display a user-friendly error page
  // or log this error to an external monitoring service.
} else {
  // Create a React root using ReactDOM.createRoot. This is the modern way to
  // render React applications starting with React 18.
  const root = ReactDOM.createRoot(rootElement);

  // Render the main application component within necessary wrappers.
  root.render(
    // React.StrictMode is a development tool that helps identify potential problems
    // in an application. It activates additional checks and warnings for its descendants.
    <React.StrictMode>
      {/*
        BrowserRouter enables client-side routing using the HTML5 history API.
        It allows the application to have multiple views without full page reloads.
      */}
      <BrowserRouter>
        {/*
          Optional: Wrap the App component with various context providers to make
          global state available throughout the component tree.
          Example structure for multiple providers:

          <AuthProvider>
            <CartProvider>
              <ThemeProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>

          These providers would manage state like user authentication, shopping cart contents,
          application theme, or global notifications (potentially from interconnected services
          like the AI-Powered Content Summarizer or Recipe & Meal Planner).
        */}
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// For older React versions (e.g., React 17 or below), you would use ReactDOM.render:
/*
import ReactDOM from 'react-dom';
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
*/