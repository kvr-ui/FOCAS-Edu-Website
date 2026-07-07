import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./../../external.css";
// Landing page components
const About = lazy(() => import("./About"));
const Courses = lazy(() => import("./Courses"));
const FAQ = lazy(() => import("./FAQ"));
const Feedback = lazy(() => import("./Feedback"));
const Footer = lazy(() => import("./Footer"));
const Header = lazy(() => import("./Header"));
const Hero = lazy(() => import("./Hero"));
const Stories = lazy(() => import("./Stories"));
const SuccessStories = lazy(() => import("./SuccessStories"));
const LoadingScreen = () => (<div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
  </div>);
// Top bar
const TopBar = () => (<div className="w-full bg-green-600 text-white text-center py-2 text-sm font-medium">
    CA Guru
  </div>);
const LandingPage = () => (<>
    <TopBar />
    <Header />
    <main className="w-full bg-white">
      <Hero />
      <Stories />
      <Courses />
      <About />
      <SuccessStories />
     <section className="mt-10">
       <Feedback />
     </section>
      <FAQ />
      <Footer />
    </main>
  </>);
const HomeWithPixel = () => (<>
 
    <LandingPage />
  </>);
const ExternalApp = () => {
    return (<Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route index element={<HomeWithPixel />}/>
      </Routes>
    </Suspense>);
};
export default ExternalApp;
