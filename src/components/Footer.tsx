import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-charcoal-dark py-12 px-6 md:px-12 mt-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link href="/" className="font-display font-bold text-2xl tracking-tighter text-white">
                        Phoenix<span className="text-phoenix">CySec</span>
                    </Link>
                    <p className="text-white/50 text-sm font-mono">Learn. Secure. Rise.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 font-mono text-sm uppercase text-white/70">
                    <a href="https://webphoenix.vercel.app" target="_blank" className="text-phoenix hover:text-phoenix-light transition-colors">PHX CTF</a>
                    <a href="#" className="hover:text-phoenix transition-colors">Email</a>
                    <a href="https://discord.gg/HAWPsfJyKe" target="_blank" className="hover:text-phoenix transition-colors">Discord</a>
                    <a href="#" className="hover:text-phoenix transition-colors">GitHub</a>
                    <a href="https://www.instagram.com/phoenixcysec_/" target="_blank" className="hover:text-phoenix transition-colors">Instagram</a>
                </div>
            </div>
        </footer>
    );
}
