import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { trackMetaPageViews } from "./lib/metaPageView";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegistrationSuccess from "./components/RegistrationSuccess";
import ExternalApp from "./components/external/ExternalApp";
import Rti from "./components/rti/Rti";
import RtiSuccess from "./components/rti/RtiSuccess";
import CareerGuidance from "./components/career/CareerGuidance";
import CareerGuidanceSuccess from "./components/career/CareerGuidanceSuccess";
import Audit from "./components/audit/Audit";
import AuditSuccess from "./components/audit/AuditSuccess";
import Manual from "./components/manual/Manual";
import ManualSuccess from "./components/manual/ManualSuccess";
import WorkoutBatch from "./components/Workout_batch/WorkoutBatch";
import WorkoutBatchSuccess from "./components/Workout_batch/Workoutbatchsuccess"
import CoursePage from "./components/external/CoursePage.jsx";
import Links from "./components/Links.jsx";
import MeetSchedule from "./components/MeetSchedule.jsx";
import PaymentPage from "./components/PaymentPage.jsx";
import MentorCounselling from "./components/MentorCounselling.jsx";
import MentorCounsellingSuccess from "./components/MentorCounsellingSuccess.jsx";
import Counselling from "./components/counselling/Counselling";
import CounsellingBook from "./components/counselling/CounsellingBook";
import CounsellingSuccess from "./components/counselling/CounsellingSuccess";
import FoundationSchool from "./components/fs/FoundationSchool";
import FsBook from "./components/fs/FsBook";
import FsSuccess from "./components/fs/FsSuccess";
import FsParents from "./components/fs/FsParents";
import F2fClass from "./components/f2f/F2fClass";
import F2fClassSuccess from "./components/f2f/F2fClassSuccess";
//import FOCASLandingPage from "./components/FOCASLandingPage";
const queryClient = new QueryClient();
const PrivacyPolicyRedirect = () => {
    useEffect(() => {
        window.location.replace("/privacy-policy.html");
    }, []);
    return null;
};
const router = createBrowserRouter([
    { path: "/", element: <ExternalApp /> },
    { path: "/focas", element: <Index /> },
    {path: "/links", element: <Links />},
    { path: "/meet", element: <MeetSchedule /> },
    { path: "/payment", element: <PaymentPage /> },
    { path: "/success", element: <RegistrationSuccess /> },
    {path: "/mentor-counselling", element: <MentorCounselling />},
    {path: "/mentor-counselling-success", element: <MentorCounsellingSuccess />},
    {path: "/counselling", element: <Counselling />},
    {path: "/counselling/book", element: <CounsellingBook />},
    {path: "/counselling-success", element: <CounsellingSuccess />},
    {path: "/f2f-class", element: <F2fClass />},
    {path: "/f2f-class-success", element: <F2fClassSuccess />},
    {path: "/rti", element: <Rti />},
    {path: "/rti-success", element: <RtiSuccess />},
    {path: "/career-guidance", element: <CareerGuidance />},
    {path: "/career-guidance-success", element: <CareerGuidanceSuccess />},
    {path: "/audit", element: <Audit />},
    {path: "/audit-success", element: <AuditSuccess />},
    {path: "/manual", element: <Manual />}, 
    {path:"/manual-success",element:<ManualSuccess />},
    {path:"/workout-batch",element:<WorkoutBatch />},
    {path:"/workout-batch-success",element:<WorkoutBatchSuccess />},
    {path: "/course/:id", element: <CoursePage /> },
    {path: "/privacy-policy", element: <PrivacyPolicyRedirect /> },
    {path:"/fs",element:<FoundationSchool />},
    {path:"/fs/book",element:<FsBook />},
    {path:"/fs/parents",element:<FsParents />},
    {path:"/fs/success",element:<FsSuccess />},
    {path:"/fs/students/success",element:<RegistrationSuccess />},
    {path:"/fs/parents/success",element:<RegistrationSuccess />},
    /*  {path:"/description",element:<FOCASLandingPage />}, */
    { path: "*", element: <NotFound /> },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});
const App = () => {
    useEffect(() => trackMetaPageViews(router), []);
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router}/>
      </TooltipProvider>
    </QueryClientProvider>);
};
export default App;
