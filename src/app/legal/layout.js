import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function LegalLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-[#C1440E]/30">
            <Header theme="dark" />

            <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto pb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* SIDEBAR NAVIGATION */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-32 space-y-8">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-[#C1440E] mb-4 border-b border-[#C1440E]/20 pb-2">
                                    Legal Protocols
                                </h3>
                                <nav className="flex flex-col gap-2">
                                    <Link href="/legal/privacy" className="text-xs text-white/60 hover:text-white hover:pl-2 transition-all block py-1">
                                        Privacy Policy
                                    </Link>
                                    <Link href="/legal/terms" className="text-xs text-white/60 hover:text-white hover:pl-2 transition-all block py-1">
                                        Terms & Operations
                                    </Link>
                                    <Link href="/legal/refund" className="text-xs text-white/60 hover:text-white hover:pl-2 transition-all block py-1">
                                        Refund & Access
                                    </Link>
                                    <Link href="/legal/shipping" className="text-xs text-white/60 hover:text-white hover:pl-2 transition-all block py-1">
                                        Shipping Manifest
                                    </Link>
                                </nav>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 leading-relaxed">
                                <strong className="text-white block mb-2">COLONY JURISDICTION</strong>
                                All legal matters are subject to the 2042 Ares Accord and the Inter-Planetary Commerce Guild (IPCG).
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 min-h-[50vh]">
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-white prose-p:text-white/70 prose-a:text-[#C1440E] prose-li:text-white/70">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
