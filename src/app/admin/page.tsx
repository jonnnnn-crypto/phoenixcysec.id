"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Users, FileWarning, Handshake, ShieldAlert, CheckCircle, XCircle, Loader2, Trash2, Plus, BookOpen } from "lucide-react";

type PendingReport = {
    id: string;
    vulnerability: string;
    target: string;
    severity: string;
    created_at: string;
    description: string;
    reference_link: string | null;
    users?: { username: string };
};

type Partner = {
    id: string;
    name: string;
    website: string;
    category: string;
};

type Documentation = {
    id: string;
    title: string;
    slug: string;
    category: string;
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("reports");
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    // Real data states
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [docs, setDocs] = useState<Documentation[]>([]);

    const [totalMembers, setTotalMembers] = useState(0);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // Form states
    const [newPartnerName, setNewPartnerName] = useState("");
    const [newPartnerUrl, setNewPartnerUrl] = useState("");
    const [newPartnerCategory, setNewPartnerCategory] = useState("Educational Partner");

    const [newDocTitle, setNewDocTitle] = useState("");
    const [newDocSlug, setNewDocSlug] = useState("");
    const [newDocCategory, setNewDocCategory] = useState("Beginner Cybersecurity");

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: reportsData } = await supabase
                .from('whitehat_reports')
                .select('*, users(username)')
                .eq('status', 'pending');
            if (reportsData) setPendingReports(reportsData as unknown as PendingReport[]);

            const { data: partnersData } = await supabase.from('partners').select('*').order('name');
            if (partnersData) setPartners(partnersData as Partner[]);

            const { data: docsData } = await supabase.from('documentation').select('*').order('created_at', { ascending: false });
            if (docsData) setDocs(docsData as Documentation[]);

            const { count: memberCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
            if (memberCount !== null) setTotalMembers(memberCount);
        };

        const checkAdminAndFetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/join');
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const isHardcodedAdmin = session.user.id === '79d56ea8-9318-4459-9bde-4f48779e4509';
            if (!isHardcodedAdmin && (userError || userData?.role !== 'admin')) {
                alert("Access Denied: You do not have superadmin privileges.");
                router.push('/dashboard');
                return;
            }

            setIsAdmin(true);
            fetchDashboardData();
        };

        checkAdminAndFetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, supabase]);

    // Mod functions
    const handleModerateReport = async (reportId: string, action: 'approve' | 'reject') => {
        setLoadingAction(reportId);
        const { error } = await supabase
            .from('whitehat_reports')
            .update({ status: action === 'approve' ? 'approved' : 'rejected' })
            .eq('id', reportId);

        if (error) alert("Error updating report: " + error.message);
        else setPendingReports(prev => prev.filter(r => r.id !== reportId));
        setLoadingAction(null);
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('add_partner');
        const { data, error } = await supabase
            .from('partners')
            .insert([{ name: newPartnerName, website: newPartnerUrl, category: newPartnerCategory }])
            .select();

        if (error) alert(error.message);
        else if (data) {
            setPartners(prev => [...prev, data[0] as Partner]);
            setNewPartnerName(""); setNewPartnerUrl("");
        }
        setLoadingAction(null);
    };

    const handleDeletePartner = async (id: string) => {
        if (!confirm("Delete this partner?")) return;
        setLoadingAction(id);
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (!error) setPartners(prev => prev.filter(p => p.id !== id));
        setLoadingAction(null);
    };

    const handleAddDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('add_doc');
        const { data: sessionData } = await supabase.auth.getSession();
        const { data, error } = await supabase
            .from('documentation')
            .insert([{
                title: newDocTitle,
                slug: newDocSlug,
                category: newDocCategory,
                status: 'published',
                created_by: sessionData.session?.user.id
            }])
            .select();

        if (error) alert(error.message);
        else if (data) {
            setDocs(prev => [data[0] as Documentation, ...prev]);
            setNewDocTitle(""); setNewDocSlug("");
        }
        setLoadingAction(null);
    };

    const handleDeleteDoc = async (id: string) => {
        if (!confirm("Delete this document?")) return;
        setLoadingAction(id);
        const { error } = await supabase.from('documentation').delete().eq('id', id);
        if (!error) setDocs(prev => prev.filter(d => d.id !== id));
        setLoadingAction(null);
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-phoenix flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin" />
                    <p className="font-mono text-xs uppercase tracking-widest text-white/50">Verifying Clearance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#050505] border-t-4 border-phoenix relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <ShieldAlert size={32} className="text-phoenix" />
                        <div>
                            <h1 className="font-display text-4xl text-white">System Command</h1>
                            <p className="font-mono text-xs text-phoenix uppercase tracking-widest mt-1">SuperAdmin Access Granted</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { supabase.auth.signOut(); router.push('/') }}
                        className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono text-xs uppercase"
                    >
                        Emergency Terminate
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Members", val: totalMembers, icon: Users },
                        { label: "Pending Reports", val: pendingReports.length, icon: FileWarning, highlight: pendingReports.length > 0 },
                        { label: "Total Documents", val: docs.length, icon: BookOpen },
                        { label: "Partners", val: partners.length, icon: Handshake },
                    ].map((stat, i) => (
                        <div key={i} className={`p-6 bg-[#111] border ${stat.highlight ? 'border-phoenix/50' : 'border-white/10'} shadow-xl transition-all`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs text-white/50 uppercase">{stat.label}</span>
                                <stat.icon size={16} className={stat.highlight ? 'text-phoenix' : 'text-white/30'} />
                            </div>
                            <span className="font-display text-3xl text-white">{stat.val}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 space-y-2">
                        {[
                            { id: "reports", label: "Report Moderation", icon: FileWarning },
                            { id: "partners", label: "Partners & Ecosystem", icon: Handshake },
                            { id: "docs", label: "Knowledge Base", icon: BookOpen },
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

                    <div className="flex-1 bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl min-h-[500px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-phoenix/5 blur-[100px] rounded-full pointer-events-none" />

                        {activeTab === "reports" && (
                            <div className="animate-in fade-in duration-300 relative z-10">
                                <h2 className="text-xl text-white font-medium mb-6 flex items-center gap-2">
                                    <FileWarning className="text-phoenix" size={20} /> Pending Triage ({pendingReports.length})
                                </h2>
                                {pendingReports.length === 0 ? (
                                    <div className="text-center py-20 text-white/30 font-mono text-sm uppercase border border-dashed border-white/10">
                                        Queue clear. No pending vulnerabilities.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingReports.map(report => (
                                            <div key={report.id} className="p-6 border border-white/10 bg-[#111] relative hover:border-white/20 transition-all">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-phoenix/50" />
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex flex-wrap gap-2 items-center mb-2">
                                                            <span className="px-2 py-0.5 bg-phoenix/20 text-phoenix text-[10px] font-mono uppercase border border-phoenix/30">
                                                                {report.severity} Priority
                                                            </span>
                                                            <span className="font-mono text-xs text-white/40">{new Date(report.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="font-medium text-white text-lg">{report.vulnerability} on {report.target}</h3>
                                                        <p className="font-mono text-sm text-white/50 mt-1">Submitted by <span className="text-white">@{report.users?.username || 'Unknown'}</span></p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleModerateReport(report.id, 'approve')} disabled={loadingAction === report.id} className="p-2 bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all rounded disabled:opacity-50" title="Approve & Award Points">
                                                            {loadingAction === report.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                        </button>
                                                        <button onClick={() => handleModerateReport(report.id, 'reject')} disabled={loadingAction === report.id} className="p-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all rounded disabled:opacity-50" title="Reject Report">
                                                            {loadingAction === report.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-charcoal border border-white/5 rounded text-sm text-white/70 font-mono mb-4 break-words">{report.description}</div>
                                                {report.reference_link && (
                                                    <a href={report.reference_link} target="_blank" rel="noopener noreferrer" className="text-phoenix text-xs font-mono hover:underline">View PoC Reference &rarr;</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "partners" && (
                            <div className="animate-in fade-in relative z-10">
                                <h2 className="text-xl text-white font-medium mb-6 flex items-center gap-2">
                                    <Handshake className="text-phoenix" size={20} /> Ecosystem Partners
                                </h2>
                                <form onSubmit={handleAddPartner} className="mb-8 p-6 border border-white/10 bg-[#111] grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Partner Name</label>
                                        <input type="text" required value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Website</label>
                                        <input type="url" required value={newPartnerUrl} onChange={e => setNewPartnerUrl(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Category</label>
                                        <select value={newPartnerCategory} onChange={e => setNewPartnerCategory(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix appearance-none">
                                            <option>Educational Partner</option>
                                            <option>Community Partner</option>
                                            <option>Media Partner</option>
                                            <option>Security Collaboration</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <button disabled={loadingAction === 'add_partner'} type="submit" className="w-full py-3 bg-phoenix hover:bg-phoenix-light text-white font-mono text-sm uppercase flex justify-center items-center gap-2">
                                            {loadingAction === 'add_partner' ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Partner</>}
                                        </button>
                                    </div>
                                </form>

                                <div className="border border-white/10 bg-[#111]">
                                    {partners.length === 0 ? (
                                        <p className="p-6 text-center text-white/40 font-mono text-sm">No partners registered.</p>
                                    ) : (
                                        <table className="w-full text-left font-sans text-sm">
                                            <thead className="bg-[#1a1a1a] border-b border-white/10 text-white/40 font-mono text-xs uppercase">
                                                <tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {partners.map(p => (
                                                    <tr key={p.id} className="hover:bg-white/5">
                                                        <td className="p-4 text-white font-medium">{p.name} <a href={p.website} className="text-xs text-phoenix ml-2 font-mono" target="_blank">Link</a></td>
                                                        <td className="p-4 text-white/60">{p.category}</td>
                                                        <td className="p-4 text-right">
                                                            <button onClick={() => handleDeletePartner(p.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "docs" && (
                            <div className="animate-in fade-in relative z-10">
                                <h2 className="text-xl text-white font-medium mb-6 flex items-center gap-2">
                                    <BookOpen className="text-phoenix" size={20} /> Knowledge Base
                                </h2>
                                <form onSubmit={handleAddDoc} className="mb-8 p-6 border border-white/10 bg-[#111] grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Article Title</label>
                                        <input type="text" required value={newDocTitle} onChange={e => { setNewDocTitle(e.target.value); setNewDocSlug(e.target.value.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">URL Slug (Auto)</label>
                                        <input type="text" required value={newDocSlug} onChange={e => setNewDocSlug(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white/50 font-mono text-sm outline-none" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Category</label>
                                        <select value={newDocCategory} onChange={e => setNewDocCategory(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix appearance-none">
                                            <option>Beginner Cybersecurity</option>
                                            <option>Web Security</option>
                                            <option>Linux Security</option>
                                            <option>Bug Hunting Guide</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <button disabled={loadingAction === 'add_doc'} type="submit" className="w-full py-3 bg-phoenix hover:bg-phoenix-light text-white font-mono text-sm uppercase flex justify-center items-center gap-2">
                                            {loadingAction === 'add_doc' ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Publish</>}
                                        </button>
                                    </div>
                                </form>

                                <div className="border border-white/10 bg-[#111]">
                                    {docs.length === 0 ? (
                                        <p className="p-6 text-center text-white/40 font-mono text-sm">No documentation published.</p>
                                    ) : (
                                        <table className="w-full text-left font-sans text-sm">
                                            <thead className="bg-[#1a1a1a] border-b border-white/10 text-white/40 font-mono text-xs uppercase">
                                                <tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {docs.map(d => (
                                                    <tr key={d.id} className="hover:bg-white/5">
                                                        <td className="p-4 text-white font-medium">{d.title} <span className="text-xs text-white/30 ml-2 font-mono">/{d.slug}</span></td>
                                                        <td className="p-4 text-white/60">{d.category}</td>
                                                        <td className="p-4 text-right">
                                                            <button onClick={() => handleDeleteDoc(d.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
