"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Shield, ShieldAlert } from "lucide-react";
import React from 'react';

type Hunter = {
    username: string;
    total_points: number;
    total_reports: number;
    rank: string;
};

export default function Leaderboard() {
    const [hunters, setHunters] = useState<Hunter[]>([]);
    const [isMock, setIsMock] = useState(false);
    const supabase = createClient();

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('bughunter_leaderboard')
            .select('*')
            .order('total_points', { ascending: false });

        if (error || !data || data.length === 0) {
            setIsMock(true);
            setHunters([
                { username: "hunter_1337", total_points: 5400, total_reports: 12, rank: "Ascended Phoenix" },
                { username: "0xGh0st", total_points: 2150, total_reports: 8, rank: "Inferno Hunter" },
                { username: "byte_ninja", total_points: 950, total_reports: 5, rank: "Phoenix Hunter" },
                { username: "newbie_sec", total_points: 350, total_reports: 2, rank: "Flame Hunter" },
            ]);
        } else {
            setIsMock(false);
            setHunters(data);
        }
    };

    useEffect(() => {
        fetchLeaderboard();

        // Subscribe to real-time changes
        // This requires realtime to be enabled on the underlying tables in Supabase for the view to update properly,
        // or listening to the 'whitehat_reports' and 'users' tables directly to trigger a re-fetch of the view.
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'whitehat_reports' }, () => {
                fetchLeaderboard();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                fetchLeaderboard();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rankIcons: Record<string, React.ElementType> = {
        'Ascended Phoenix': Shield,
        'Inferno Hunter': ShieldAlert,
        'Phoenix Hunter': Shield,
        'Flame Hunter': Shield,
        'Ember Hunter': Shield,
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark border-t border-white/5 relative">
            <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-phoenix/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="font-display font-medium text-4xl md:text-6xl text-white mb-4">
                        White Hat <span className="text-phoenix">Leaderboard</span>
                    </h1>
                    <p className="text-white/60 font-sans max-w-2xl mx-auto">
                        Honoring the elite contributors who actively report vulnerabilities and secure the digital ecosystem through responsible disclosure.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/50 uppercase">Live Real-Time Sync</span>
                    </div>
                </div>

                {isMock && (
                    <div className="mb-8 p-4 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-mono text-center">
                        Database connection missing or empty view. Displaying mock data for layout purposes.
                    </div>
                )}

                <div className="bg-[#111] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#1a1a1a] border-b border-white/10 font-mono text-xs uppercase text-white/40 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Rank</th>
                                    <th className="px-6 py-4 font-medium">Hunter</th>
                                    <th className="px-6 py-4 font-medium">Title</th>
                                    <th className="px-6 py-4 font-medium text-center">Approved Reports</th>
                                    <th className="px-6 py-4 font-medium text-right text-phoenix">Reputation Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {hunters.map((hunter, index) => {
                                    const Icon = rankIcons[hunter.rank] || Shield;
                                    const isTop3 = index < 3;

                                    return (
                                        <tr key={hunter.username} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-mono text-lg font-bold ${index === 0 ? "text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                                                    index === 1 ? "text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" :
                                                        index === 2 ? "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" :
                                                            "text-white/30"
                                                    }`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/hunter/${hunter.username}`} className="flex items-center gap-3 group-hover:text-phoenix transition-colors">
                                                    <div className={`w-8 h-8 rounded-md bg-charcoal border flex items-center justify-center ${isTop3 ? "border-phoenix/50" : "border-white/10"
                                                        }`}>
                                                        <span className="font-display font-bold text-white/80">{hunter.username.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="font-medium text-white">{hunter.username}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-white/10 bg-charcoal text-[10px] font-mono uppercase text-white/70">
                                                    <Icon size={12} className={hunter.rank === 'Ascended Phoenix' ? 'text-phoenix' : 'text-white/50'} />
                                                    {hunter.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-white/60 font-mono">
                                                {hunter.total_reports}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-phoenix">
                                                {hunter.total_points.toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
