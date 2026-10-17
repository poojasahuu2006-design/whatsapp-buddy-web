import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import LiveDemo from '@/components/LiveDemo';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-ink-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <LiveDemo />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
