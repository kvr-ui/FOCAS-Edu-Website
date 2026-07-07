import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StickyCTA from "@/components/StickyCTA";
// Lazy-load below-the-fold sections to reduce initial bundle
const SuccessStories = lazy(() => import("@/components/SuccessStories"));
const CareerGrowthSection = lazy(() => import("@/components/CareerGrowthSection"));
const DesignedForSection = lazy(() => import("@/components/DesignedForSection"));
const CertificateSection = lazy(() => import("@/components/CertificateSection"));
const BeforeAfterSection = lazy(() => import("@/components/BeforeAfterSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Index = () => {
    return (<div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <SuccessStories />
          <CareerGrowthSection />
          <DesignedForSection />
          <CertificateSection />
          <BeforeAfterSection />
          <FAQSection />
        </Suspense>
      </main>
      <StickyCTA />
    </div>);
};
export default Index;
