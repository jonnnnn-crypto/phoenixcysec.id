import Hero from "@/components/Hero";
import About from "@/components/About";
import Statement from "@/components/Statement";

import Achievements from "@/components/Achievements";
import Partnerships from "@/components/Partnerships";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Statement />

      <Achievements />
      <Partnerships />
      <CTA />
    </>
  );
}
