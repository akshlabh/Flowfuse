import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Appbar />
      <Hero />
      <HowItWorks />

    </main>
  );
};

export default Index;
