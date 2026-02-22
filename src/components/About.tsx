"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, GraduationCap, Calendar, MapPin, Award } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".about-header", {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            });

            gsap.from(".about-card", {
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".about-grid",
                    start: "top 75%",
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="about"
            ref={containerRef}
            className="py-32 px-6 md:px-12 bg-[#0d0d0d] relative overflow-hidden"
        >
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-phoenix/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <div className="about-header mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-xs font-mono tracking-widest uppercase mb-6">
                        <MapPin size={12} />
                        Identity & Mission
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-8 tracking-tight">
                        Rooted in <span className="text-phoenix">Lampung Barat.</span><br />
                        Global Cybersecurity Vision.
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <p className="text-xl text-white/70 font-light leading-relaxed">
                            Bermula dari semangat untuk memperkuat kedaulatan digital di tanah kelahiran,
                            <span className="text-white font-medium"> PhoenixCySec</span> lahir sebagai pusat edukasi
                            keamanan siber yang berfokus pada pengembangan talenta lokal menuju standar industri global.
                        </p>
                        <p className="text-lg text-white/50 font-light leading-relaxed">
                            Kami percaya bahwa keamanan digital adalah hak semua orang. Sejak berdiri pada tahun <span className="text-white">2025</span>,
                            kami telah konsisten mengajar dasar-dasar cyber security hingga teknik lanjut, membantu para
                            pembelajar bertransformasi menjadi profesional yang tangguh.
                        </p>
                    </div>
                </div>

                <div className="about-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="about-card p-8 bg-charcoal border border-white/5 hover:border-phoenix/30 transition-all flex flex-col gap-4">
                        <div className="p-3 bg-phoenix/10 text-phoenix rounded-lg w-fit">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white">Est. 2025</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Didirikan dengan visi modernitas sejak awal, mencakup segala elemen infrastruktur digital masa kini.
                        </p>
                    </div>

                    <div className="about-card p-8 bg-charcoal border border-white/5 hover:border-phoenix/30 transition-all flex flex-col gap-4">
                        <div className="p-3 bg-phoenix/10 text-phoenix rounded-lg w-fit">
                            <GraduationCap size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white">Expert Training</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Kurikulum kami dirancang dan diajarkan langsung oleh praktisi yang telah berpengalaman bertahun-tahun di bidangnya.
                        </p>
                    </div>

                    <div className="about-card p-8 bg-charcoal border border-white/5 hover:border-phoenix/30 transition-all flex flex-col gap-4">
                        <div className="p-3 bg-phoenix/10 text-phoenix rounded-lg w-fit">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white">Professional Growth</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Tujuan utama kami adalah mencetak profesional cybersecurity yang siap terjun langsung ke industri nasional maupun internasional.
                        </p>
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-white/5 flex flex-wrap gap-8 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white italic">"Learn. Secure. Rise."</span>
                            <span className="text-xs font-mono text-white/30 tracking-widest uppercase">The Phoenix Philosophy</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
