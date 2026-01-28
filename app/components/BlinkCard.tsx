
import Link from 'next/link';
import { Blink } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BlinkCardProps {
    blink: Blink;
    priority?: boolean;
}

export default function BlinkCard({ blink, priority = false }: BlinkCardProps) {
    // Use screenshot if available, otherwise fallback to icon, otherwise generic placeholder
    const imageSrc = blink.screenshot_url || blink.icon_url || '/placeholder.png'; // Need a placeholder asset later

    return (
        <div className={cn(
            "card p-0 flex flex-col h-full overflow-hidden group transition-all duration-300 hover:translate-y-[-4px]",
            blink.featured ? "border-purple-500/30 shadow-[0_0_20px_rgba(153,69,255,0.1)]" : "border-white/10 hover:border-purple-500/30"
        )}>
            {/* Image Section */}
            <div className="relative aspect-video bg-gray-900 overflow-hidden">
                {blink.featured && (
                    <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Featured
                    </div>
                )}

                {/* We use standard img for MVP simplicity, migrate to next/image later for optimization */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageSrc}
                    alt={blink.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        // Fallback on error
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1a1a25/FFF?text=Blink';
                    }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a25] to-transparent opacity-60" />

                {/* Icon Overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {blink.icon_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={blink.icon_url} alt="" className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10" />
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight text-white group-hover:text-purple-400 transition-colors">
                        <Link href={`/blink/${blink.id}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            {blink.name}
                        </Link>
                    </h3>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {blink.description}
                </p>

                {/* Footer info */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border",
                            blink.category === 'nft' && "border-green-500/30 text-green-400 bg-green-500/10",
                            blink.category === 'defi' && "border-blue-500/30 text-blue-400 bg-blue-500/10",
                            blink.category === 'gaming' && "border-orange-500/30 text-orange-400 bg-orange-500/10",
                            blink.category === 'social' && "border-pink-500/30 text-pink-400 bg-pink-500/10",
                            blink.category === 'utilities' && "border-gray-500/30 text-gray-400 bg-gray-500/10",
                            blink.category === 'other' && "border-gray-500/30 text-gray-400 bg-gray-500/10",
                        )}>
                            {blink.category.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                            👁️ {blink.views > 999 ? (blink.views / 1000).toFixed(1) + 'k' : blink.views}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
