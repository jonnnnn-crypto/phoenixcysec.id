"use client";

import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
    Shield, Activity, Search, Crosshair,
    Clock, Save, User as UserIcon,
    ChevronRight, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

    const fetchHistory = async (userId: string) => {
        const { data, error } = await supabase
            .from('whitehat_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setHistory(data as Report[]);
        }
    };

    const fetchProfile = async (userId: string) => {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profileData) {
            setBio(profileData.bio || "");
            setGithub(profileData.github_url || "");
            setTwitter(profileData.twitter_url || "");
            setInstagram(profileData.instagram_url || "");
            setLinkedin(profileData.linkedin_url || "");
            setWebsite(profileData.website_url || "");
        }
    };

    const fetchStats = async (userId: string) => {
        const { data: userData } = await supabase.from('users').select('username').eq('id', userId).single();
        if (userData) {
            const { data: statsData } = await supabase.from('bughunter_leaderboard').select('*').eq('username', userData.username).single();
            if (statsData) {
                setStats({ points: statsData.total_points, rank: statsData.rank, total_reports: statsData.total_reports, username: userData.username });
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/join');
                return;
            }
            const userId = session.user.id;
            setUser(session.user);

            await Promise.all([
                fetchHistory(userId),
                fetchProfile(userId),
                fetchStats(userId)
            ]);

            const channel = supabase
                .channel(`dashboard-sync-${userId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'whitehat_reports' }, (payload) => {
                    const newPayload = payload.new as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    const oldPayload = payload.old as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    if (newPayload?.user_id === userId || oldPayload?.user_id === userId) {
                        fetchHistory(userId);
                        fetchStats(userId);
                    }
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                    const newPayload = payload.new as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    const oldPayload = payload.old as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    if (newPayload?.user_id === userId || oldPayload?.user_id === userId) {
                        fetchProfile(userId);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
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
            status: 'pending'
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
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#050505] text-white selection:bg-phoenix/30">
            {/* Minimal Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-phoenix/20 bg-phoenix/5 text-phoenix text-[10px] font-mono tracking-widest uppercase mb-4">
                            <Zap size={10} className="fill-phoenix" />
                            Secure Node Connection
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
                            Hunter <span className="text-phoenix">Workspace.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <div className="px-4 py-2 border-r border-white/5">
                            <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Reputation</div>
                            <div className="text-white font-mono font-bold text-sm tracking-tight">{stats.points} <span className="text-[10px] text-white/20">PTS</span></div>
                        </div>
                        <div className="px-4 py-2 text-center">
                            <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-white font-mono font-bold text-[10px] uppercase">Active</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Tactical Sidebar */}
                    <aside className="w-full lg:w-80 space-y-4 sticky top-32">
                        {/* Minimal Profile Summary */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield size={80} />
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded border border-white/10 bg-white/5 flex items-center justify-center">
                                    <UserIcon size={20} className="text-phoenix" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-white uppercase tracking-tight">@{stats.username || 'Agent'}</h4>
                                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{stats.rank}</div>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {[
                                    { id: "submit", label: "Lodge Report", icon: Crosshair },
                                    { id: "history", label: "Audit Log", icon: Search, badge: history.length },
                                    { id: "profile", label: "Agent Profile", icon: Settings },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded transition-all group ${activeTab === item.id
                                            ? "bg-white text-black font-bold"
                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={16} className={activeTab === item.id ? "text-black" : "text-phoenix/60"} />
                                            <span className="font-mono text-[11px] uppercase tracking-wider">{item.label}</span>
                                        </div>
                                        {item.badge !== undefined && (
                                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === item.id ? "bg-black/10 text-black" : "bg-white/5 text-white/30"}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-4 border border-white/5 bg-[#0a0a0a]/50 rounded-xl">
                            <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] mb-4">Core Statistics</div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[11px] font-mono text-white/60">
                                    <span>Verified Exploits</span>
                                    <span className="text-white font-bold">{stats.total_reports}</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-phoenix" style={{ width: `${Math.min(100, (stats.points / 1000) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Operational Interface */}
                    <div className="flex-1 min-h-[600px] w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {activeTab === "submit" && (
                                <motion.div
                                    key="submit"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="p-8 md:p-12"
                                >
                                    <div className="mb-10">
                                        <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Vulnerability Triage</h2>
                                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest leading-relaxed max-w-xl">
                                            Submit identified vulnerabilities for evaluation. Protocol requires valid proof-of-concept for point allocation.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Target Domain / Asset" required>
                                                <input type="text" value={target} onChange={e => setTarget(e.target.value)} className="input-technical" placeholder="*.target.com" required />
                                            </Field>
                                            <Field label="Target Classification">
                                                <select value={targetType} onChange={e => setTargetType(e.target.value)} className="input-technical appearance-none">
                                                    <option value="Company">Private Entity</option>
                                                    <option value="Government">Digital Infrastructure</option>
                                                    <option value="Educational">Academic Node</option>
                                                    <option value="Open Source">OSS Repository</option>
                                                    <option value="Other">Unclassified</option>
                                                </select>
                                            </Field>
                                        </div>

                                        <Field label="Vulnerability Vector" required>
                                            <input type="text" value={vulnType} onChange={e => setVulnType(e.target.value)} className="input-technical" placeholder="e.g. Remote Code Execution (RCE)" required />
                                        </Field>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Impact Level Assessment">
                                                <select value={severity} onChange={e => setSeverity(e.target.value)} className="input-technical appearance-none">
                                                    <option value="low">Low Impact (50 pts)</option>
                                                    <option value="medium">Medium Impact (100 pts)</option>
                                                    <option value="high">High Impact (200 pts)</option>
                                                    <option value="critical">Critical Impact (400 pts)</option>
                                                </select>
                                            </Field>
                                            <Field label="Analysis Year">
                                                <input type="number" value={year} onChange={e => setYear(e.target.value)} className="input-technical" required />
                                            </Field>
                                        </div>

                                        <Field label="Technical Evidence Link (PoC)" required>
                                            <input type="url" value={link} onChange={e => setLink(e.target.value)} className="input-technical text-phoenix/70" placeholder="https://evidence.vault/..." required />
                                        </Field>

                                        <Field label="Executive Summary">
                                            <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="input-technical resize-none pt-4" placeholder="Brief technical summary of findings..." required />
                                        </Field>

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="px-10 py-4 bg-white text-black hover:bg-phoenix hover:text-white font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                                            Commit Transfer
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === "history" && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-8 md:p-12"
                                >
                                    <div className="mb-10 flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Audit Intelligence</h2>
                                            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Historical submission records</p>
                                        </div>
                                        <div className="text-[10px] font-mono text-white/20 uppercase">{history.length} Logs found</div>
                                    </div>

                                    {history.length === 0 ? (
                                        <div className="py-24 text-center border border-dashed border-white/10 rounded-xl">
                                            <p className="font-mono text-xs text-white/20 uppercase tracking-widest">No intelligence gathered yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-[1px] bg-white/5 border border-white/5">
                                            {history.map(report => (
                                                <div key={report.id} className="bg-[#0a0a0a] p-5 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 group transition-colors hover:bg-white/[0.02]">
                                                    <div className="md:col-span-1">
                                                        <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-widest border ${report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            report.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                            }`}>
                                                            {report.severity.substring(0, 4)}
                                                        </span>
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <div className="text-sm font-bold truncate group-hover:text-phoenix transition-colors">{report.target}</div>
                                                        <div className="text-[10px] font-mono text-white/30 uppercase mt-1">{report.vulnerability}</div>
                                                    </div>
                                                    <div className="md:col-span-3 text-[10px] font-mono text-white/20 uppercase flex items-center gap-2">
                                                        <Clock size={10} /> {new Date(report.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="md:col-span-3 flex justify-start md:justify-end">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest ${report.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                            report.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'
                                                            }`}>
                                                            <div className={`w-1 h-1 rounded-full ${report.status === 'approved' ? 'bg-green-500' :
                                                                report.status === 'rejected' ? 'bg-red-500' : 'bg-white/40'
                                                                }`} />
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "profile" && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-8 md:p-12"
                                >
                                    <div className="mb-10">
                                        <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Agent Fingerprint</h2>
                                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Manage your public operational identity.</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                                        <Field label="Operative Signature (Bio)">
                                            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="input-technical resize-none pt-4" placeholder="Tell the world who you are..." />
                                        </Field>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="GitHub Node">
                                                <input type="text" value={github} onChange={e => setGithub(e.target.value)} className="input-technical" placeholder="octocat" />
                                            </Field>
                                            <Field label="Twitter / X Alias">
                                                <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className="input-technical" placeholder="zsec_" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Instagram Portal">
                                                <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} className="input-technical" placeholder="https://instagram.com/..." />
                                            </Field>
                                            <Field label="Operational Website">
                                                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="input-technical" placeholder="https://hunter-domain.com" />
                                            </Field>
                                        </div>

                                        <button
                                            disabled={isSavingProfile}
                                            type="submit"
                                            className="px-10 py-4 bg-white/5 hover:bg-phoenix hover:text-white border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Synchronize Profile
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .input-technical {
                    width: 100%;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-family: var(--font-mono), monospace;
                    font-size: 0.8rem;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .input-technical:focus {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.02);
                }
                .label-technical {
                    display: block;
                    font-size: 9px;
                    font-family: var(--font-mono), monospace;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    color: rgba(255, 255, 255, 0.3);
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}

function Field({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="label-technical">
                {label} {required && <span className="text-phoenix/50">*</span>}
            </label>
            {children}
        </div>
    );
}

function Loader2({ size, className }: { size: number, className?: string }) {
    return <Activity size={size} className={`animate-spin ${className}`} />;
}

function Settings({ size, className }: { size: number, className?: string }) {
    return <UserIcon size={size} className={className} />;
}
