"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Shield, FileWarning, Activity, Search, Crosshair, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type Report = {
    id: string;
    target: string;
    vulnerability: string;
    severity: string;
    status: string;
    created_at: string;
    points: number;
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("submit");
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<Report[]>([]);

    // Form states
    const [target, setTarget] = useState("");
    const [vulnType, setVulnType] = useState("");
    const [severity, setSeverity] = useState("low");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [link, setLink] = useState("");
    const [desc, setDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/join');
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from('whitehat_reports')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setHistory(data as Report[]);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        const { data, error } = await supabase.from('whitehat_reports').insert([{
            user_id: user.id,
            target,
            vulnerability: vulnType,
            severity,
            report_year: parseInt(year),
            reference_link: link,
            description: desc,
            status: 'pending' // Default status
        }]).select();

        if (error) {
            alert("Submission failed: " + error.message);
        } else if (data) {
            setHistory(prev => [data[0] as Report, ...prev]);
            setActiveTab("history");
            setTarget(""); setVulnType(""); setLink(""); setDesc(""); setSeverity("low");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#020617] relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-phoenix/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-phoenix" size={24} />
                            <h1 className="font-display font-medium text-4xl text-white tracking-tight">Hunter Workspace</h1>
                        </div>
                        <p className="font-mono text-xs text-phoenix uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-phoenix animate-pulse" />
                            Encrypted Sector - Level 4 Clearance
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Panel */}
                    <div className="w-full lg:w-72 flex flex-col gap-3">
                        <button
                            onClick={() => setActiveTab("submit")}
                            className={`p-5 text-left font-mono text-sm transition-all flex items-center justify-between rounded-xl border backdrop-blur-md overflow-hidden relative group ${activeTab === "submit"
                                ? "bg-phoenix/10 border-phoenix/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            {activeTab === "submit" && <div className="absolute left-0 top-0 w-1 h-full bg-phoenix" />}
                            <div className="flex items-center gap-3">
                                <Crosshair size={18} className={activeTab === "submit" ? "text-phoenix" : ""} />
                                <span>Lodge Report</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("history")}
                            className={`p-5 text-left font-mono text-sm transition-all flex items-center justify-between rounded-xl border backdrop-blur-md overflow-hidden relative group ${activeTab === "history"
                                ? "bg-phoenix/10 border-phoenix/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            {activeTab === "history" && <div className="absolute left-0 top-0 w-1 h-full bg-phoenix" />}
                            <div className="flex items-center gap-3">
                                <Search size={18} className={activeTab === "history" ? "text-phoenix" : ""} />
                                <span>Audit Log</span>
                            </div>
                            <span className="bg-[#0a0a0a] text-xs px-2 py-1 rounded-md border border-white/10">{history.length}</span>
                        </button>
                    </div>

                    {/* Main Interface */}
                    <div className="flex-1 bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl backdrop-blur-xl relative">
                        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-phoenix/50 to-transparent" />

                        {activeTab === "submit" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl text-white font-medium mb-2 font-display">Vulnerability Intake Form</h2>
                                <p className="text-white/40 font-mono text-sm mb-8">All transmissions are end-to-end encrypted. False reports will negatively impact your reputation.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Target Domain / Asset</label>
                                            <input type="text" value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="e.g. *.target.com" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Vulnerability Class</label>
                                            <input type="text" value={vulnType} onChange={e => setVulnType(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="e.g. Remote Code Execution" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Impact Severity</label>
                                            <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm appearance-none transition-all">
                                                <option value="low">Low Risk (50 pts)</option>
                                                <option value="medium">Medium Risk (100 pts)</option>
                                                <option value="high">High Risk (200 pts)</option>
                                                <option value="critical">Critical Risk (400 pts)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Discovery Year</label>
                                            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Proof of Concept (URL)</label>
                                        <input type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="https://..." required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Executive Summary</label>
                                        <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm resize-none transition-all" placeholder="Briefly describe how this vulnerability can be exploited..." required />
                                    </div>

                                    <button disabled={isSubmitting} type="submit" className="w-full md:w-auto px-8 py-4 mt-4 bg-phoenix hover:bg-phoenix-light text-white rounded-lg font-mono uppercase tracking-widest text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex justify-center items-center">
                                        {isSubmitting ? 'Transmitting...' : 'Initiate Secure Transfer'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl text-white font-medium mb-8 font-display">Intelligence Audit Log</h2>

                                {history.length === 0 ? (
                                    <div className="py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                        <Shield className="mx-auto text-white/20 mb-4" size={48} />
                                        <p className="text-white/40 font-mono text-sm uppercase tracking-widest">No intelligence gathered yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map(report => (
                                            <div key={report.id} className="p-5 border border-white/10 bg-[#0a0a0a]/50 rounded-xl hover:border-phoenix/30 transition-all group flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${report.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            report.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                                report.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            }`}>
                                                            {report.severity}
                                                        </span>
                                                        <h3 className="text-white font-medium text-lg">{report.target}</h3>
                                                    </div>
                                                    <p className="text-white/50 font-mono text-sm">{report.vulnerability}</p>
                                                </div>

                                                <div className="flex items-center gap-8 md:text-right">
                                                    <div className="hidden md:block">
                                                        <p className="text-white/30 text-xs font-mono mb-1">Filed On</p>
                                                        <p className="text-white/70 font-mono text-sm flex items-center gap-2"><Clock size={14} /> {new Date(report.created_at).toLocaleDateString()}</p>
                                                    </div>

                                                    <div className="min-w-[120px]">
                                                        {report.status === 'approved' ? (
                                                            <div className="inline-flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider">
                                                                <CheckCircle size={14} /> Approved
                                                            </div>
                                                        ) : report.status === 'rejected' ? (
                                                            <div className="inline-flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider">
                                                                <AlertTriangle size={14} /> Rejected
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider">
                                                                <FileWarning size={14} /> Pending
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
