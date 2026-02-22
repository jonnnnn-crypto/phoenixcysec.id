"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Shield, FileWarning, Activity, Search, Crosshair, AlertTriangle, CheckCircle, Clock, Save, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Award, Target, Hash } from "lucide-react";

type Report = {
    id: string;
    target: string;
    vulnerability: string;
    severity: string;
    status: string;
    created_at: string;
    points: number;
    target_type?: string;
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("submit");
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<Report[]>([]);

    // Form states
    const [target, setTarget] = useState("");
    const [targetType, setTargetType] = useState("Company");
    const [vulnType, setVulnType] = useState("");
    const [severity, setSeverity] = useState("low");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [link, setLink] = useState("");
    const [desc, setDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile states
    const [bio, setBio] = useState("");
    const [github, setGithub] = useState("");
    const [twitter, setTwitter] = useState("");
    const [instagram, setInstagram] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [website, setWebsite] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [stats, setStats] = useState({ points: 0, rank: 'Ember Hunter', total_reports: 0, username: '' });

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

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (profileData) {
                setBio(profileData.bio || "");
                setGithub(profileData.github_url || "");
                setTwitter(profileData.twitter_url || "");
                setInstagram(profileData.instagram_url || "");
                setLinkedin(profileData.linkedin_url || "");
                setWebsite(profileData.website_url || "");
            }

            // Fetch Username & Stats for Banner
            const { data: userData } = await supabase.from('users').select('username').eq('id', session.user.id).single();
            if (userData) {
                const { data: statsData } = await supabase.from('bughunter_leaderboard').select('*').eq('username', userData.username).single();
                if (statsData) {
                    setStats({ points: statsData.total_points, rank: statsData.rank, total_reports: statsData.total_reports, username: userData.username });
                }
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
            target_type: targetType,
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
            setTarget(""); setTargetType("Company"); setVulnType(""); setLink(""); setDesc(""); setSeverity("low");
        }
        setIsSubmitting(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingProfile(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                bio,
                github_url: github,
                twitter_url: twitter,
                instagram_url: instagram,
                linkedin_url: linkedin,
                website_url: website,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) {
            alert("Error updating profile: " + error.message);
        } else {
            alert("Profile updated successfully!");
        }
        setIsSavingProfile(false);
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
                    {/* Sidebar Area */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-6">

                        {/* Hunter Profile Card */}
                        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-phoenix/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-phoenix/20 transition-colors duration-500" />
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-phoenix to-purple-900 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    <UserIcon size={28} className="text-white drop-shadow-md" />
                                </div>
                                <div>
                                    <div className="text-white/50 font-mono text-xs uppercase tracking-widest mb-1">Operative</div>
                                    <div className="text-xl text-white font-medium break-all">@{stats.username || 'Agent'}</div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Award size={16} className="text-phoenix" /> Rank
                                    </div>
                                    <div className={`flex items-center gap-2 px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded border ${stats.rank === 'Ascended Phoenix' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                        stats.rank === 'Inferno Hunter' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                            stats.rank === 'Phoenix Hunter' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                                                stats.rank === 'Flame Hunter' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                    'bg-white/5 text-white/50 border-white/10'
                                        }`}>
                                        <img
                                            src={
                                                stats.rank === 'Ascended Phoenix' ? '/rank-ascended.png' :
                                                    stats.rank === 'Inferno Hunter' ? '/rank-inferno.png' :
                                                        stats.rank === 'Phoenix Hunter' ? '/rank-phoenix.png' :
                                                            stats.rank === 'Flame Hunter' ? '/rank-flame.png' :
                                                                '/rank-ember.png'
                                            }
                                            alt={stats.rank}
                                            className="w-4 h-4 object-contain"
                                        />
                                        {stats.rank}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Hash size={16} className="text-phoenix" /> Reputation
                                    </div>
                                    <div className="text-white font-mono text-lg">{stats.points} <span className="text-xs text-white/40">pts</span></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Target size={16} className="text-phoenix" /> Approvals
                                    </div>
                                    <div className="text-white font-mono text-lg">{stats.total_reports}</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="flex flex-col gap-3">
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

                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`p-5 text-left font-mono text-sm transition-all flex items-center justify-between rounded-xl border backdrop-blur-md overflow-hidden relative group ${activeTab === "profile"
                                    ? "bg-phoenix/10 border-phoenix/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                                    }`}
                            >
                                {activeTab === "profile" && <div className="absolute left-0 top-0 w-1 h-full bg-phoenix" />}
                                <div className="flex items-center gap-3">
                                    <UserIcon size={18} className={activeTab === "profile" ? "text-phoenix" : ""} />
                                    <span>Profile Settings</span>
                                </div>
                            </button>
                        </div>
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
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Target Organization Type</label>
                                            <select value={targetType} onChange={e => setTargetType(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm appearance-none transition-all">
                                                <option value="Company">Private Company</option>
                                                <option value="Government">Government Agency</option>
                                                <option value="Educational">Educational Institution</option>
                                                <option value="Open Source">Open Source Project</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Vulnerability Class</label>
                                        <input type="text" value={vulnType} onChange={e => setVulnType(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="e.g. Remote Code Execution" required />
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
                                    <div className="space-y-3">
                                        {/* Header Row (Desktop Only) */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-white/40 font-mono text-xs uppercase tracking-wider">
                                            <div className="col-span-1">Risk</div>
                                            <div className="col-span-4">Target / Title</div>
                                            <div className="col-span-3">Vulnerability Class</div>
                                            <div className="col-span-2 text-center">Filed On</div>
                                            <div className="col-span-2 text-right">Status</div>
                                        </div>

                                        {history.map(report => (
                                            <div key={report.id} className="group relative overflow-hidden bg-[#0a0a0a]/50 border border-white/5 hover:border-white/20 hover:bg-white/[0.02] rounded-xl transition-all p-5 md:py-4 md:px-6">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-phoenix/50 transition-colors" />

                                                <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:gap-4">

                                                    {/* Risk Level */}
                                                    <div className="md:col-span-1 flex items-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            report.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                                report.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            }`}>
                                                            {report.severity.substring(0, 4)}
                                                        </span>
                                                    </div>

                                                    {/* Target & Title */}
                                                    <div className="md:col-span-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-white font-medium text-sm md:text-base truncate" title={report.target}>{report.target}</h3>
                                                            {report.target_type && (
                                                                <span className="text-white/30 text-[9px] font-mono border border-white/10 px-1.5 py-0.5 rounded tracking-wider uppercase hidden md:inline-block">
                                                                    {report.target_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-white/40 font-mono text-xs line-clamp-1 block md:hidden mb-2">{report.vulnerability}</p>
                                                    </div>

                                                    {/* Vulnerability Class (Desktop) */}
                                                    <div className="hidden md:block md:col-span-3 text-white/50 font-mono text-xs truncate" title={report.vulnerability}>
                                                        {report.vulnerability}
                                                    </div>

                                                    {/* Filed On */}
                                                    <div className="md:col-span-2 flex items-center md:justify-center text-white/50 font-mono text-xs gap-2">
                                                        <Clock size={12} className="text-white/30" />
                                                        {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>

                                                    {/* Status */}
                                                    <div className="md:col-span-2 flex justify-start md:justify-end">
                                                        {report.status === 'approved' ? (
                                                            <div className="inline-flex items-center gap-1.5 text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider">
                                                                <CheckCircle size={12} /> Approved
                                                            </div>
                                                        ) : report.status === 'rejected' ? (
                                                            <div className="inline-flex items-center gap-1.5 text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider">
                                                                <AlertTriangle size={12} /> Rejected
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 text-white/60 bg-white/5 border border-white/10 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider">
                                                                <FileWarning size={12} /> Pending
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

                        {activeTab === "profile" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl text-white font-medium mb-2 font-display">Hunter Profile Card</h2>
                                <p className="text-white/40 font-mono text-sm mb-8">Customize your public footprint on the White Hat Leaderboard.</p>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Bio / Signature Statement</label>
                                        <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm resize-none transition-all" placeholder="Tell the world who you are..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">GitHub Username</label>
                                            <input type="text" value={github} onChange={e => setGithub(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="octocat" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Twitter/X Username</label>
                                            <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="zsec_" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Instagram URL</label>
                                            <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="https://instagram.com/zsec" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-white/60 text-xs font-mono uppercase tracking-wider">Personal Website / Blog</label>
                                            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-phoenix focus:ring-1 focus:ring-phoenix/50 font-mono text-sm transition-all" placeholder="https://hunter-domain.com" />
                                        </div>
                                    </div>

                                    <button disabled={isSavingProfile} type="submit" className="w-full md:w-auto px-8 py-4 mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-mono uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                                        {isSavingProfile ? 'Saving...' : <><Save size={18} /> Update Profile</>}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
