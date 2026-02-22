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
                profiles (github_url, twitter_url, instagram_url, linkedin_url, website_url),
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
                    <div className="mb-8 p-12 border border-white/10 bg-[#111] text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-phoenix/5 blur-[50px]" />
                        <ShieldAlert size={48} className="text-white/20 mx-auto mb-4" />
                        <h3 className="font-display text-xl text-white mb-2">No Hunters Ranked</h3>
                        <p className="font-mono text-sm text-white/50">There are no approved reports on the leaderboard yet. Be the first to secure the community.</p>
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
                                    <th className="px-6 py-4 font-medium">Latest Intel</th>
                                    <th className="px-6 py-4 font-medium">Comms</th>
                                    <th className="px-6 py-4 font-medium text-center">Approved</th>
                                    <th className="px-6 py-4 font-medium text-right text-phoenix">Reputation Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {hunters.map((hunter, index) => {
                                    const config = rankConfig[hunter.rank] || rankConfig['Ember Hunter'];
                                    const isTop3 = index < 3;

                                    return (
                                        <tr key={hunter.username} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-mono text-lg font-bold ${index === 0 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" :
                                                    index === 1 ? "text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" :
                                                        index === 2 ? "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" :
                                                            "text-white/30"
                                                    }`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/hunter/${hunter.username}`} className="flex items-center gap-3 group/hunter group-hover:text-phoenix transition-colors">
                                                    <div className={`w-10 h-10 rounded-xl bg-charcoal border overflow-hidden flex items-center justify-center transition-all ${isTop3 ? "border-phoenix/50 ring-2 ring-phoenix/20" : "border-white/10"
                                                        }`}>
                                                        <Image
                                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${hunter.username}`}
                                                            alt={hunter.username}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover group-hover/hunter:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white group-hover/hunter:translate-x-1 transition-transform duration-300">{hunter.username}</span>
                                                        <span className="text-[9px] font-mono text-white/30 tracking-tight uppercase">Authorized Hunter</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border bg-[#0a0a0a] text-[10px] font-mono uppercase tracking-wider font-bold transition-all ${config.bg} ${config.color}`}>
                                                    <Image src={config.image} alt={hunter.rank} width={14} height={14} className="object-contain" />
                                                    {hunter.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                                        <a href={`https://github.com/${hunter.socials.github.replace('https://github.com/', '')}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-all transform hover:scale-110" title="GitHub">
                                                            <Github size={15} />
                                                        </a>
                                                    )}
                                                    {hunter.socials?.twitter && (
                                                        <a href={`https://twitter.com/${hunter.socials.twitter.replace('https://twitter.com/', '').replace('https://x.com/', '')}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-phoenix transition-all transform hover:scale-110" title="Twitter/X">
                                                            <Twitter size={15} />
                                                        </a>
                                                    )}
                                                    {hunter.socials?.linkedin && (
                                                        <a href={hunter.socials.linkedin.startsWith('http') ? hunter.socials.linkedin : `https://${hunter.socials.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-blue-500 transition-all transform hover:scale-110" title="LinkedIn">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                                        </a>
                                                    )}
                                                    {hunter.socials?.instagram && (
                                                        <a href={hunter.socials.instagram.startsWith('http') ? hunter.socials.instagram : `https://${hunter.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-pink-500 transition-all transform hover:scale-110" title="Instagram">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                        </a>
                                                    )}
                                                    {hunter.socials?.website && (
                                                        <a href={hunter.socials.website.startsWith('http') ? hunter.socials.website : `https://${hunter.socials.website}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-emerald-400 transition-all transform hover:scale-110" title="Website">
                                                            <Globe size={15} />
                                                        </a>
                                                    )}
                                                    {!(hunter.socials?.github || hunter.socials?.twitter || hunter.socials?.linkedin || hunter.socials?.instagram || hunter.socials?.website) && (
                                                        <span className="text-white/10 font-mono text-[10px] tracking-widest italic opacity-50">Private</span>
                                                    )}
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
