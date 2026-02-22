import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocArticle({ params }: { params: { slug: string } }) {
    const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#0d0d0d] border-t border-white/5">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">

                {/* Sidebar Nav (Mock) */}
                <div className="hidden md:block w-64 shrink-0 sticky top-32">
                    <div className="font-mono text-xs uppercase text-white/40 tracking-widest mb-4 pb-2 border-b border-white/10">In this category</div>
                    <ul className="space-y-3 font-mono text-sm">
                        <li><span className="text-phoenix border-l-2 border-phoenix pl-3">Introduction to {title}</span></li>
                        <li><span className="text-white/50 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Core Concepts</span></li>
                        <li><span className="text-white/50 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Advanced Tactics</span></li>
                        <li><span className="text-white/50 hover:text-white transition-colors pl-3 border-l-2 border-transparent">References & Tools</span></li>
                    </ul>
                </div>

                {/* Article Content */}
                <div className="flex-1 bg-charcoal p-8 md:p-12 border border-white/10 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/5 via-phoenix/50 to-white/5" />

                    <Link href="/docs" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-xs uppercase mb-8">
                        <ArrowLeft size={14} /> Back to Knowledge Base
                    </Link>

                    <h1 className="font-display font-medium text-4xl text-white mb-4">{title}</h1>
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 mb-10 pb-6 border-b border-white/5">
                        <span>Last updated: 2 days ago</span>
                        <span>Version: 1.0.4</span>
                        <span className="px-2 py-0.5 bg-phoenix/10 text-phoenix border border-phoenix/20">Public</span>
                    </div>

                    <div className="prose prose-invert max-w-none font-sans font-light prose-h2:font-display prose-h2:text-2xl prose-h2:font-medium prose-h2:mt-10 prose-h2:mb-4 prose-p:text-white/70 prose-p:leading-relaxed prose-a:text-phoenix prose-code:text-phoenix prose-code:bg-phoenix/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10">
                        <p>Welcome to the {title} documentation. This section covers the fundamental concepts required to master this domain and prepare you for real-world scenarios in the Phoenix Cyber Lab and active bug bounty targets.</p>

                        <h2>Overview</h2>
                        <p>Cybersecurity is an ever-evolving field. Understanding the underlying mechanisms is critical to identifying vulnerabilities and securing infrastructure. Whether you are attacking or defending, knowledge is your sharpest weapon.</p>

                        <h2>Quick Start</h2>
                        <p>To begin safely practicing techniques mentioned here, spin up a vulnerable environment in our Cyber Lab:</p>
                        <pre><code>$ ssh student@lab.webphoenix.org -p 2222{'\n'}$ ./start_scenario --type={params.slug}</code></pre>

                        <blockquote>
                            &quot;Given the choice between dancing pigs and security, users will pick dancing pigs every time.&quot; - Bruce Schneier
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
