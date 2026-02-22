"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Calendar, Users, MapPin, ExternalLink, Loader2, CheckCircle, ShieldAlert, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Event = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity: number;
    discord_link: string | null;
    flyer_url: string | null;
    registered_count?: number;
};

type Registration = {
    event_id: string;
    status: 'pending' | 'approved' | 'rejected';
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [userRegistrations, setUserRegistrations] = useState<Record<string, Registration['status']>>({});
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const supabase = createClient();

    const fetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // Fetch events with registration counts
        const { data: eventsData } = await supabase
            .from('events')
            .select(`
                *,
                registrations:event_registrations(count)
            `)
            .order('event_date', { ascending: true });

        if (eventsData) {
            const processedEvents = eventsData.map((e: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                ...e,
                registered_count: e.registrations?.[0]?.count || 0
            }));
            setEvents(processedEvents);
        }

        if (session?.user) {
            const { data: regData } = await supabase
                .from('event_registrations')
                .select('event_id, status')
                .eq('user_id', session.user.id);

            if (regData) {
                const regMap: Record<string, Registration['status']> = {};
                regData.forEach(r => regMap[r.event_id] = r.status);
                setUserRegistrations(regMap);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Realtime subscriptions
        const eventsChannel = supabase.channel('events-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRegister = async (eventId: string) => {
        if (!user) {
            window.location.href = '/join';
            return;
        }

        setRegistering(eventId);
        const { error } = await supabase
            .from('event_registrations')
            .insert([{
                event_id: eventId,
                user_id: user.id,
                username: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
            }]);

        if (error) {
            alert(error.message);
        } else {
            fetchData();
        }
        setRegistering(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-phoenix animate-spin" />
                    <p className="font-mono text-xs uppercase tracking-widest text-white/50">Loading Events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-phoenix/30">
            <Navbar />

            <main className="pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-[10px] font-mono tracking-widest uppercase mb-6">
                            <Zap size={10} className="fill-phoenix" />
                            Elite Learning Experience
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-6">
                            Phoenix <span className="text-phoenix">Classroom.</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-2xl font-light leading-relaxed">
                            Upgrade kemampuan cybersecurity Anda melalui kelas berlisensi yang dibimbing langsung
                            oleh praktisi. Slot terbatas untuk menjaga kualitas interaksi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {events.length === 0 ? (
                            <div className="lg:col-span-2 p-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center text-center">
                                <Calendar size={48} className="text-white/5 mb-6" />
                                <h3 className="text-xl font-display font-medium text-white/40 uppercase">No upcoming classes scheduled yet</h3>
                                <p className="text-white/20 mt-2 font-mono text-sm max-w-xs">Check back soon for new specialized training sessions.</p>
                            </div>
                        ) : (
                            events.map((event) => {
                                const regStatus = userRegistrations[event.id];
                                const isFull = (event.registered_count || 0) >= event.capacity;

                                return (
                                    <div key={event.id} className="group relative bg-[#0d0d0d] border border-white/5 p-8 overflow-hidden transition-all hover:border-phoenix/30">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShieldAlert size={120} />
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                            {/* Date Box */}
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-phoenix/5 border border-phoenix/20">
                                                <span className="text-phoenix text-3xl font-display font-bold">
                                                    {new Date(event.event_date).getDate()}
                                                </span>
                                                <span className="text-white/40 text-[10px] uppercase font-mono tracking-widest">
                                                    {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-phoenix transition-colors">
                                                    {event.title}
                                                </h3>
                                                <p className="text-white/50 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                                                    {event.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase">
                                                        <MapPin size={12} className="text-phoenix" />
                                                        {event.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase">
                                                        <Users size={12} className="text-phoenix" />
                                                        {event.registered_count} / {event.capacity} Slots
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    {!regStatus ? (
                                                        <button
                                                            onClick={() => handleRegister(event.id)}
                                                            disabled={isFull || registering === event.id}
                                                            className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all ${isFull
                                                                ? "bg-white/5 text-white/20 cursor-not-allowed"
                                                                : "bg-white text-black hover:bg-phoenix hover:text-white"
                                                                }`}
                                                        >
                                                            {registering === event.id ? "Processing..." : isFull ? "Class Full" : "Reserve Slot"}
                                                        </button>
                                                    ) : regStatus === 'pending' ? (
                                                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs uppercase tracking-widest">
                                                            <Loader2 size={12} className="animate-spin" />
                                                            Waiting Approval
                                                        </div>
                                                    ) : regStatus === 'approved' ? (
                                                        <a
                                                            href={event.discord_link || "#"}
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                                                        >
                                                            <CheckCircle size={12} />
                                                            Enter Classroom <ExternalLink size={10} />
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-widest">
                                                            <ShieldAlert size={12} />
                                                            Registration Denied
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
