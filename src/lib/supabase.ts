import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

export const createClient = () => {
    // In browser context, use a singleton to prevent Navigator LockManager timeouts 
    // caused by creating multiple clients on React re-renders
    if (typeof window !== "undefined" && supabaseInstance) {
        return supabaseInstance;
    }

    const client = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                // Ensures session survives browser restarts
                storage: typeof window !== "undefined" ? window.localStorage : undefined,
            }
        }
    );

    if (typeof window !== "undefined") {
        supabaseInstance = client;
    }

    return client;
}
