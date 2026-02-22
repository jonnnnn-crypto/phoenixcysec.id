"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Terminal } from "lucide-react";

export default function JoinPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            else router.push("/dashboard");
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });
            if (error) setError(error.message);
            else {
                // Here we could auto create a user record or rely on a Supabase trigger.
                // The user's schema provided doesn't show an auth trigger, so we might need to insert manually or assume they make one.
                if (data.user) {
                    const { error: dbError } = await supabase.from('users').insert([
                        { id: data.user.id, email, username }
                    ]);
                    if (dbError) setError(dbError.message);
                    else {
                        await supabase.from('profiles').insert([{ user_id: data.user.id }]);
                        router.push("/dashboard");
                    }
                }
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center relative overflow-hidden bg-charcoal-dark">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-phoenix/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="p-8 border border-white/10 bg-[#111] shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-phoenix-dark via-phoenix to-phoenix-light" />

                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <Terminal className="text-phoenix" size={28} />
                        <h1 className="font-display font-bold text-2xl text-white">System Access</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-white/50 text-xs font-mono uppercase mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix transition-colors font-mono text-sm"
                                    required={!isLogin}
                                    placeholder="hunter_1337"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix transition-colors font-mono text-sm"
                                required
                                placeholder="system@phoenixcysec.org"
                            />
                        </div>
                        <div>
                            <label className="block text-white/50 text-xs font-mono uppercase mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-charcoal border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-phoenix transition-colors font-mono text-sm"
                                required
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-phoenix text-white font-mono uppercase tracking-widest text-sm font-bold hover:bg-phoenix-light transition-all shadow-[0_0_15px_rgba(230,57,70,0.3)] hover:shadow-[0_0_25px_rgba(230,57,70,0.6)] disabled:opacity-50 mt-4 group"
                        >
                            <span className="inline-block transform group-hover:scale-105 transition-transform">
                                {loading ? "Authenticating..." : (isLogin ? "Initialize Session" : "Create Identity")}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-white/40 hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
                        >
                            {isLogin ? "Request Access (Register)" : "Acknowledge Identity (Login)"}
                        </button>
                    </div>
                </div>

                {/* Terminal decorative text */}
                <div className="mt-6 text-center font-mono text-[10px] text-white/20 uppercase tracking-[0.2em] select-none">
                    Secured by Phoenix Protocol v2.5.4
                </div>
            </div>
        </div>
    );
}
