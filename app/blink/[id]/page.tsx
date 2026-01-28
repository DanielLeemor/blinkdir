
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

// Fetch data on the server
async function getBlink(id: string) {
    const { data: blink, error } = await supabase
        .from('blinks')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !blink) {
        return null;
    }
    return blink;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const blink = await getBlink(id);

    if (!blink) return { title: 'Blink Not Found' };

    return {
        title: `${blink.name} | BlinkDir`,
        description: blink.description,
        openGraph: {
            title: blink.name,
            description: blink.description || '',
            images: blink.screenshot_url ? [blink.screenshot_url] : []
        }
    };
}

export default async function BlinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const blink = await getBlink(id);

    if (!blink) {
        notFound();
    }

    // Fallback image logic
    const imageSrc = blink.screenshot_url || blink.icon_url || '/placeholder.png';

    return (
        <>
            <Header />

            <main className="min-h-screen pt-32 pb-20">
                <div className="container relative">

                    {/* Back Button */}
                    <Link href="/" className="absolute -top-12 left-6 md:left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        ← Back to Directory
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                        {/* Left: Visuals */}
                        <div className="space-y-6">
                            {/* Main Preview */}
                            <div className="aspect-video bg-[#1a1a25] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageSrc}
                                    alt={blink.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay for quick action? Maybe later */}
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-white">{blink.views}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Views</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-purple-400">{blink.clicks}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Clicks</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center flex flex-col items-center justify-center">
                                    <div className={`text-lg font-bold ${blink.status === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {blink.status === 'approved' ? 'Verified' : 'Pending'}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div>
                            <div className="flex items-start gap-4 mb-6">
                                {blink.icon_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={blink.icon_url} className="w-16 h-16 rounded-xl bg-white/5 shadow-lg border border-white/10" alt="" />
                                )}
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">{blink.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                                            {blink.category}
                                        </span>
                                        {blink.creator_twitter && (
                                            <a
                                                href={`https://twitter.com/${blink.creator_twitter.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 rounded-full bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] text-sm hover:bg-[#1DA1F2]/20 transition-colors"
                                            >
                                                {blink.creator_twitter}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-300 mb-10">
                                <p className="text-lg leading-relaxed">{blink.description}</p>
                            </div>

                            <div className="space-y-4 border-t border-white/10 pt-8">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Blink Action</h3>

                                <div className="p-4 bg-black/30 rounded-lg border border-white/5 font-mono text-sm text-gray-400 break-all select-all cursor-text">
                                    {blink.url}
                                </div>

                                <a
                                    href={blink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary w-full h-14 text-lg justify-center shadow-lg shadow-purple-500/20"
                                >
                                    Try This Blink ↗
                                </a>
                                <p className="text-center text-xs text-gray-500">
                                    Opens in a new tab. Ensure you have a Solana wallet installed.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
