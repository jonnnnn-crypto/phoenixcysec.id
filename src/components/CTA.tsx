import Link from "next/link";

export default function CTA() {
    return (
        <section className="py-32 px-6 md:px-12 bg-charcoal-dark border-t border-b border-white/5 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-phoenix/5 blur-[150px] z-0" />

            <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 tracking-tight">
                    Cybersecurity Starts With <span className="text-phoenix italic">Curiosity</span>.
                </h2>
                <p className="text-lg text-white/60 mb-12 max-w-2xl font-light">
                    Ready to begin your cybersecurity journey? Join PhoenixCySec to secure the digital landscape and build your legacy.
                </p>

                <Link
                    href="/join"
                    className="px-10 py-5 bg-white text-charcoal font-mono uppercase tracking-widest text-sm font-bold hover:bg-phoenix hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]"
                >
                    Become a Member
                </Link>
            </div>
        </section>
    );
}
