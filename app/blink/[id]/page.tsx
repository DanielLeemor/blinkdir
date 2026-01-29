
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import BlinkDetailContent from "../../components/BlinkDetailContent";

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
            images: blink.icon_url ? [blink.icon_url] : []
        }
    };
}

export default async function BlinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const blink = await getBlink(id);

    if (!blink) {
        notFound();
    }

    return (
        <>
            <Header />

            <main className="min-h-screen pt-24 md:pt-32 pb-20 px-4">
                {/* Back Button */}
                <div className="max-w-7xl mx-auto mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
                    >
                        <svg 
                            className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Directory
                    </Link>
                </div>

                {/* Client Component handles all interactive content */}
                <BlinkDetailContent blink={blink} />

            </main>

            <Footer />
        </>
    );
}
