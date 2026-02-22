"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Globe, FileWarning, ShieldAlert } from "lucide-react";
import React from 'react';

type Hunter = {
    username: string;
    total_points: number;
    total_reports: number;
    rank: string;
    avatar?: string;
    socials?: {
        github?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        website?: string;
    };
    latestReport?: {
        vulnerability: string;
        severity: string;
    } | null;
};

function PodiumItem({ hunter, position, height }: { hunter: Hunter, position: number, height: string }) {
    const isFirst = position === 1;
    const isSecond = position === 2;
    const color = isFirst ? 'text-yellow-400 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-gradient-to-t from-yellow-400/20 to-transparent' :
        isSecond ? 'text-gray-300 border-gray-300/50 shadow-[0_0_30px_rgba(209,213,219,0.3)] bg-gradient-to-t from-gray-400/20 to-transparent' :
            'text-amber-500 border-amber-600/50 shadow-[0_0_30px_rgba(217,119,6,0.3)] bg-gradient-to-t from-amber-600/20 to-transparent';
    const badgeBg = isFirst ? 'bg-yellow-400' : isSecond ? 'bg-gray-300' : 'bg-amber-600';
    const badgeText = isFirst ? 'text-black' : isSecond ? 'text-black' : 'text-white';

    const avatarSrc = hunter.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${hunter.username}`;

    return (
        <div className="flex flex-col items-center justify-end w-28 md:w-36 group relative">
            <Link href={`/hunter/${hunter.username}`} className="flex flex-col items-center group-hover:-translate-y-2 transition-transform z-10 duration-300 relative">
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-charcoal ${badgeBg} ${badgeText} shadow-lg z-20`}>
                    #{position}
                </div>
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${isFirst ? 'border-yellow-400' : isSecond ? 'border-gray-300' : 'border-amber-600'} overflow-hidden bg-charcoal shadow-2xl z-10 mb-[-20px]`}>
                    <Image src={avatarSrc} alt={hunter.username} fill className="object-cover" />
                </div>
            </Link>
            <div className={`w-full flex flex-col items-center justify-start rounded-t-xl border-t border-l border-r backdrop-blur-md relative ${color} ${height} pt-8 pb-4 px-2`}>
                <span className="font-bold text-white truncate w-full text-center text-sm md:text-base mt-2">{hunter.username}</span>
                <span className="font-mono text-xs md:text-sm font-bold mt-1 text-phoenix">{hunter.total_points.toLocaleString()} pts</span>
            </div>
        </div>
    );
}

export default function Leaderboard() {
    const [hunters, setHunters] = useState<Hunter[]>([]);
    const supabase = createClient();

    const fetchLeaderboard = async () => {
        const { data: lbData, error: lbError } = await supabase
            .from('bughunter_leaderboard')
            .select('*')
            .order('total_points', { ascending: false });

        if (lbError || !lbData) return;

        const usernames = lbData.map((h: { username: string }) => h.username);

        // Fetch user profiles & recent reports to enrich the leaderboard
        const { data: usersData } = await supabase
            .from('users')
            .select(`
                username,
                profiles (avatar, github_url, twitter_url, instagram_url, linkedin_url, website_url),
                whitehat_reports (vulnerability, severity, status, created_at)
            `)
            .in('username', usernames);

        const enrichedHunters: Hunter[] = lbData.map((hunter: { username: string, total_points: number, total_reports: number, rank: string }) => {
            const userExtra = usersData?.find(u => u.username === hunter.username);
            const profiles = userExtra?.profiles;
            const profile = Array.isArray(profiles) ? profiles[0] : profiles;

            // Filter only approved reports and find the latest one
            type RawReport = { status: string; vulnerability: string; severity: string; created_at: string };
            const rawReports = (userExtra?.whitehat_reports || []) as RawReport[];
            const approvedReports = rawReports
                .filter(r => r.status === 'approved')
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            let latestReport = null;
            if (approvedReports.length > 0) {
                latestReport = {
                    vulnerability: approvedReports[0].vulnerability,
                    severity: approvedReports[0].severity,
                };
            }

            return {
                ...hunter,
                avatar: profile?.avatar,
                socials: {
                    github: profile?.github_url,
                    twitter: profile?.twitter_url,
                    instagram: profile?.instagram_url,
                    linkedin: profile?.linkedin_url,
                    website: profile?.website_url,
                },
                latestReport
            };
        });

        setHunters(enrichedHunters);
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchLeaderboard();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rankConfig: Record<string, { image: string, color: string, bg: string }> = {
        'Ascended Phoenix': { image: '/rank-ascended.png', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]' },
        'Inferno Hunter': { image: '/rank-inferno.png', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
        'Phoenix Hunter': { image: '/rank-phoenix.png', color: 'text-phoenix', bg: 'bg-phoenix/10 border-phoenix/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
        'Flame Hunter': { image: '/rank-flame.png', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
        'Ember Hunter': { image: '/rank-ember.png', color: 'text-white/50', bg: 'bg-white/5 border-white/10' },
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

                {hunters.length === 0 && (
                    <div className="mb-8 p-12 border border-white/10 bg-[#111]/50 backdrop-blur-md text-center rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-phoenix/10 blur-[50px] rounded-full" />
                        <ShieldAlert size={48} className="text-white/20 mx-auto mb-4" />
                        <h3 className="font-display text-2xl text-white mb-2">No Hunters Ranked</h3>
                        <p className="font-mono text-sm text-white/50">There are no approved reports on the leaderboard yet. Be the first to secure the community.</p>
                    </div>
                )}

                {hunters.length > 0 && (
                    <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 mt-12 px-4">
                        {hunters[1] && <PodiumItem hunter={hunters[1]} position={2} height="h-40 md:h-48" />}
                        {hunters[0] && <PodiumItem hunter={hunters[0]} position={1} height="h-48 md:h-56" />}
                        {hunters[2] && <PodiumItem hunter={hunters[2]} position={3} height="h-32 md:h-40" />}
                    </div>
                )}

                {hunters.length > 3 && (
                    <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans border-collapse">
                                <thead className="bg-white/[0.02] border-b border-white/10 font-mono text-xs uppercase text-white/40 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-5 font-medium w-24">Rank</th>
                                        <th className="px-6 py-5 font-medium">Hunter</th>
                                        <th className="px-6 py-5 font-medium w-48">Title</th>
                                        <th className="px-6 py-5 font-medium">Latest Intel</th>
                                        <th className="px-6 py-5 font-medium w-40">Comms</th>
                                        <th className="px-6 py-5 font-medium text-center w-32">Approved</th>
                                        <th className="px-6 py-5 font-medium text-right text-phoenix w-40">Reputation Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {hunters.slice(3).map((hunter, index) => {
                                        const config = rankConfig[hunter.rank] || rankConfig['Ember Hunter'];
                                        const rankNum = index + 4; // Since slice(3) means starting at 4th place

                                        return (
                                            <tr key={hunter.username} className="hover:bg-white/[0.03] transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="font-mono text-xl font-bold flex items-center justify-center w-10 h-10 rounded-lg text-white/30">
                                                        #{rankNum}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <Link href={`/hunter/${hunter.username}`} className="flex items-center gap-4 group/hunter hover:bg-white/[0.02] p-2 -ml-2 rounded-xl transition-all">
                                                        <div className="relative w-12 h-12 rounded-full bg-charcoal border border-white/10 overflow-hidden flex items-center justify-center transition-all">
                                                            <Image
                                                                src={hunter.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${hunter.username}`}
                                                                alt={hunter.username}
                                                                fill
                                                                sizes="48px"
                                                                className="object-cover group-hover/hunter:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white group-hover/hunter:translate-x-1 transition-transform duration-300">{hunter.username}</span>
                                                            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Authorized Hunter</span>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md border bg-[#0a0a0a] text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${config.bg} ${config.color}`}>
                                                        <Image src={config.image} alt={hunter.rank} width={16} height={16} className="object-contain drop-shadow-md" />
                                                        {hunter.rank}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    {hunter.latestReport ? (
                                                        <div className="flex items-center gap-2 max-w-[200px] truncate">
                                                            <FileWarning size={14} className={
                                                                hunter.latestReport.severity === 'critical' ? 'text-red-500' :
                                                                    hunter.latestReport.severity === 'high' ? 'text-orange-500' :
                                                                        hunter.latestReport.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                                            } />
                                                            <span className="text-white/70 font-mono text-xs truncate" title={hunter.latestReport.vulnerability}>
                                                                {hunter.latestReport.vulnerability}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-white/30 font-mono text-xs italic">- No Data -</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2.5 items-center">
                                                        {hunter.socials?.github && (
                                                            <a href={hunter.socials.github.startsWith('http') ? hunter.socials.github : `https://github.com/${hunter.socials.github}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-all transform hover:scale-110" title="GitHub">
                                                                <Github size={15} />
                                                            </a>
                                                        )}
                                                        {hunter.socials?.twitter && (
                                                            <a href={hunter.socials.twitter.startsWith('http') ? hunter.socials.twitter : `https://twitter.com/${hunter.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-phoenix transition-all transform hover:scale-110" title="Twitter/X">
                                                                <Twitter size={15} />
                                                            </a>
                                                        )}
                                                        {hunter.socials?.linkedin && (
                                                            <a href={hunter.socials.linkedin.startsWith('http') ? hunter.socials.linkedin : `https://linkedin.com/in/${hunter.socials.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-blue-500 transition-all transform hover:scale-110" title="LinkedIn">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                                            </a>
                                                        )}
                                                        {hunter.socials?.instagram && (
                                                            <a href={hunter.socials.instagram.startsWith('http') ? hunter.socials.instagram : `https://instagram.com/${hunter.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-pink-500 transition-all transform hover:scale-110" title="Instagram">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                            </a>
                                                        )}
                                                        {hunter.socials?.website && (
                                                            <a href={hunter.socials.website.startsWith('http') ? hunter.socials.website : `https://${hunter.socials.website}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-emerald-400 transition-all transform hover:scale-110" title="Website">
                                                                <Globe size={15} />
                                                            </a>
                                                        )}
                                                        {!(hunter.socials?.github || hunter.socials?.twitter || hunter.socials?.linkedin || hunter.socials?.instagram || hunter.socials?.website) && (
                                                            <span className="text-white/10 font-mono text-[10px] tracking-widest uppercase">Classified</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] text-white/70 font-mono text-sm border border-white/5 group-hover:bg-white/10 transition-colors">
                                                        {hunter.total_reports}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <span className="font-mono text-lg font-bold text-phoenix group-hover:scale-105 inline-block transition-transform origin-right">
                                                        {hunter.total_points.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
