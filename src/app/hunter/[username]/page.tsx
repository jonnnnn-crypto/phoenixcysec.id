import { createClient } from '@/lib/supabase';
import React from 'react';
import HunterProfileContent from '@/components/HunterProfileContent';

export const dynamic = 'force-dynamic';

export default async function HunterProfile({ params }: { params: { username: string } }) {
    const username = decodeURIComponent(params.username);
    const supabase = createClient();

    // Fetch initial stats from leaderboard view
    const { data: hunterStats } = await supabase
        .from('bughunter_leaderboard')
        .select('*')
        .ilike('username', username)
        .limit(1)
        .maybeSingle();

    // Fetch initial user profile info
    console.log(`[Server] Fetching user: ${username}`);
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
            id,
            username,
            created_at, 
            profiles (avatar, bio, skills, github_url, twitter_url, instagram_url, linkedin_url, website_url)
        `)
        .ilike('username', username)
        .limit(1)
        .maybeSingle();

    if (userError) console.error(`[Server] User lookup error for ${username}:`, userError);
    if (!userData) console.warn(`[Server] User not found: ${username}`);

    // Fetch initial Recent Approved Reports
    type Report = { id: string; target: string; vulnerability: string; severity: string; points: number; created_at: string };
    let recentReports: Report[] = [];
    if (userData?.id) {
        const { data: reports } = await supabase
            .from('whitehat_reports')
            .select('*')
            .eq('user_id', userData.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(5);

        recentReports = (reports || []) as Report[];
    }

    const isMock = !!userError || !userData;

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark border-t border-white/5 relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-phoenix/5 blur-[120px] rounded-full pointer-events-none" />

            <HunterProfileContent
                username={username}
                initialStats={hunterStats}
                initialUserData={userData}
                initialReports={recentReports}
                isMock={isMock}
            />
        </div>
    );
}
