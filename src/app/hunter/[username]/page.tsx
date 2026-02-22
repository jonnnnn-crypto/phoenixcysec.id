import { createClient } from '@supabase/supabase-js';
import { Shield, Medal, CheckCircle, Calendar, ShieldAlert, Globe, Twitter, Github } from "lucide-react";
import Link from 'next/link';
import React from 'react';

// Simple server-side supabase client (read-only for public data)
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export default async function HunterProfile({ params }: { params: { username: string } }) {
    // Wait for params in Next 15 if applicable, but we assume Next 14 here based on setup.
    const username = decodeURIComponent(params.username);

    // Fetch from bughunter_leaderboard view
    const { data: hunterStats } = await supabase
        .from('bughunter_leaderboard')
        .select('*')
        .eq('username', username)
        .single();

    // Fetch basic user profile info joining users & profiles
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
            id,
            created_at, 
            profiles (avatar, bio, skills, github_url, twitter_url, instagram_url, linkedin_url, website_url)
        `)
        .eq('username', username)
        .single();

    // Fetch Recent Approved Reports for this specific user
    let recentReports = [];
    if (userData?.id) {
        const { data: reports } = await supabase
            .from('whitehat_reports')
            .select('*')
            .eq('user_id', userData.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(5);

        recentReports = reports || [];
    }

    // If we don't have real DB plugged in yet, we'll provide fallback data
    const isMock = userError || !userData;

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
    const instagramLink = profileDetails?.instagram_url || null;
    const linkedinLink = profileDetails?.linkedin_url || null;
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
                        {(githubLink || twitterLink || instagramLink || linkedinLink || websiteLink) && (
                            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
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
                                {instagramLink && (
                                    <a href={instagramLink.startsWith('http') ? instagramLink : `https://${instagramLink}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal border border-white/10 text-white/50 hover:text-pink-500 hover:border-pink-500/50 transition-all rounded-lg">
                                        {/* Lucide Instagram icon shorthand fallback using a visually similar circle representation because not imported, using custom SVG via JSX */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    </a>
                                )}
                                {linkedinLink && (
                                    <a href={linkedinLink.startsWith('http') ? linkedinLink : `https://${linkedinLink}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-charcoal border border-white/10 text-white/50 hover:text-blue-500 hover:border-blue-500/50 transition-all rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
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
                                {recentReports.length > 0 ? (
                                    recentReports.map((report) => (
                                        <div key={report.id} className="group p-4 border border-white/5 bg-charcoal hover:border-phoenix/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${report.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                                                        report.severity === 'high' ? 'bg-orange-500' :
                                                            report.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                                        }`} />
                                                    <span className="font-mono text-[10px] text-white/50 uppercase tracing-wider">{report.severity} Vulnerability</span>
                                                </div>
                                                <h4 className="font-medium text-white group-hover:text-phoenix transition-colors text-sm line-clamp-1 truncate" title={report.vulnerability}>{report.vulnerability}</h4>
                                            </div>
                                            <div className="md:text-right flex items-center md:items-end justify-between md:flex-col mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/10 md:border-none">
                                                <div className="font-mono text-phoenix text-sm font-bold">+{report.points} pts</div>
                                                <div className="font-mono text-[10px] text-white/30 truncate max-w-[150px]" title={report.target}>{report.target}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center border border-dashed border-white/10 flex flex-col items-center">
                                        <Medal size={32} className="text-white/10 mb-4" />
                                        <p className="text-white/40 font-mono text-sm uppercase">No verified reports yet</p>
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
