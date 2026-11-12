// Every page is lazy-loaded so each landing page only downloads its own code.
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { trackMetaPageViews } from "./lib/metaPageView";
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RegistrationSuccess = lazy(() => import("./components/RegistrationSuccess"));
const ExternalApp = lazy(() => import("./components/external/ExternalApp"));
const Rti = lazy(() => import("./components/rti/Rti"));
const RtiSuccess = lazy(() => import("./components/rti/RtiSuccess"));
const CareerGuidance = lazy(() => import("./components/career/CareerGuidance"));
const CareerGuidanceSuccess = lazy(() => import("./components/career/CareerGuidanceSuccess"));
const Audit = lazy(() => import("./components/audit/Audit"));
const AuditSuccess = lazy(() => import("./components/audit/AuditSuccess"));
const Manual = lazy(() => import("./components/manual/Manual"));
const ManualSuccess = lazy(() => import("./components/manual/ManualSuccess"));
const WorkoutBatch = lazy(() => import("./components/Workout_batch/WorkoutBatch"));
const WorkoutBatchSuccess = lazy(() => import("./components/Workout_batch/Workoutbatchsuccess"));
const CoursePage = lazy(() => import("./components/external/CoursePage.jsx"));
const Links = lazy(() => import("./components/Links.jsx"));
const MeetSchedule = lazy(() => import("./components/MeetSchedule.jsx"));
const PaymentPage = lazy(() => import("./components/PaymentPage.jsx"));
const MentorCounselling = lazy(() => import("./components/MentorCounselling.jsx"));
const MentorCounsellingSuccess = lazy(() => import("./components/MentorCounsellingSuccess.jsx"));
const Counselling = lazy(() => import("./components/counselling/Counselling"));
const CounsellingBook = lazy(() => import("./components/counselling/CounsellingBook"));
const CounsellingSuccess = lazy(() => import("./components/counselling/CounsellingSuccess"));
const FoundationSchool = lazy(() => import("./components/fs/FoundationSchool"));
const FsBook = lazy(() => import("./components/fs/FsBook"));
const FsSuccess = lazy(() => import("./components/fs/FsSuccess"));
const FsParents = lazy(() => import("./components/fs/FsParents"));
const F2fClass = lazy(() => import("./components/f2f/F2fClass"));
const F2fClassSuccess = lazy(() => import("./components/f2f/F2fClassSuccess"));
//import FOCASLandingPage from "./components/FOCASLandingPage";
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
    // Toaster / Tooltip / React Query providers were removed: nothing in the
    // app uses them, and they added ~100 KB to every page's first load.
    return (<Suspense fallback={null}>
      <RouterProvider router={router}/>
    </Suspense>);
};
export default App;
