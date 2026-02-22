import Hero from "@/components/Hero";
import Statement from "@/components/Statement";

import Achievements from "@/components/Achievements";
import Partnerships from "@/components/Partnerships";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />

      <Achievements />
      <Partnerships />
      <CTA />
    </>
  );
}
