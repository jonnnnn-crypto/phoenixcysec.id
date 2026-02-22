import { createClient } from '@supabase/supabase-js';
import { Shield, Medal, CheckCircle, Calendar, ShieldAlert, Globe, Twitter, Github } from "lucide-react";
import Link from 'next/link';
import React from 'react';

// Simple server-side supabase client (read-only for public data)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export default async function HunterProfile({ params }: { params: { username: string } }) {
    // Wait for params in Next 15 if applicable, but we assume Next 14 here based on setup.
    const username = params.username;

    // Fetch from bughunter_leaderboard view
    const { data: hunterStats, error: viewError } = await supabase
        .from('bughunter_leaderboard')
        .select('*')
        .eq('username', username)
        .single();

    // Fetch basic user profile info joining users & profiles
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at, profiles(avatar, bio, skills, github_url, twitter_url, website_url)')
        .eq('username', username)
        .single();

    // If we don't have real DB plugged in yet, we'll provide fallback data
    const isMock = userError || viewError || !userData;

    const rankIcons: Record<string, React.ElementType> = {
        'Ascended Phoenix': Shield,
        'Inferno Hunter': ShieldAlert,
        'Phoenix Hunter': Shield,
        'Flame Hunter': Shield,
        'Ember Hunter': Shield,
    };

    const rank = hunterStats?.rank || "Ember Hunter";
    const points = hunterStats?.total_points || 0;
    const reports = hunterStats?.total_reports || 0;
    const joinDate = userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "2024-01-01";

    // profile relations might be array or single object depending on schema
    const profileDetails = Array.isArray(userData?.profiles) ? userData.profiles[0] : userData?.profiles;
    const skills = profileDetails?.skills || ["Web Hacking", "PythonScripting", "Linux Basics"];
    const bio = profileDetails?.bio || "An aspiring ethical hacker ready to secure the digital perimeter.";
    const avatar = profileDetails?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const githubLink = profileDetails?.github_url || null;
    const twitterLink = profileDetails?.twitter_url || null;
    const websiteLink = profileDetails?.website_url || null;

    const RankIcon = rankIcons[rank] || Shield;

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark border-t border-white/5 relative">
            {/* Background accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-phoenix/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    {" / "}
                    <Link href="/leaderboard" className="hover:text-white transition-colors">Hunters</Link>
                    {" / "}
                    <span className="text-white">{username}</span>
                </div>

                {isMock && (
                    <div className="mb-8 p-4 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-mono flex items-center gap-2">
                        <span className="animate-pulse">⚠️</span> Database connection missing or user not found. Displaying mock data.
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-[#111] border border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-phoenix-light via-phoenix to-phoenix-dark" />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={avatar}
                        alt={username}
                        className="w-32 h-32 md:w-40 md:w-40 bg-charcoal rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    />

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-phoenix/30 bg-phoenix/10 text-phoenix text-xs font-mono uppercase mb-4">
                            <RankIcon size={14} /> {rank}
                        </div>
                        <h1 className="font-display font-medium text-4xl text-white mb-2">{username}</h1>
                        <p className="text-white/60 font-sans font-light max-w-lg mb-6 leading-relaxed">
                            {bio}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-mono text-white/50">
                            <div className="flex items-center gap-2">
                                <Medal size={16} className="text-phoenix" /> {points} Reputation
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" /> {reports} Approved Reports
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} /> Joined {joinDate}
                            </div>
                        </div>

                        {/* Social Links */}
                        {(githubLink || twitterLink || websiteLink) && (
                            <div className="mt-6 flex gap-3">
                                {githubLink && (
                                    <a href={`https://github.com/${githubLink.replace('https://github.com/', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal border border-white/10 text-white/50 hover:text-white hover:border-phoenix/50 transition-all rounded-lg">
                                        <Github size={18} />
                                    </a>
                                )}
                                {twitterLink && (
                                    <a href={`https://twitter.com/${twitterLink.replace('https://twitter.com/', '').replace('https://x.com/', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal border border-white/10 text-white/50 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all rounded-lg">
                                        <Twitter size={18} />
                                    </a>
                                )}
                                {websiteLink && (
                                    <a href={websiteLink.startsWith('http') ? websiteLink : `https://${websiteLink}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal border border-white/10 text-white/50 hover:text-phoenix hover:border-phoenix/50 transition-all rounded-lg">
                                        <Globe size={18} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills & Recent Activity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {/* Details Column */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-[#111] border border-white/10 p-8">
                            <h3 className="font-display font-medium text-white text-xl mb-4 border-b border-white/10 pb-4">Verified Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill: string) => (
                                    <span key={skill} className="px-3 py-1 bg-charcoal border border-white/5 text-white/70 font-mono text-xs uppercase">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#111] border border-white/10 p-8">
                            <h3 className="font-display font-medium text-white text-xl mb-4 border-b border-white/10 pb-4">Badges</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="aspect-square bg-charcoal border border-white/5 flex items-center justify-center group relative cursor-help">
                                    <Shield size={24} className="text-phoenix opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap bg-white text-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">First Report</div>
                                </div>
                                {reports >= 5 && (
                                    <div className="aspect-square bg-charcoal border border-white/5 flex items-center justify-center group relative cursor-help">
                                        <ShieldAlert size={24} className="text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap bg-white text-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Veteran Hunter</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Column */}
                    <div className="md:col-span-2">
                        <div className="bg-[#111] border border-white/10 p-8 h-full">
                            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                <h3 className="font-display font-medium text-white text-xl">Recent Approved Reports</h3>
                                <span className="font-mono text-xs text-white/40 uppercase">Last 30 Days</span>
                            </div>

                            <div className="space-y-4">
                                {reports > 0 ? (
                                    // Mock reports since we don't fetch individual ones cleanly without a separate query
                                    [1, 2].slice(0, reports).map((i) => (
                                        <div key={i} className="group p-4 border border-white/5 bg-charcoal hover:border-phoenix/30 transition-colors flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="font-mono text-xs text-white/50 uppercase">Critical Vulnerability</span>
                                                </div>
                                                <h4 className="font-medium text-white group-hover:text-phoenix transition-colors">RCE via Authenticated File Upload</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-phoenix text-sm font-bold">+400 pts</div>
                                                <div className="font-mono text-[10px] text-white/30">Target Confused</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center border border-dashed border-white/10 flex flex-col items-center">
                                        <Medal size={32} className="text-white/10 mb-4" />
                                        <p className="text-white/40 font-mono text-sm uppercase">No reports published yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
