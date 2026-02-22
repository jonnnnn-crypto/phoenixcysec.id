"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Users, FileWarning, Calendar, Handshake, ShieldAlert, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("reports");
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    // Real data states
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalPartners, setTotalPartners] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAdminAndFetchData = async () => {
            // 1. Check Authentication
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/join');
                return;
            }

            // 2. Check Admin Role Authorization
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (userError || userData?.role !== 'admin') {
                alert("Access Denied: You do not have superadmin privileges.");
                router.push('/dashboard');
                return;
            }

            setIsAdmin(true);

            // 3. Fetch Real Data
            fetchDashboardData();
        };

        checkAdminAndFetchData();
    }, [router, supabase]);

    const fetchDashboardData = async () => {
        // Fetch pending reports (join with users table to get username)
        // Note: Since we don't have a direct foreign key relation standard setup in our custom code,
        // we'll fetch reports and then fetch corresponding usernames if needed, or if FK exists, we use it.
        // Assuming standard FK `user_id` -> `users(id)`
        const { data: reportsData } = await supabase
            .from('whitehat_reports')
            .select('*, users(username)')
            .eq('status', 'pending');

        if (reportsData) setPendingReports(reportsData);

        // Fetch counts
        const { count: memberCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (memberCount !== null) setTotalMembers(memberCount);

        const { count: partnerCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
        if (partnerCount !== null) setTotalPartners(partnerCount);

        // Assuming events table exists, otherwise default to 0
        const { count: eventCount, error: eventError } = await supabase.from('events').select('*', { count: 'exact', head: true });
        if (!eventError && eventCount !== null) setTotalEvents(eventCount);
    };

    const handleModerateReport = async (reportId: string, action: 'approve' | 'reject') => {
        setLoadingAction(reportId);

        // The DB trigger `calculate_report_points` will automatically assign points if status is set to 'approved'
        const { error } = await supabase
            .from('whitehat_reports')
            .update({ status: action === 'approve' ? 'approved' : 'rejected' })
            .eq('id', reportId);

        if (error) {
            alert("Error updating report: " + error.message);
        } else {
            // Remove from UI
            setPendingReports(prev => prev.filter(r => r.id !== reportId));
        }

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
                <div className="flex items-center gap-4 mb-10">
                    <ShieldAlert size={32} className="text-phoenix" />
                    <div>
                        <h1 className="font-display text-4xl text-white">System Command</h1>
                        <p className="font-mono text-xs text-phoenix uppercase tracking-widest mt-1">SuperAdmin Access Granted</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Members", val: totalMembers, icon: Users },
                        { label: "Pending Reports", val: pendingReports.length, icon: FileWarning, highlight: pendingReports.length > 0 },
                        { label: "Active Events", val: totalEvents, icon: Calendar },
                        { label: "Partners", val: totalPartners, icon: Handshake },
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
                    {/* Admin Nav */}
                    <div className="w-full md:w-64 space-y-2">
                        {[
                            { id: "reports", label: "Report Moderation", icon: FileWarning },
                            { id: "partners", label: "Partners & Ecosystem", icon: Handshake },
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
                    <div className="flex-1 bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl min-h-[500px]">
                        {activeTab === "reports" && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl text-white font-medium mb-6">Pending Triage ({pendingReports.length})</h2>

                                {pendingReports.length === 0 ? (
                                    <div className="text-center py-20 text-white/30 font-mono text-sm uppercase border border-dashed border-white/10">
                                        No pending reports in the queue.
                                    </div>
                                ) : (
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
                                                            <span className="font-mono text-xs text-white/40">{new Date(report.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="font-medium text-white text-lg">{report.vulnerability} on {report.target}</h3>
                                                        <p className="font-mono text-sm text-white/50 mt-1">Submitted by <span className="text-white">@{report.users?.username || 'Unknown'}</span></p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleModerateReport(report.id, 'approve')}
                                                            disabled={loadingAction === report.id}
                                                            className="p-2 bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all rounded disabled:opacity-50"
                                                            title="Approve & Award Points"
                                                        >
                                                            {loadingAction === report.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleModerateReport(report.id, 'reject')}
                                                            disabled={loadingAction === report.id}
                                                            className="p-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all rounded disabled:opacity-50"
                                                            title="Reject Report"
                                                        >
                                                            {loadingAction === report.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-charcoal border border-white/5 rounded text-sm text-white/70 font-mono mb-4 break-words">
                                                    {report.description}
                                                </div>

                                                {report.reference_link && (
                                                    <a href={report.reference_link} target="_blank" rel="noopener noreferrer" className="text-phoenix text-xs font-mono hover:underline">
                                                        View Reference Link &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "partners" && (
                            <div className="animate-in fade-in">
                                <h2 className="text-xl text-white font-medium mb-6">Partnership Ecosystem</h2>
                                <p className="text-white/50 font-mono text-sm mb-6">Partner management UI goes here. You can add functions to Insert/Delete rows via Supabase.</p>
                                <div className="p-4 border border-white/10 bg-[#111]">
                                    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                                        <input type="text" placeholder="Partner Name" className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix" />
                                        <input type="text" placeholder="Website URL" className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white font-mono text-sm outline-none focus:border-phoenix" />
                                        <button type="button" className="px-6 py-3 bg-phoenix text-white font-mono text-sm uppercase">Add Partner</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "events" && (
                            <div className="text-center py-20 text-white/30 font-mono text-sm uppercase border border-dashed border-white/10">
                                Event Control System Offline
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
