"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, GraduationCap, Calendar, MapPin, ShieldCheck, Target, Zap, Globe2, Briefcase, Award } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // General reveal
            gsap.from(".about-reveal", {
                y: 50,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            });

            // Card stagger
            gsap.from(".about-card", {
                y: 30,
                opacity: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".about-grid",
                    start: "top 75%",
                }
            });

            // Timeline line expansion
            gsap.from(".timeline-line", {
                height: 0,
                duration: 1.5,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: ".timeline-container",
                    start: "top 70%",
                }
            });

            // Timeline points
            gsap.from(".timeline-item", {
                x: -30,
                opacity: 0,
                stagger: 0.3,
                duration: 1,
                scrollTrigger: {
                    trigger: ".timeline-container",
                    start: "top 60%",
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
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-phoenix/20 to-transparent" />
            <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-phoenix/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-5 background-grid-pattern opacity-5" />

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="about-reveal mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-xs font-mono tracking-widest uppercase mb-6">
                        <MapPin size={12} />
                        Rooted Identity
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-10 tracking-tight leading-[1.1]">
                        Pioneering from <span className="text-phoenix">Lampung Barat.</span><br />
                        Securing the Future.
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-6">
                            <p className="text-2xl text-white/80 font-light leading-relaxed italic border-l-2 border-phoenix pl-8">
                                "Lahir dari semangat lokal untuk menjawab tantangan keamanan siber global."
                            </p>
                            <p className="text-lg text-white/60 font-light leading-relaxed">
                                Memulai perjalanan di Lampung Barat, PhoenixCySec bukan sekadar komunitas hobi.
                                Kami adalah gerakan akar rumput yang percaya bahwa talenta teknologi berkualitas
                                bisa muncul dari mana saja, selama diberikan fondasi yang tepat.
                            </p>
                        </div>
                        <div className="space-y-6 pt-2">
                            <p className="text-lg text-white/50 font-light leading-relaxed pl-4 border-l border-white/10">
                                Sejak resmi berdiri pada tahun <span className="text-white font-medium">2025</span>,
                                kami mendedikasikan diri untuk mentransformasi antusiasme menjadi keahlian profesional
                                melalui kurikulum yang keras, praktis, dan terukur.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-8">
                                <span className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest">Ethical Hacking</span>
                                <span className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest">Digital Defense</span>
                                <span className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest">Community Driven</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Pillars Grid */}
                <div className="about-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="about-card p-10 bg-[#111] border border-white/5 hover:border-phoenix/50 transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-white/5 rotate-12 group-hover:text-phoenix/10 transition-colors">
                            <Calendar size={120} />
                        </div>
                        <div className="p-4 bg-phoenix/10 text-phoenix rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                            <Calendar size={28} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">Established 2025</h3>
                        <p className="text-white/50 text-sm leading-relaxed font-light">
                            Dibangun di era digital yang semakin kompleks, kami mengadopsi standar keamanan
                            paling mutakhir untuk memastikan relevansi kurikulum bagi setiap anggota.
                        </p>
                    </div>

                    <div className="about-card p-10 bg-[#111] border border-white/5 hover:border-phoenix/50 transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-white/5 rotate-12 group-hover:text-phoenix/10 transition-colors">
                            <GraduationCap size={120} />
                        </div>
                        <div className="p-4 bg-phoenix/10 text-phoenix rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap size={28} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">Expert Mentorship</h3>
                        <p className="text-white/50 text-sm leading-relaxed font-light">
                            Bimbingan intensif dari praktisi berpengalaman yang telah berkecimpung dalam
                            berbagai skenario pertahanan siber di industri nyata selama bertahun-tahun.
                        </p>
                    </div>

                    <div className="about-card p-10 bg-[#111] border border-white/5 hover:border-phoenix/50 transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-white/5 rotate-12 group-hover:text-phoenix/10 transition-colors">
                            <Users size={120} />
                        </div>
                        <div className="p-4 bg-phoenix/10 text-phoenix rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">Elite Professionals</h3>
                        <p className="text-white/50 text-sm leading-relaxed font-light">
                            Fokus kami bukan pada kuantitas, melainkan kualitas lulusan yang memiliki
                            etika tinggi dan kemampuan teknis yang siap diadu di level nasional.
                        </p>
                    </div>
                </div>

                {/* Core Values Section */}
                <div className="mb-32">
                    <div className="about-reveal flex flex-col items-center text-center mb-16">
                        <span className="text-phoenix font-mono text-[10px] tracking-[0.3em] uppercase mb-4">The Ethical Framework</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight">Our Core Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: ShieldCheck, title: "Integrity", desc: "Etika tinggi adalah harga mati dalam setiap baris kode dan aksi digital." },
                            { icon: Zap, title: "Resilience", desc: "Mampu bertahan dan beradaptasi di tengah serangan siber yang terus berevolusi." },
                            { icon: Globe2, title: "Collaboration", desc: "Pengetahuan hanya akan bernilai jika dibagikan untuk kepentingan pertahanan bersama." },
                            { icon: Target, title: "Precision", desc: "Detail kecil adalah perbedaan antara sistem yang aman dan sistem yang runtuh." }
                        ].map((val, i) => (
                            <div key={i} className="about-reveal p-8 border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                                <val.icon className="text-phoenix mb-4" size={24} />
                                <h4 className="text-lg font-display font-bold text-white mb-2">{val.title}</h4>
                                <p className="text-xs text-white/40 leading-relaxed font-light">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* The Journey Timeline */}
                <div className="mb-32 timeline-container">
                    <div className="about-reveal mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight text-center lg:text-left">
                            The <span className="text-phoenix">Journey</span> Roadmap
                        </h2>
                    </div>

                    <div className="relative pl-8 md:pl-0">
                        {/* Center line (visible on md+) */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 timeline-line" />

                        <div className="space-y-24">
                            {[
                                {
                                    year: "2025",
                                    title: "Lahirnya Visi",
                                    desc: "Inisiasi PhoenixCySec di Lampung Barat dengan fokus pada edukasi dasar dan pembentukan kurikulum inti.",
                                    side: "left"
                                },
                                {
                                    year: "2026",
                                    title: "Ekspansi Lab",
                                    desc: "Peluncuran platform CTF mandiri dan kolaborasi dengan berbagai instansi untuk simulasi serangan siber nyata.",
                                    side: "right"
                                },
                                {
                                    year: "2027",
                                    title: "Standar Nasional",
                                    desc: "Membangun ekosistem profesional siber yang diakui secara nasional sebagai penyedia talenta berkualitas.",
                                    side: "left"
                                }
                            ].map((item, i) => (
                                <div key={i} className={`relative flex flex-col md:flex-row items-center ${item.side === 'right' ? 'md:flex-row-reverse' : ''} timeline-item`}>
                                    {/* Timeline point */}
                                    <div className="absolute left-[-32px] md:left-1/2 top-0 w-8 h-8 bg-[#0d0d0d] border-2 border-phoenix rounded-full -translate-x-1/2 z-10 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-phoenix animate-pulse rounded-full" />
                                    </div>

                                    <div className={`w-full md:w-1/2 px-4 md:px-12 ${item.side === 'left' ? 'md:text-right' : 'md:text-left'}`}>
                                        <span className="text-5xl font-display font-black text-white/5 mb-2 block">{item.year}</span>
                                        <h4 className="text-xl font-display font-bold text-phoenix mb-2 uppercase tracking-wide">{item.title}</h4>
                                        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto md:mx-0 ${item.side === 'left' ? 'md:ml-auto' : 'md:mr-auto'} font-light">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="hidden md:block w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Impact Vision */}
                <div className="about-reveal p-12 md:p-20 bg-gradient-to-br from-phoenix/10 to-transparent border border-phoenix/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 overflow-hidden opacity-5 pointer-events-none">
                        <ShieldCheck size={400} />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center text-center lg:text-left">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight">Our Impact Vision</h2>
                            <p className="text-xl text-white/70 font-light leading-relaxed">
                                Mencetak 100+ profesional cybersecurity bersertifikat setiap tahunnya, yang tidak hanya ahli secara teknis tetapi juga memegang teguh komitmen moral dalam melindungi infrastruktur digital Indonesia.
                            </p>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="p-6 bg-[#000]/50 border border-white/5">
                                <Briefcase className="text-phoenix mb-2" size={24} />
                                <div className="text-3xl font-display font-bold text-white">100+</div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Graduated Professionals / Year</div>
                            </div>
                            <div className="p-6 bg-[#000]/50 border border-white/5">
                                <Award className="text-phoenix mb-2" size={24} />
                                <div className="text-3xl font-display font-bold text-white">100%</div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Industry Relevance Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Quote */}
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-wrap gap-8 items-center justify-between opacity-80">
                    <div className="flex items-center gap-6 about-reveal">
                        <div className="flex flex-col">
                            <span className="text-3xl md:text-4xl font-display font-bold text-white italic tracking-tight">&quot;Learn. Secure. Rise.&quot;</span>
                            <span className="text-xs font-mono text-phoenix/60 tracking-[0.4em] uppercase pt-2">The Phoenix Philosophy</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-white/30 about-reveal">
                        <span>PHOENIXCYSEC // VERSION 1.1</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}


