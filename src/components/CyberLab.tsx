"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Terminal, Shield, Lock, Server } from "lucide-react";

const features = [
    { icon: Terminal, title: "Beginner CTF", desc: "Start with simple challenges to build fundamentals." },
    { icon: Server, title: "Web Exploitation", desc: "Practice SQLi, XSS, and logic flaws safely." },
    { icon: Lock, title: "Privilege Escalation", desc: "Master Linux and Windows local privesc vectors." },
    { icon: Shield, title: "Hands-on Exercises", desc: "Interactive environments ready to break." },
];

export default function CyberLab() {
    const sectionRef = useRef(null);
    const terminalRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from(".lab-card", {
                y: 40,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                }
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="lab" className="py-24 px-6 md:px-12 bg-[#0d0d0d] border-t border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">

                {/* Left Content */}
                <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-xs font-mono tracking-widest uppercase mb-4">
                        <span className="w-2 h-2 rounded-full bg-phoenix animate-pulse" />
                        Live Environment
                    </div>

                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                        Phoenix Cyber Lab
                    </h2>

                    <p className="text-white/60 text-lg max-w-xl font-light">
                        Practice real cybersecurity scenarios in controlled environments.
                        Test your skills against deliberate vulnerabilities without legal risks.
                    </p>

                    <Link href="https://webphoenix.vercel.app" target="_blank" className="inline-block px-8 py-4 bg-charcoal-light border border-white/10 text-white font-mono text-sm hover:border-phoenix hover:bg-phoenix hover:text-white transition-all shadow-xl group">
                        Access Terminal <span className="inline-block transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                        {features.map((f, i) => (
                            <div key={i} className="lab-card flex gap-4 items-start">
                                <div className="p-3 rounded-lg bg-charcoal text-phoenix border border-white/5">
                                    <f.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-1">{f.title}</h3>
                                    <p className="text-white/50 text-sm">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Terminal Preview */}
                <div
                    className="flex-1 w-full max-w-xl aspect-[4/3] rounded-xl border border-white/10 bg-charcoal shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {/* Terminal Header */}
                    <div className="w-full h-8 bg-[#1a1a1a] border-b border-white/10 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        <span className="mx-auto text-xs font-mono text-white/30 truncate">root@phoenix-lab:~</span>
                    </div>

                    {/* Terminal Body */}
                    <div ref={terminalRef} className="p-6 font-mono text-sm text-green-400/80 h-full flex flex-col gap-2">
                        <p>Welcome to PhoenixCySec Lab Environment v1.0.4</p>
                        <p className="mt-2">$ nmap -sC -sV target.local</p>
                        {hovered && (
                            <div className="mt-4 animate-pulse duration-75 select-none">
                                <p>Starting Nmap 7.93 ( https://nmap.org )</p>
                                <p>Nmap scan report for target.local (192.168.1.100)</p>
                                <p>Host is up (0.0010s latency).</p>
                                <p>22/tcp open  ssh     OpenSSH 8.2p1</p>
                                <p>80/tcp open  http    Apache httpd 2.4.41</p>
                                <p className="text-phoenix mt-4">_ System compromised _</p>
                                <p className="mt-2 animate-bounce"># <span className="w-2 h-4 bg-green-400 inline-block align-middle" /></p>
                            </div>
                        )}
                        {!hovered && (
                            <p className="mt-2 blink"># <span className="w-2 h-4 bg-green-400 inline-block align-middle animate-pulse" /></p>
                        )}
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/50 to-transparent pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
