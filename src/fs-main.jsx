import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FoundationSchool from "./components/fs/FoundationSchool";
import FsBook from "./components/fs/FsBook";
import FsSuccess from "./components/fs/FsSuccess";
import "./index.css";

// Standalone entry for the Foundation for School Students flow only
// (built with vite.fs.config.js → dist-fs/). The domain root serves the
// landing page; /fs is kept so the in-app links keep working.
const router = createBrowserRouter([
  { path: "/", element: <FoundationSchool /> },
  { path: "/fs", element: <FoundationSchool /> },
  { path: "/fs/book", element: <FsBook /> },
  { path: "/fs/success", element: <FsSuccess /> },
  { path: "*", element: <FoundationSchool /> },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
