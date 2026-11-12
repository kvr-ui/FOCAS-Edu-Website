import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// After a new deploy, a tab that is still open may request page files from the
// previous build that no longer exist. Reload once to pick up the new build
// instead of showing an error screen.
window.addEventListener("vite:preloadError", (event) => {
  const key = "vite-preload-reload-at";
  const last = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - last < 10000) return; // just reloaded and still failing: don't loop
  sessionStorage.setItem(key, String(Date.now()));
  event.preventDefault();
  window.location.reload();
});
createRoot(document.getElementById("root")).render(<App />);
