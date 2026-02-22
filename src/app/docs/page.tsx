"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Terminal, Shield, Lock, ShieldAlert, Users } from "lucide-react";

const categories = [
    { name: "Beginner Cybersecurity", icon: BookOpen, desc: "Fundamental concepts and starting points." },
    { name: "Web Security", icon: Terminal, desc: "OWASP Top 10, exploitation and mitigation." },
    { name: "Linux Security", icon: Lock, desc: "Hardening, user management, and services." },
    { name: "Bug Hunting Guide", icon: ShieldAlert, desc: "Methodologies and tools for finding bugs." },
    { name: "Responsible Disclosure", icon: Shield, desc: "How to report vulnerabilities safely." },
    { name: "Community Rules", icon: Users, desc: "Code of conduct and guidelines." },
];

export default function DocsPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark relative">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16 relative z-10">
                    <h1 className="font-display font-medium text-4xl md:text-6xl text-white mb-6">
                        Phoenix <span className="text-phoenix">Knowledge Base</span>
                    </h1>
                    <p className="text-white/60 font-sans max-w-2xl mx-auto text-lg mb-10 font-light">
                        Comprehensive documentation covering cybersecurity fundamentals, advanced tactics, and community guidelines. Available publicly for everyone.
                    </p>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40 group-focus-within:text-phoenix transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 outline-none focus:border-phoenix text-white pl-12 pr-4 py-4 font-mono transition-all shadow-xl rounded-sm"
                            placeholder="Search documentation, writeups, tutorials..."
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(category => (
                        <Link
                            key={category.name}
                            href={`/docs/${category.name.toLowerCase().replace(/ /g, '-')}`}
                            className="p-8 bg-[#151515] border border-white/5 hover:border-phoenix/50 transition-colors group relative overflow-hidden flex flex-col items-start gap-4"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-phoenix/5 blur-2xl group-hover:bg-phoenix/20 transition-all rounded-bl-full" />

                            <div className="w-12 h-12 bg-charcoal flex items-center justify-center border border-white/10 group-hover:border-phoenix/30 transition-colors">
                                <category.icon size={20} className="text-white/70 group-hover:text-phoenix transition-colors" />
                            </div>

                            <div>
                                <h3 className="font-display font-medium text-white text-xl mb-2">{category.name}</h3>
                                <p className="text-white/50 text-sm font-light font-sans leading-relaxed">{category.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
