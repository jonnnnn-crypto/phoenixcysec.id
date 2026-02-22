"use client";

import { useState } from "react";
import { Shield, FileWarning, ExternalLink } from "lucide-react";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("submit");

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark border-t border-white/5 relative">
            <div className="max-w-6xl mx-auto">
                <h1 className="font-display text-3xl text-white mb-2">Hunter Dashboard</h1>
                <p className="font-mono text-sm text-white/50 uppercase tracking-widest mb-10">Restricted Access Area</p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Menu */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab("submit")}
                            className={`p-4 text-left border font-mono text-sm transition-all flex items-center gap-3 ${activeTab === "submit"
                                    ? "bg-phoenix/10 border-phoenix text-phoenix"
                                    : "bg-[#111] border-white/5 text-white/50 hover:bg-white/5"
                                }`}
                        >
                            <FileWarning size={16} /> Submit Report
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`p-4 text-left border font-mono text-sm transition-all flex items-center gap-3 ${activeTab === "history"
                                    ? "bg-phoenix/10 border-phoenix text-phoenix"
                                    : "bg-[#111] border-white/5 text-white/50 hover:bg-white/5"
                                }`}
                        >
                            <Shield size={16} /> Report History
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-[#111] border border-white/10 p-8 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-phoenix-light via-phoenix to-phoenix-dark" />

                        {activeTab === "submit" && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl text-white font-medium mb-6">Submit Vulnerability Report</h2>

                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Target / Organization</label>
                                            <input type="text" className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm" placeholder="e.g. *.kominfo.go.id" required />
                                        </div>
                                        <div>
                                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Vulnerability Type</label>
                                            <input type="text" className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm" placeholder="e.g. SQL Injection" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Severity</label>
                                            <select className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm appearance-none">
                                                <option value="low">Low (50 pts)</option>
                                                <option value="medium">Medium (100 pts)</option>
                                                <option value="high">High (200 pts)</option>
                                                <option value="critical">Critical (400 pts)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Report Year</label>
                                            <input type="number" defaultValue={new Date().getFullYear()} className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white/50 text-xs font-mono uppercase mb-2">Reference Link / PoC Video</label>
                                        <input type="url" className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm" placeholder="https://..." required />
                                    </div>

                                    <div>
                                        <label className="block text-white/50 text-xs font-mono uppercase mb-2">Short Description</label>
                                        <textarea rows={4} className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix font-mono text-sm resize-none" placeholder="Describe the impact briefly..." required />
                                    </div>

                                    <button type="submit" className="px-8 py-4 bg-white text-charcoal font-mono uppercase tracking-widest text-sm font-bold hover:bg-phoenix hover:text-white transition-all">
                                        Submit Report for Review
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl text-white font-medium mb-6">Your Report History</h2>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-sans">
                                        <thead className="border-b border-white/10 font-mono text-xs uppercase text-white/40">
                                            <tr>
                                                <th className="py-4 font-medium">Target</th>
                                                <th className="py-4 font-medium">Type</th>
                                                <th className="py-4 font-medium">Severity</th>
                                                <th className="py-4 font-medium text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {/* Empty state mock */}
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-white/30 font-mono text-xs uppercase">
                                                    No reports submitted yet.
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
