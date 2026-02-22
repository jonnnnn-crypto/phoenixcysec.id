"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, Award } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const achievements = [
    { icon: Trophy, title: "Top 10", desc: "LampungCTF Vol.2", year: "2024" },
    { icon: Award, title: "Top 20", desc: "WreckIT Competition", year: "2024" },
];

export default function Achievements() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".achievement-card", {
                y: 40,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%",
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="py-24 px-6 md:px-12 bg-charcoal-dark border-t border-white/5 relative overflow-hidden">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1">
                    <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-6">
                        Community <span className="text-phoenix">Achievements</span>
                    </h2>
                    <p className="text-white/60 font-sans font-light max-w-sm">
                        Membangun reputasi melalui dedikasi. Kami mendorong setiap anggota untuk terus membuktikan kemampuan di kancah nasional.
                    </p>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    {achievements.map((item, i) => (
                        <div
                            key={i}
                            className="achievement-card group relative p-8 bg-[#111] border border-white/5 flex flex-col items-center text-center hover:border-phoenix/50 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-phoenix/10 blur-xl group-hover:bg-phoenix/30 transition-all rounded-bl-full" />
                            <item.icon size={48} strokeWidth={1} className="text-phoenix mb-4" />
                            <h3 className="font-display text-4xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-white/70 font-mono text-sm">{item.desc}</p>
                            <span className="absolute bottom-4 right-4 text-white/20 font-mono text-xs">{item.year}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
