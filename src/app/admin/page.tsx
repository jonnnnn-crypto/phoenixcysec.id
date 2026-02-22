"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    Users, FileWarning, Handshake, ShieldAlert, CheckCircle,
    XCircle, Loader2, Trash2, Calendar, Settings,
    ChevronRight, LayoutDashboard, Database,
    ExternalLink, AlertTriangle, Search, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PendingReport = {
    id: string;
    vulnerability: string;
    target: string;
    target_type?: string;
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

type Event = {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    location: string;
    capacity: number;
    discord_link?: string;
    registered_count?: number;
};

type Registration = {
    id: string;
    event_id: string;
    user_id: string;
    username: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    events?: { title: string };
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    // Real data states
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // Form states
    const [newPartnerName, setNewPartnerName] = useState("");
    const [newPartnerUrl, setNewPartnerUrl] = useState("");
    const [newPartnerCategory, setNewPartnerCategory] = useState("Educational Partner");

    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDesc, setNewEventDesc] = useState("");
    const [newEventDate, setNewEventDate] = useState("");
    const [newEventLocation, setNewEventLocation] = useState("");
    const [newEventCapacity, setNewEventCapacity] = useState(50);
    const [newEventDiscord, setNewEventDiscord] = useState("");
    const [showTimePicker, setShowTimePicker] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const setQuickDate = (type: 'tomorrow' | 'saturday' | 'next-week') => {
        const date = new Date();
        if (type === 'tomorrow') {
            date.setDate(date.getDate() + 1);
        } else if (type === 'saturday') {
            const day = date.getDay();
            const diff = (6 - day + 7) % 7;
            date.setDate(date.getDate() + (diff === 0 ? 7 : diff));
        } else if (type === 'next-week') {
            date.setDate(date.getDate() + 7);
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const currentTime = newEventDate.split('T')[1] || "19:00";
        setNewEventDate(`${year}-${month}-${day}T${currentTime}`);
    };

    const setQuickTime = (time: string) => {
        const currentDate = newEventDate.split('T')[0];
        if (currentDate) {
            setNewEventDate(`${currentDate}T${time}`);
        } else {
            const today = new Date().toISOString().split('T')[0];
            setNewEventDate(`${today}T${time}`);
        }
    };

    const setNowTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setNewEventDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    };

    const adjustTime = (minutes: number) => {
        if (!newEventDate) return;
        const date = new Date(newEventDate);
        date.setMinutes(date.getMinutes() + minutes);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        setNewEventDate(`${year}-${month}-${day}T${hours}:${minutes < 0 && date.getMinutes() === 0 ? '00' : min}`);
    };

    const fetchDashboardData = async () => {
        const { data: reportsData } = await supabase
            .from('whitehat_reports')
            .select('*, users(username)')
            .eq('status', 'pending');
        if (reportsData) setPendingReports(reportsData as unknown as PendingReport[]);

        const { data: partnersData } = await supabase.from('partners').select('*').order('name');
        if (partnersData) setPartners(partnersData as Partner[]);

        const { data: eventsData } = await supabase.from('events').select('*').order('event_date', { ascending: true });
        if (eventsData) setEvents(eventsData as Event[]);

        const { data: regData } = await supabase
            .from('event_registrations')
            .select('*, events(title)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (regData) setRegistrations(regData as unknown as Registration[]);

        const { count: memberCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (memberCount !== null) setTotalMembers(memberCount);
    };

    useEffect(() => {
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
                router.push('/dashboard');
                return;
            }

            setIsAdmin(true);
            fetchDashboardData();
        };

        checkAdminAndFetchData();

        // Realtime sync
        const channel = supabase.channel('admin-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'whitehat_reports' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => fetchDashboardData())
            .subscribe();

        return () => { supabase.removeChannel(channel) };
    }, [router, supabase]);

    // Mod functions
    const handleModerateReport = async (reportId: string, action: 'approve' | 'reject') => {
        setLoadingAction(reportId);
        const { error } = await supabase
            .from('whitehat_reports')
            .update({ status: action === 'approve' ? 'approved' : 'rejected' })
            .eq('id', reportId);

        if (error) alert("Error: " + error.message);
        else fetchDashboardData();
        setLoadingAction(null);
    };

    const handleModerateRegistration = async (regId: string, action: 'approved' | 'rejected') => {
        setLoadingAction(regId);
        const { error } = await supabase
            .from('event_registrations')
            .update({ status: action })
            .eq('id', regId);

        if (error) alert("Error: " + error.message);
        else fetchDashboardData();
        setLoadingAction(null);
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('add_partner');
        const { error } = await supabase
            .from('partners')
            .insert([{ name: newPartnerName, website: newPartnerUrl, category: newPartnerCategory }]);

        if (error) alert(error.message);
        else {
            setNewPartnerName(""); setNewPartnerUrl("");
            fetchDashboardData();
        }
        setLoadingAction(null);
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('add_event');
        const { data: sessionData } = await supabase.auth.getSession();
        const { error } = await supabase
            .from('events')
            .insert([{
                title: newEventTitle,
                description: newEventDesc,
                event_date: newEventDate,
                location: newEventLocation,
                capacity: newEventCapacity,
                discord_link: newEventDiscord,
                created_by: sessionData.session?.user.id
            }]);

        if (error) alert(error.message);
        else {
            setNewEventTitle(""); setNewEventDesc(""); setNewEventDate(""); setNewEventLocation(""); setNewEventDiscord("");
            fetchDashboardData();
        }
        setLoadingAction(null);
    };

    const handleDeleteItem = async (table: string, id: string) => {
        if (!confirm(`Delete this ${table.slice(0, -1)}?`)) return;
        setLoadingAction(id);
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) fetchDashboardData();
        setLoadingAction(null);
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-phoenix animate-spin" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Authenticating Proxy...</p>
                </div>
            </div>
        );
    }

    const navigation = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "reports", label: "Vulnerability Triage", icon: FileWarning, badge: pendingReports.length },
        { id: "events", label: "Event Management", icon: Calendar, badge: registrations.length },
        { id: "partners", label: "Partners", icon: Handshake },
        { id: "settings", label: "System Config", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar Navigation */}
            <aside className="w-80 border-r border-white/5 bg-[#080808] hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-phoenix/20 border border-phoenix/50 rounded flex items-center justify-center">
                            <ShieldAlert size={18} className="text-phoenix" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tighter uppercase">Phoenix<span className="text-phoenix">Admin</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">Secure Node 01 // V1.2.4</span>
                    </div>
                </div>

                <nav className="p-4 flex-1 space-y-1">
                    {navigation.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${activeTab === item.id
                                ? "bg-white/5 border border-white/10 text-white shadow-xl"
                                : "text-white/40 hover:text-white hover:bg-white/2 border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={activeTab === item.id ? "text-phoenix" : "group-hover:text-phoenix/70"} />
                                <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
                            </div>
                            {item.badge ? (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeTab === item.id ? "bg-phoenix text-white" : "bg-white/10 text-white/50"}`}>
                                    {item.badge}
                                </span>
                            ) : (
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-40" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={() => { supabase.auth.signOut(); router.push('/') }}
                        className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={14} /> Emergency Logoff
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen relative overflow-hidden bg-grid-pattern bg-[length:30px_30px] bg-fixed">
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />

                {/* Header Container */}
                <div className="p-8 md:p-12 relative z-10">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-display font-medium text-white mb-1 uppercase tracking-tight">
                                {navigation.find(n => n.id === activeTab)?.label}
                            </h2>
                            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">Operational Dashboard // Root Access</p>
                        </div>
                        <div className="flex items-center gap-4 bg-[#111] border border-white/5 p-2 rounded-lg">
                            <div className="px-4 py-2 border-r border-white/5 text-center">
                                <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Systems</div>
                                <div className="text-green-500 font-mono font-bold text-xs uppercase">Optimal</div>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Uptime</div>
                                <div className="text-white font-mono font-bold text-xs">99.98%</div>
                            </div>
                        </div>
                    </header>

                    {/* Content Switcher */}
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {[
                                    { label: "Total Members", val: totalMembers, icon: Users, trend: "+12% this week" },
                                    { label: "Pending Triages", val: pendingReports.length, icon: FileWarning, alert: pendingReports.length > 0 },
                                    { label: "Active Events", val: events.length, icon: Calendar, trend: "3 sessions scheduled" },
                                    { label: "Partner Network", val: partners.length, icon: Handshake, trend: "2 new requests" },
                                ].map((stat, i) => (
                                    <div key={i} className={`p-8 bg-[#0d0d0d] border ${stat.alert ? 'border-phoenix/40 shadow-[0_0_20px_rgba(255,21,0,0.05)]' : 'border-white/5'} hover:border-white/10 transition-all rounded-xl relative overflow-hidden group`}>
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
                                            <stat.icon size={100} />
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-2 rounded ${stat.alert ? 'bg-phoenix/20 text-phoenix' : 'bg-white/5 text-white/40'}`}>
                                                <stat.icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-mono text-white/20 uppercase">{stat.trend || "Stable"}</span>
                                        </div>
                                        <div className="font-display text-4xl font-bold text-white mb-1 tracking-tight">{stat.val}</div>
                                        <div className="text-xs font-mono text-white/40 uppercase tracking-widest leading-none">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === "reports" && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono flex items-center gap-2">
                                            <Search size={14} className="text-white/30" />
                                            <input type="text" placeholder="Search by Target / Username..." className="bg-transparent border-none outline-none text-white w-64" />
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-white/30 uppercase tracking-[0.2em]">{pendingReports.length} REPORTS IN QUEUE</div>
                                </div>

                                {pendingReports.length === 0 ? (
                                    <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl">
                                        <CheckCircle size={40} className="text-white/5 mx-auto mb-4" />
                                        <p className="font-mono text-sm text-white/20 uppercase tracking-widest">Command queue is clear.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {pendingReports.map(report => (
                                            <div key={report.id} className="p-8 bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all rounded-xl flex flex-col lg:flex-row gap-8">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                                            report.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                                            }`}>
                                                            {report.severity}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-white/30">{new Date(report.created_at).toLocaleDateString()} / {new Date(report.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    <h4 className="text-xl font-display font-medium text-white mb-2">{report.vulnerability}</h4>
                                                    <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-6 uppercase">
                                                        <Database size={12} className="text-phoenix" /> {report.target}
                                                        {report.target_type && <span className="px-2 py-0.5 bg-black border border-white/10 text-white/90 rounded text-[9px] font-bold tracking-wider">{report.target_type}</span>}
                                                        <span className="mx-2 opacity-20">/</span>
                                                        <Users size={12} className="text-phoenix" /> @{report.users?.username || 'Unknown'}
                                                    </div>
                                                    <div className="p-4 bg-black/40 border border-white/5 rounded-lg text-sm text-white/60 font-mono leading-relaxed max-h-40 overflow-y-auto mb-4 break-words whitespace-pre-wrap">
                                                        {report.description}
                                                    </div>
                                                    {report.reference_link && (
                                                        <a href={report.reference_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-phoenix text-[10px] font-bold font-mono hover:text-white transition-colors uppercase tracking-widest">
                                                            View Evidence Reference <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex lg:flex-col justify-center gap-3 lg:w-48">
                                                    <button
                                                        onClick={() => handleModerateReport(report.id, 'approve')}
                                                        disabled={!!loadingAction}
                                                        className="flex-1 py-3 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 rounded disabled:opacity-50"
                                                    >
                                                        {loadingAction === report.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleModerateReport(report.id, 'reject')}
                                                        disabled={!!loadingAction}
                                                        className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 rounded disabled:opacity-50"
                                                    >
                                                        {loadingAction === report.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />} Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "events" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left: Registration Triage Center */}
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                                <Users size={12} className="text-phoenix/60" /> Applications
                                            </h3>
                                            <span className="text-[9px] font-mono text-phoenix/80 bg-phoenix/5 border border-phoenix/10 px-2 py-0.5 rounded-full">{registrations.length}</span>
                                        </div>

                                        <div className="space-y-2 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
                                            {registrations.length === 0 ? (
                                                <div className="py-16 text-center border border-white/5 rounded-xl bg-black/40">
                                                    <Users size={32} className="text-white/5 mx-auto mb-3" />
                                                    <p className="font-mono text-[9px] text-white/10 uppercase tracking-widest leading-relaxed">No pending student<br />activity detected.</p>
                                                </div>
                                            ) : (
                                                registrations.map(reg => (
                                                    <div key={reg.id} className="p-4 bg-black/40 border border-white/5 hover:border-phoenix/40 transition-all rounded-xl relative group">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-phoenix/10 border border-phoenix/20 flex items-center justify-center font-mono text-[10px] text-phoenix">
                                                                        {reg.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="font-mono text-[11px] font-bold text-white/90">@{reg.username}</div>
                                                                </div>
                                                                <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Student v2.1</div>
                                                            </div>

                                                            <div className="mb-4 p-2.5 bg-white/2 border border-white/5 rounded-lg">
                                                                <div className="text-[7px] font-mono text-white/20 uppercase mb-1">Target Operation</div>
                                                                <div className="text-[9px] font-mono font-bold text-white/70 truncate">{reg.events?.title}</div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button
                                                                    onClick={() => handleModerateRegistration(reg.id, 'approved')}
                                                                    disabled={!!loadingAction}
                                                                    className="py-2 bg-green-500/5 border border-green-500/20 text-green-500/70 text-[8px] font-mono font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all rounded-md disabled:opacity-50"
                                                                >
                                                                    Authorize
                                                                </button>
                                                                <button
                                                                    onClick={() => handleModerateRegistration(reg.id, 'rejected')}
                                                                    disabled={!!loadingAction}
                                                                    className="py-2 bg-red-500/5 border border-red-500/20 text-red-500/70 text-[8px] font-mono font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-md disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Management Center */}
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Create Class Card */}
                                            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute -right-6 -top-6 opacity-[0.02] group-hover:opacity-[0.04] transition-all rotate-12">
                                                    <Calendar size={180} />
                                                </div>
                                                <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                                    <Calendar className="text-phoenix/60" size={12} /> Deployment Center
                                                </h3>
                                                <form onSubmit={handleAddEvent} className="space-y-3.5">
                                                    <div>
                                                        <label className="block text-[8px] font-mono text-white/20 uppercase mb-1.5 ml-1">Operation Title</label>
                                                        <input type="text" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full bg-black/60 border border-white/10 p-3.5 text-white font-mono text-[11px] outline-none focus:border-phoenix/50 rounded-xl transition-all" placeholder="PHX-CORE-01" />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="flex justify-between items-center mb-1.5 px-1">
                                                                <label className="block text-[8px] font-mono text-white/20 uppercase">Deployment Time (WIB)</label>
                                                                <div className="flex bg-black/40 border border-white/5 p-0.5 rounded-md overflow-hidden">
                                                                    <button type="button" onClick={setNowTime} className="text-[7px] font-mono text-white/30 hover:text-white hover:bg-white/5 px-1.5 py-0.5 transition-all">NOW</button>
                                                                    <button type="button" onClick={() => setQuickDate('tomorrow')} className="text-[7px] font-mono text-white/30 hover:text-white hover:bg-white/5 px-1.5 py-0.5 border-l border-white/5 transition-all">BESOK</button>
                                                                </div>
                                                            </div>

                                                            <div className="relative group/picker">
                                                                <div className="flex bg-black/60 border border-white/10 group-focus-within/picker:border-phoenix/50 rounded-t-xl transition-all overflow-hidden">
                                                                    <input
                                                                        type="datetime-local"
                                                                        required
                                                                        value={newEventDate}
                                                                        onChange={e => setNewEventDate(e.target.value)}
                                                                        className="flex-1 bg-transparent p-3 text-white font-mono text-[10px] outline-none"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowTimePicker(!showTimePicker)}
                                                                        className={`px-3 flex items-center gap-2 font-mono text-[7px] uppercase transition-all ${showTimePicker ? 'bg-phoenix text-white' : 'text-white/20 hover:text-white hover:bg-white/5 border-l border-white/10'}`}
                                                                    >
                                                                        <Clock size={10} />
                                                                    </button>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {showTimePicker && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.98, y: -5 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.98, y: -5 }}
                                                                            className="absolute right-0 top-full mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-50 p-5 backdrop-blur-3xl max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                                                                        >
                                                                            <div className="mb-4 pb-4 border-b border-white/5">
                                                                                <div className="text-[7px] font-mono text-white/20 uppercase mb-3 tracking-[0.3em]">Sesi Cepat (WIB)</div>
                                                                                <div className="grid grid-cols-3 gap-2 mb-2">
                                                                                    {['19:00', '20:00', '21:00'].map(time => (
                                                                                        <button
                                                                                            key={time}
                                                                                            type="button"
                                                                                            onClick={() => setQuickTime(time)}
                                                                                            className="py-2 px-1 text-[9px] font-mono bg-white/5 border border-white/5 rounded-lg text-white/40 hover:bg-phoenix hover:text-white hover:border-phoenix transition-all"
                                                                                        >
                                                                                            {time}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <div className="mb-4 pb-4 border-b border-white/5">
                                                                                <div className="text-[7px] font-mono text-white/20 uppercase mb-3 tracking-[0.3em]">Pilih Jam (WIB)</div>
                                                                                <div className="grid grid-cols-6 gap-1">
                                                                                    {Array.from({ length: 24 }).map((_, i) => {
                                                                                        const h = String(i).padStart(2, '0');
                                                                                        const currentH = newEventDate.split('T')[1]?.split(':')[0];
                                                                                        return (
                                                                                            <button
                                                                                                key={h}
                                                                                                type="button"
                                                                                                onClick={() => setQuickTime(`${h}:${newEventDate.split('T')[1]?.split(':')[1] || '00'}`)}
                                                                                                className={`p-1.5 text-[9px] font-mono rounded transition-all ${currentH === h ? 'bg-phoenix text-white' : 'hover:bg-white/5 text-white/30'}`}
                                                                                            >
                                                                                                {h}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-[7px] font-mono text-white/20 uppercase mb-3 tracking-[0.3em]">Pilih Menit</div>
                                                                                <div className="grid grid-cols-6 gap-1">
                                                                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                                                                                        const min = String(m).padStart(2, '0');
                                                                                        const currentM = newEventDate.split('T')[1]?.split(':')[1];
                                                                                        return (
                                                                                            <button
                                                                                                key={min}
                                                                                                type="button"
                                                                                                onClick={() => setQuickTime(`${newEventDate.split('T')[1]?.split(':')[0] || '19'}:${min}`)}
                                                                                                className={`p-1.5 text-[9px] font-mono rounded transition-all ${currentM === min ? 'bg-phoenix text-white' : 'hover:bg-white/5 text-white/30'}`}
                                                                                            >
                                                                                                {min}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                <div className="bg-white/[0.02] border-x border-b border-white/10 rounded-b-xl px-2.5 py-2 flex justify-between items-center">
                                                                    <div className="flex gap-1.5">
                                                                        <button type="button" onClick={() => adjustTime(60)} className="text-[7px] font-mono text-white/20 hover:text-white px-1.5 py-0.5 bg-white/5 rounded transition-all">+1H</button>
                                                                        <button type="button" onClick={() => adjustTime(15)} className="text-[7px] font-mono text-white/20 hover:text-white px-1.5 py-0.5 bg-white/5 rounded transition-all">+15M</button>
                                                                    </div>
                                                                    <div className="text-[8px] font-mono text-phoenix/80 tracking-widest uppercase font-bold">
                                                                        {newEventDate ? new Date(newEventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '---'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[8px] font-mono text-white/20 uppercase mb-1.5 ml-1">Max Nodes</label>
                                                            <input type="number" required value={newEventCapacity} onChange={e => setNewEventCapacity(parseInt(e.target.value))} className="w-full bg-black/60 border border-white/10 p-3.5 text-white font-mono text-[11px] outline-none focus:border-phoenix/50 rounded-xl" placeholder="50" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[8px] font-mono text-white/20 uppercase mb-1.5 ml-1">Location ID</label>
                                                            <input type="text" required value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} className="w-full bg-black/60 border border-white/10 p-3.5 text-white font-mono text-[11px] outline-none focus:border-phoenix/50 rounded-xl" placeholder="Discord-X" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[8px] font-mono text-white/20 uppercase mb-1.5 ml-1">Access Payload</label>
                                                            <input type="url" required value={newEventDiscord} onChange={e => setNewEventDiscord(e.target.value)} className="w-full bg-black/60 border border-white/10 p-3.5 text-white font-mono text-[11px] outline-none focus:border-phoenix/50 rounded-xl" placeholder="https://..." />
                                                        </div>
                                                    </div>

                                                    <button
                                                        disabled={loadingAction === 'add_event'}
                                                        type="submit"
                                                        className="w-full py-4 bg-white text-black hover:bg-phoenix hover:text-white font-mono text-[9px] font-bold uppercase tracking-[0.4em] transition-all rounded-xl mt-4 shadow-xl shadow-black/20 active:scale-[0.98]"
                                                    >
                                                        {loadingAction === 'add_event' ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Deploy Protocol"}
                                                    </button>
                                                </form>
                                            </div>

                                            {/* Live Classrooms: Terminal Style */}
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between mb-4 px-1">
                                                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                                        <Database className="text-phoenix/60" size={12} /> Live Clusters
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{events.length} Active</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
                                                    {events.length === 0 ? (
                                                        <div className="py-20 text-center border border-white/5 rounded-2xl bg-black/40">
                                                            <Database size={32} className="text-white/5 mx-auto mb-3" />
                                                            <p className="font-mono text-[9px] text-white/10 uppercase tracking-widest leading-relaxed">No clusters currently<br />broadcasting.</p>
                                                        </div>
                                                    ) : (
                                                        events.map(ev => (
                                                            <div key={ev.id} className="p-4 border border-white/5 bg-black/40 hover:border-phoenix/30 hover:bg-black/60 transition-all rounded-xl group/item relative overflow-hidden">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="w-1 h-3 bg-phoenix/60 rounded-full" />
                                                                        <div className="font-mono text-[11px] font-bold text-white/90 group-hover/item:text-phoenix transition-colors">{ev.title}</div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteItem('events', ev.id)}
                                                                        className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-500 transition-all p-1"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-1 pl-3.5">
                                                                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/30">
                                                                        <Calendar size={10} className="text-white/10" />
                                                                        {new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/30">
                                                                        <Users size={10} className="text-white/10" />
                                                                        N:{ev.capacity}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/30 justify-end">
                                                                        <ShieldAlert size={10} className="text-white/10" />
                                                                        <span className="truncate max-w-[50px]">{ev.location}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "partners" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="p-8 bg-[#0d0d0d] border border-white/5 rounded-xl">
                                    <h3 className="text-lg font-display font-medium uppercase tracking-tight mb-6">Ecosystem Expansion</h3>
                                    <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div>
                                            <label className="block text-[10px] font-mono text-white/30 uppercase mb-2">Partner Name</label>
                                            <input type="text" required value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white font-mono text-sm outline-none focus:border-phoenix rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-white/30 uppercase mb-2">Website</label>
                                            <input type="url" required value={newPartnerUrl} onChange={e => setNewPartnerUrl(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white font-mono text-sm outline-none focus:border-phoenix rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-white/30 uppercase mb-2">Category</label>
                                            <select value={newPartnerCategory} onChange={e => setNewPartnerCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-white font-mono text-sm outline-none focus:border-phoenix appearance-none rounded">
                                                <option>Educational Partner</option>
                                                <option>Community Partner</option>
                                                <option>Media Partner</option>
                                                <option>Security Collaboration</option>
                                            </select>
                                        </div>
                                        <button disabled={loadingAction === 'add_partner'} type="submit" className="py-4 bg-white text-black hover:bg-phoenix hover:text-white font-mono text-xs font-bold uppercase rounded transition-all">
                                            {loadingAction === 'add_partner' ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Link Partner"}
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-[#0b0b0b] border border-white/5 rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 font-mono text-[10px] text-white/40 uppercase">
                                            <tr>
                                                <th className="p-6">Entity</th>
                                                <th className="p-6">Classification</th>
                                                <th className="p-6 text-right">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 font-sans text-sm">
                                            {partners.map(p => (
                                                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                                                    <td className="p-6">
                                                        <div className="font-bold text-white">{p.name}</div>
                                                        <a href={p.website} target="_blank" className="text-[10px] font-mono text-phoenix hover:underline">{p.website}</a>
                                                    </td>
                                                    <td className="p-6 text-white/50">{p.category}</td>
                                                    <td className="p-6 text-right">
                                                        <button onClick={() => handleDeleteItem('partners', p.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                                <Settings size={48} className="text-white/5 mb-4 animate-slow-spin" />
                                <h3 className="text-xl font-display font-medium text-white/20 uppercase tracking-widest">System Configuration</h3>
                                <p className="text-white/10 font-mono text-[10px] mt-2 tracking-[0.4em uppercase]">Protected Kernel Modules // Not Accessible via Proxy</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}


