import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
    return createSupabaseClient(
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
    )
}
