"use client";

import React, { useState } from "react";
import { Terminal, Shield, Lock, Server, Cpu, Globe, Zap, Search } from "lucide-react";
import Link from "next/link";

const labCategories = ["All", "Web", "Infrastructure", "Reversing", "Forensics"];

const labs = [
    {
        id: 1,
        title: "Empire State of Web",
        category: "Web",
        difficulty: "Easy",
        desc: "Learn basic SQL injection and session hijacking in this retail-themed lab.",
        icon: Globe,
        status: "Active",
        points: 50
    },
    {
        id: 2,
        title: "Buffer Overflow 101",
        category: "Reversing",
        difficulty: "Medium",
        desc: "Exploit a vulnerable C binary to execute your first shellcode.",
        icon: Cpu,
        status: "Active",
        points: 150
    },
    {
        id: 3,
        title: "Shadow Domain",
        category: "Infrastructure",
        difficulty: "Hard",
        desc: "Pivot through a corporate network and gain Domain Admin rights.",
        icon: Server,
        status: "Maintenance",
        points: 300
    },
    {
        id: 4,
        title: "Packet Whisperer",
        category: "Forensics",
        difficulty: "Easy",
        desc: "Analyze Wireshark captures to find hidden credentials.",
        icon: Shield,
        status: "Active",
        points: 75
    },
    {
        id: 5,
        title: "The API Breach",
        category: "Web",
        difficulty: "Medium",
        desc: "Identify and exploit broken object level authorization (BOLA).",
        icon: Zap,
        status: "Active",
        points: 125
    },
    {
        id: 6,
        title: "Kernel Crusher",
        category: "Reversing",
        difficulty: "Insane",
        desc: "Exploit a race condition in a custom Linux kernel module.",
        icon: Lock,
        status: "Coming Soon",
        points: 500
    },
];

export default function LabPage() {
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLabs = labs.filter(lab =>
        (filter === "All" || lab.category === filter) &&
        (lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lab.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-charcoal-dark pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-phoenix/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-xs font-mono tracking-widest uppercase mb-4">
                        <span className="w-2 h-2 rounded-full bg-phoenix animate-pulse" />
                        Virtual Training Ground
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-medium text-white mb-6">
                        Cyber <span className="text-phoenix">Lab</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl font-light leading-relaxed">
                        Pilih lingkungan simulasi Anda. Semua lab berjalan di container terisolasi
                        untuk memberikan pengalaman praktik yang aman namun nyata.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-charcoal/50 p-4 border border-white/5 rounded-xl backdrop-blur-sm">
                    <div className="flex flex-wrap gap-2">
                        {labCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-all ${filter === cat
                                    ? "bg-phoenix border-phoenix text-white shadow-[0_0_15px_rgba(255,21,0,0.3)]"
                                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-charcoal border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white font-mono text-sm focus:outline-none focus:border-phoenix/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Lab Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLabs.map((lab) => (
                        <div
                            key={lab.id}
                            className="group bg-[#111] border border-white/10 p-8 hover:border-phoenix/30 transition-all relative overflow-hidden flex flex-col h-full"
                        >
                            {/* Card Accent */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-phoenix/50 transition-all" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-charcoal rounded-lg border border-white/5 text-phoenix group-hover:scale-110 transition-transform">
                                    <lab.icon size={24} />
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase ${lab.difficulty === 'Easy' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                        lab.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                            lab.difficulty === 'Hard' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' :
                                                'border-red-500/30 text-red-500 bg-red-500/5 animate-pulse'
                                        }`}>
                                        {lab.difficulty}
                                    </span>
                                    <div className="text-white/30 text-[10px] font-mono mt-1 uppercase tracking-tighter">
                                        {lab.category}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-display font-medium text-white mb-3 group-hover:text-phoenix transition-colors">
                                {lab.title}
                            </h3>
                            <p className="text-white/50 text-sm font-light leading-relaxed mb-6 flex-grow">
                                {lab.desc}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-phoenix" />
                                    <span className="font-mono text-xs text-white/70">{lab.points} PTS</span>
                                </div>

                                {lab.status === 'Active' ? (
                                    <Link
                                        href={`/lab/${lab.id}`}
                                        className="px-4 py-2 bg-charcoal-light border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:border-phoenix hover:bg-phoenix transition-all"
                                    >
                                        Deploy Lab
                                    </Link>
                                ) : (
                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest italic py-2 px-4 border border-white/5 bg-charcoal/30">
                                        {lab.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLabs.length === 0 && (
                    <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
                        <Terminal size={48} className="mx-auto text-white/10 mb-4" />
                        <h3 className="text-white font-medium mb-1">No labs found</h3>
                        <p className="text-white/40 text-sm font-mono uppercase">Adjust your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
