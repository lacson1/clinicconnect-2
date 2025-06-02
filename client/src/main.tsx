import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling and logging
console.log("Attempting to load React application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = '<div style="padding: 40px; font-family: Arial; background: linear-gradient(135deg, #1e3a8a, #3730a3); color: white; text-align: center;"><h1>🏥 Bluequee Healthcare</h1><p>Error: Application container not found</p></div>';
} else {
  console.log("Root element found, mounting React app...");
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("✅ Healthcare platform loaded successfully!");
  } catch (error) {
    console.error("❌ Error loading healthcare platform:", error);
    document.body.innerHTML = `<div style="padding: 40px; font-family: Arial; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-align: center;">
      <h1>🏥 Bluequee Healthcare</h1>
      <h2>Application Error</h2>
      <p>Unable to start the healthcare management system.</p>
      <details style="margin-top: 20px; text-align: left; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
        <summary>Technical Details</summary>
        <pre style="margin-top: 10px; font-size: 12px;">${error}</pre>
      </details>
    </div>`;
  }
}
