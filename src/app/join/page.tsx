"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function JoinPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (isLogin) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
            } else {
                setMessage('Login successful! Redirecting...');
                window.location.href = '/dashboard';
            }
        } else {
            // Need a username for signup in our system
            if (!username) {
                setError('Username is required for new accounts.');
                setLoading(false);
                return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username, // Save username in auth metadata
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                setMessage('Registration successful! Please check your email to verify your account.');
                // Assuming we have a trigger to create the user profile or we will create it manually here
                if (data.user) {
                    await supabase.from('users').insert({
                        id: data.user.id,
                        email: data.user.email,
                        username: username,
                        role: 'member'
                    });
                    await supabase.from('profiles').insert({
                        user_id: data.user.id
                    });
                }
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-charcoal-dark border-t-2 border-phoenix flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-phoenix/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl relative z-10">
                <div className="mb-10 text-center">
                    <h1 className="font-display font-bold text-3xl text-white mb-2 uppercase tracking-wide">
                        {isLogin ? 'Establish Connection' : 'Register Identity'}
                    </h1>
                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                        Phoenix Command Center
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block font-mono text-xs text-white/50 mb-2 uppercase">Handle (Username)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-[#151515] border border-white/10 focus:border-phoenix text-white px-4 py-3 pl-10 outline-none transition-colors font-mono text-sm"
                                    placeholder="byte_ninja"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block font-mono text-xs text-white/50 mb-2 uppercase">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-[#151515] border border-white/10 focus:border-phoenix text-white px-4 py-3 pl-10 outline-none transition-colors font-mono text-sm"
                                placeholder="operator@webphoenix.org"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-mono text-xs text-white/50 mb-2 uppercase">Access Key (Password)</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-[#151515] border border-white/10 focus:border-phoenix text-white px-4 py-3 pl-10 outline-none transition-colors font-mono text-sm"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono uppercase">
                            Warning: {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-mono uppercase">
                            System: {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-phoenix hover:bg-phoenix-light text-white font-mono uppercase text-sm font-bold py-4 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {isLogin ? 'Initiate Link' : 'Create Profile'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
                        className="font-mono text-xs text-white/40 hover:text-phoenix transition-colors uppercase tracking-widest"
                    >
                        {isLogin ? 'Need an identity? Register here.' : 'Already registered? Authenticate here.'}
                    </button>
                </div>
            </div>
        </div>
    );
}
