"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Learning Path", href: "/#learning" },
    { name: "Cyber Lab", href: "/lab" },
    { name: "White Hat Leaderboard", href: "/leaderboard" },
    { name: "Events", href: "/events" },
    { name: "Partnerships", href: "/#partnerships" },
    { name: "Documentation", href: "/docs" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setIsLoggedIn(true);
                // Check if user has admin role
                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (userData?.role === 'admin') {
                    setIsAdmin(true);
                }
            }
        };

        checkUser();
    }, []);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-charcoal-dark/70 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2 z-50">
                    <span className="font-display font-bold text-2xl tracking-tighter text-white">
                        Phoenix<span className="text-phoenix">CySec</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4 z-50">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="hidden md:inline-flex items-center justify-center px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono text-xs uppercase tracking-wider relative group overflow-hidden glow-hover"
                        >
                            <span className="relative z-10">Admin Panel</span>
                        </Link>
                    )}
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/join"}
                        className="hidden md:inline-flex items-center justify-center px-6 py-2 border border-phoenix text-phoenix hover:bg-phoenix hover:text-white transition-all font-mono text-sm uppercase tracking-wider relative group overflow-hidden glow-hover"
                    >
                        <span className="relative z-10">{isLoggedIn ? "Dashboard" : "Join Community"}</span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white hover:text-phoenix transition-colors"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 bg-charcoal-dark flex flex-col items-center justify-center min-h-screen"
                    >
                        <div className="flex flex-col items-center gap-6 text-center">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="font-display text-3xl md:text-5xl font-medium text-white/70 hover:text-phoenix transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            {isAdmin && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5, delay: navLinks.length * 0.05 + 0.2 }}
                                    className="mt-4"
                                >
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="font-display text-3xl md:text-5xl font-medium text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        Admin Panel
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
