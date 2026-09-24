import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FoundationSchool from "./components/fs/FoundationSchool";
import FsBook from "./components/fs/FsBook";
import FsSuccess from "./components/fs/FsSuccess";
import FsParents from "./components/fs/FsParents";
import RegistrationSuccess from "./components/RegistrationSuccess";
import "./index.css";

// Standalone entry for the Foundation for School Students flow only
// (built with vite.fs.config.js → dist-fs/). The domain root serves the
// landing page; /fs is kept so the in-app links keep working.
const router = createBrowserRouter([
  { path: "/", element: <FoundationSchool /> },
  { path: "/fs", element: <FoundationSchool /> },
  { path: "/fs/book", element: <FsBook /> },
  { path: "/fs/parents", element: <FsParents /> },
  { path: "/fs/success", element: <FsSuccess /> },
  // /fs/book ends here after paying ₹9 or skipping — same page as /focas.
  { path: "/success", element: <RegistrationSuccess /> },
  { path: "*", element: <FoundationSchool /> },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
