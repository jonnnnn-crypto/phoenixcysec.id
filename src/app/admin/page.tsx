"use client";

import { useState } from "react";
import { Users, FileWarning, Calendar, Handshake, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("reports");

    const pendingReports = [
        { id: "1", user: "byte_ninja", target: "vuln.server.local", type: "SQL Injection", severity: "high", date: "2024-03-12", desc: "Found SQLi in login parameter." },
        { id: "2", user: "newbie_sec", target: "api.target.com", type: "IDOR", severity: "medium", date: "2024-03-11", desc: "Able to read other users data." },
    ];

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#050505] border-t-4 border-phoenix relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <ShieldAlert size={32} className="text-phoenix" />
                    <div>
                        <h1 className="font-display text-4xl text-white">System Command</h1>
                        <p className="font-mono text-xs text-phoenix uppercase tracking-widest mt-1">SuperAdmin Access Granted</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Members", val: "1,204", icon: Users },
                        { label: "Pending Reports", val: "12", icon: FileWarning, highlight: true },
                        { label: "Active Events", val: "2", icon: Calendar },
                        { label: "Partners", val: "8", icon: Handshake },
                    ].map((stat, i) => (
                        <div key={i} className={`p-6 bg-[#111] border ${stat.highlight ? 'border-phoenix/50' : 'border-white/10'} shadow-xl`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs text-white/50 uppercase">{stat.label}</span>
                                <stat.icon size={16} className={stat.highlight ? 'text-phoenix' : 'text-white/30'} />
                            </div>
                            <span className="font-display text-3xl text-white">{stat.val}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Admin Nav */}
                    <div className="w-full md:w-64 space-y-2">
                        {[
                            { id: "reports", label: "Report Moderation", icon: FileWarning },
                            { id: "members", label: "Member Management", icon: Users },
                            { id: "events", label: "Event Control", icon: Calendar },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full p-4 text-left border font-mono text-sm transition-all flex items-center gap-3 ${activeTab === tab.id
                                        ? "bg-white/10 border-white text-white"
                                        : "bg-transparent border-transparent text-white/40 hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Admin Content */}
                    <div className="flex-1 bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl">
                        {activeTab === "reports" && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl text-white font-medium mb-6">Pending Triage ({pendingReports.length})</h2>

                                <div className="space-y-4">
                                    {pendingReports.map(report => (
                                        <div key={report.id} className="p-6 border border-white/10 bg-[#111] relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-phoenix/50" />

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex flex-wrap gap-2 items-center mb-2">
                                                        <span className="px-2 py-0.5 bg-phoenix/20 text-phoenix text-[10px] font-mono uppercase border border-phoenix/30">
                                                            {report.severity} Priority
                                                        </span>
                                                        <span className="font-mono text-xs text-white/40">{report.date}</span>
                                                    </div>
                                                    <h3 className="font-medium text-white text-lg">{report.type} on {report.target}</h3>
                                                    <p className="font-mono text-sm text-white/50 mt-1">Submitted by <span className="text-white">@{report.user}</span></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all rounded">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button className="p-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all rounded">
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-charcoal border border-white/5 rounded text-sm text-white/70 font-mono">
                                                {report.desc}
                                            </div>

                                            <div className="mt-4 flex gap-4">
                                                <input type="text" placeholder="Add review notes..." className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:border-phoenix" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "members" && (
                            <div className="text-center py-20 text-white/30 font-mono text-sm uppercase">
                                Member Management Interface Offline
                            </div>
                        )}

                        {activeTab === "events" && (
                            <div className="text-center py-20 text-white/30 font-mono text-sm uppercase">
                                Event Control System Offline
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
