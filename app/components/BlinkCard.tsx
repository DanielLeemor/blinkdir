"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Blink } from '@/lib/types';
import { useState } from 'react';

interface BlinkCardProps {
    blink: Blink;
    priority?: boolean;
}

export default function BlinkCard({ blink, priority = false }: BlinkCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/blink/${blink.id}`} className="block h-full">
            <div className="card h-full flex flex-col overflow-hidden hover:scale-[1.02] transition-transform duration-300 border border-white/5 hover:border-white/10 group">
                {/* Image Section */}
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                    {blink.screenshot_url && !imageError ? (
                        <Image
                            src={blink.screenshot_url}
                            alt={blink.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={priority}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white/20">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" className="hidden" />
                            </svg>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {blink.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm z-10">
                            Featured
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow relative">
                    {/* Category Tag */}
                    <div className="mb-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/5 capitalize">
                            {blink.category}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#14F195] transition-colors line-clamp-1">
                        {blink.name}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {blink.description || "No description provided."}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                            {blink.source === 'dial.to' ? 'Dial.to' : 'Submitted'}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1" title="Views">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {blink.views.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
