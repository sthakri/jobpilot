import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { DashboardPreview } from "@/components/homepage/DashboardPreview";
import { JobSearchFeatures } from "@/components/homepage/JobSearchFeatures";
import { ConfidenceFeatures } from "@/components/homepage/ConfidenceFeatures";
import { Testimonial } from "@/components/homepage/Testimonial";
import { BottomCta } from "@/components/homepage/BottomCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <DashboardPreview />
        <JobSearchFeatures />
        <ConfidenceFeatures />
        <Testimonial />
        <BottomCta />
      </main>
      <Footer />
    </>
  );
}
