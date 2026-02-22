"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase";

gsap.registerPlugin(ScrollTrigger);

type Partner = {
    id: string;
    name: string;
    website: string;
    category: string;
    description: string;
};

export default function Partnerships() {
    const containerRef = useRef(null);
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('partners').select('*').order('name');
            if (data) {
                setPartners(data as Partner[]);
            }
        };

        fetchPartners();
    }, []);

    useEffect(() => {
        if (partners.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.from(".partner-card", {
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 0.8,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, [partners]);

    return (
        <section id="partnerships" ref={containerRef} className="py-24 px-6 md:px-12 bg-charcoal border-t border-white/5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Partnership Ecosystem</h2>
                <p className="text-white/60 max-w-2xl mx-auto text-lg font-light mb-16">
                    Collaborating with organizations supporting cybersecurity education and responsible disclosure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {partners.length === 0 ? (
                        <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                            <ShieldAlert className="mx-auto text-white/20 mb-4" size={48} />
                            <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Awaiting strategic alliances. No partners configured.</p>
                        </div>
                    ) : (
                        partners.map((p) => (
                            <a
                                href={p.website || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={p.id}
                                className="partner-card block bg-[#151515] border border-white/10 p-8 text-left hover:border-phoenix/50 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-phoenix to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-charcoal-light flex items-center justify-center border border-white/10 group-hover:border-phoenix/50 transition-colors">
                                        <span className="font-display font-bold text-white/80 group-hover:text-phoenix transition-colors">{p.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{p.name}</h3>
                                        <span className="text-xs font-mono text-phoenix">{p.category}</span>
                                    </div>
                                    <Link2 size={16} className="text-white/20 ml-auto group-hover:text-phoenix transition-colors relative z-10" />
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">{p.description || "Strategic ecosystem partner."}</p>
                            </a>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
