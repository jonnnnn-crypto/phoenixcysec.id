"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Statement() {
    const cRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".statement-line", {
                y: 40,
                opacity: 0,
                stagger: 0.2,
                ease: "power3.out",
                duration: 1,
                scrollTrigger: {
                    trigger: cRef.current,
                    start: "top 80%",
                }
            });

            gsap.from(".statement-vision", {
                opacity: 0,
                filter: "blur(10px)",
                duration: 1.5,
                delay: 0.5,
                scrollTrigger: {
                    trigger: cRef.current,
                    start: "top 70%",
                }
            });
        }, cRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={cRef} className="py-32 px-6 md:px-12 bg-charcoal-dark relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="max-w-5xl mx-auto z-10">
                <h2 className="font-display font-medium text-4xl md:text-6xl text-white leading-tight mb-8">
                    <div className="statement-line overflow-hidden py-1">Knowledge Builds Defense.</div>
                    <div className="statement-line overflow-hidden py-1 text-white/70">Practice Builds Skill.</div>
                    <div className="statement-line overflow-hidden py-1 text-phoenix font-bold pt-2 drop-shadow-lg" style={{ textShadow: "0 0 20px rgba(59,130,246,0.5)" }}>Contribution Builds Reputation.</div>
                </h2>

                <div className="w-24 h-1 bg-phoenix/50 mx-auto my-12" />

                <p className="statement-vision text-xl md:text-2xl text-white/60 font-sans max-w-3xl mx-auto font-light leading-relaxed">
                    Membangun talenta cybersecurity dari daerah menuju standar global. <br className="hidden md:block" />
                    <span className="text-white/80">Belajar, berlatih, dan berkontribusi.</span>
                </p>
            </div>

            {/* Background accents */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-phoenix/5 rounded-full blur-[120px] -z-0 pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[120px] -z-0 pointer-events-none" />
        </section>
    );
}
