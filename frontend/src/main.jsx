import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
<<<<<<< HEAD
import { getAppBasePath } from "./utils/appUrl";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={getAppBasePath()}>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={2000} />
    </AuthProvider>
=======
import { ThemeProvider } from "./context/ThemeContext";
import { APP_BASE_PATH } from "./utils/appPaths";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={APP_BASE_PATH}>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2000} />
      </AuthProvider>
    </ThemeProvider>
>>>>>>> 1f0654a052122a3098ced2a5273f94eeceb25b52
  </BrowserRouter>
);
