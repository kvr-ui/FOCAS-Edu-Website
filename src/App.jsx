import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegistrationSuccess from "./components/RegistrationSuccess";
import ExternalApp from "./components/external/ExternalApp";
import Rti from "./components/rti/Rti";
import RtiSuccess from "./components/rti/RtiSuccess";
import Manual from "./components/manual/Manual";
import ManualSuccess from "./components/manual/ManualSuccess";
import WorkoutBatch from "./components/Workout_batch/WorkoutBatch";
import WorkoutBatchSuccess from "./components/Workout_batch/Workoutbatchsuccess"
import CoursePage from "./components/external/CoursePage.jsx";
import Links from "./components/Links.jsx";
//import FOCASLandingPage from "./components/FOCASLandingPage";
const queryClient = new QueryClient();
const router = createBrowserRouter([
    { path: "/", element: <ExternalApp /> },
    { path: "/focas", element: <Index /> },
    {path: "/links", element: <Links />},
    { path: "/success", element: <RegistrationSuccess /> },
    {path: "/rti", element: <Rti />},
    {path: "/rti-success", element: <RtiSuccess />},
    {path: "/manual", element: <Manual />}, 
    {path:"/manual-success",element:<ManualSuccess />},
    {path:"/workout-batch",element:<WorkoutBatch />},
    {path:"/workout-batch-success",element:<WorkoutBatchSuccess />},
    { path: "/course/:id", element: <CoursePage /> },
    /*  {path:"/description",element:<FOCASLandingPage />}, */
    { path: "*", element: <NotFound /> },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});
const App = () => {
    useEffect(() => {
        const unsubscribe = router.subscribe((state) => {
            if (state.location && typeof window !== "undefined") {
                const fbq = window.fbq;
                if (fbq) {
                    fbq("track", "PageView");
                }
            }
        });
        return () => unsubscribe();
    }, []);
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router}/>
      </TooltipProvider>
    </QueryClientProvider>);
};
export default App;
