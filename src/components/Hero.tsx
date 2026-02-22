"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadRef = useRef<HTMLParagraphElement>(null);
    const btnsRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Background parallax/slow motion effect
            gsap.to(bgRef.current, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            });

            // Text stagger reveal on load
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            tl.fromTo(
                headlineRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.5, delay: 0.2 }
            )
                .fromTo(
                    subheadRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1.2 },
                    "-=1"
                )
                .fromTo(
                    btnsRef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 1 },
                    "-=0.8"
                );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-charcoal-dark -mt-20"
        >
            <div
                ref={bgRef}
                className="absolute inset-0 z-0 scale-[1.1]"
            >
                <Image
                    src="/hero-bg.png"
                    alt="PhoenixCySec Hero"
                    fill
                    priority
                    className="object-cover object-center opacity-40 mix-blend-luminosity brightness-75"
                />
                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark via-transparent to-charcoal-dark/50 z-10" />
            </div>

            <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-20">
                <Link
                    href="https://webphoenix.vercel.app"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-[10px] font-mono tracking-widest uppercase mb-6 hover:bg-phoenix/20 transition-all group"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-phoenix animate-pulse" />
                    Live CTF Platform <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>

                <h1
                    ref={headlineRef}
                    className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white mb-6 drop-shadow-2xl"
                    style={{ textShadow: "0 0 40px rgba(255, 21, 0, 0.2)" }}
                >
                    Start From Zero.<br />
                    <span className="text-phoenix">Become Cyber Ready.</span>
                </h1>

                <p
                    ref={subheadRef}
                    className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mb-10 font-light"
                >
                    Learn cybersecurity through community, real practice, and ethical hacking contribution.
                </p>

                <div ref={btnsRef} className="flex flex-col sm:flex-row items-center gap-6">
                    <Link
                        href="/join"
                        className="px-8 py-4 bg-phoenix text-white font-mono uppercase tracking-wider text-sm font-semibold hover:bg-phoenix-light transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]"
                    >
                        Join Community
                    </Link>
                    <Link
                        href="https://webphoenix.vercel.app"
                        target="_blank"
                        className="px-8 py-4 border border-white/20 text-white font-mono uppercase tracking-wider text-sm font-semibold hover:bg-white/5 transition-all"
                    >
                        Enter PHX CTF
                    </Link>
                </div>
            </div>
        </section>
    );
}
