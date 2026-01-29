"use client";

import { useState, useEffect } from "react";
import type { Blink } from "@/lib/types";
import BlinkActionPreview from "./BlinkActionPreview";

interface Props {
    blink: Blink;
}

// Simple image component with fallbacks and hydration fix
function BlinkPreviewImage({ src, iconUrl, alt }: { src?: string; iconUrl?: string; alt: string }) {
    const [screenshotError, setScreenshotError] = useState(false);
    const [iconError, setIconError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by only rendering the dynamic part after mount
    if (!mounted) {
        return <div className="w-full h-full bg-[#1a1a25]" />;
    }

    // Show screenshot if available and not errored
    if (src && !screenshotError) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setScreenshotError(true)}
            />
        );
    }

    // Show icon if available
    if (iconUrl && !iconError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 via-black to-green-900/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={iconUrl}
                    alt={alt}
                    className="w-40 h-40 object-contain drop-shadow-2xl"
                    onError={() => setIconError(true)}
                />
            </div>
        );
    }

    // Fallback placeholder
    const initial = alt?.charAt(0)?.toUpperCase() || '?';
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-green-900/20">
            <div className="flex flex-col items-center gap-4 text-white/40">
                <div className="w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center text-5xl font-bold border border-white/10">
                    {initial}
                </div>
                <span className="text-sm text-gray-500">No Preview Available</span>
            </div>
        </div>
    );
}

export default function BlinkDetailContent({ blink }: Props) {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section - Full Width */}
            <div className="mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                    {blink.icon_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={blink.icon_url}
                            alt=""
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-white/5 border border-white/10 shadow-xl"
                        />
                    )}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                                {blink.name}
                            </h1>
                            {blink.featured && (
                                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                                    Featured
                                </span>
                            )}
                            {blink.verified && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/10 capitalize">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {blink.category}
                            </span>
                            {blink.creator_name && (
                                <span className="text-sm text-gray-400">
                                    by <span className="text-white font-medium">{blink.creator_name}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {blink.description && (
                    <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-4xl">
                        {blink.description}
                    </p>
                )}
            </div>

            {/* Main Content - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Left Column - Preview & Stats */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Preview Image */}
                    <div className="aspect-video bg-[#1a1a25] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <BlinkPreviewImage
                            src={blink.screenshot_url || undefined}
                            iconUrl={blink.icon_url || undefined}
                            alt={blink.name}
                        />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-4 rounded-xl text-center hover:border-white/20 transition-colors">
                            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                                {blink.views.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Views</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-center hover:border-purple-500/30 transition-colors">
                            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
                                {blink.clicks.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Clicks</div>
                        </div>
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-4 rounded-xl text-center hover:border-white/20 transition-colors">
                            <div className="text-lg md:text-xl font-bold text-green-400 mb-1">
                                {blink.clicks > 0 ? ((blink.clicks / blink.views) * 100).toFixed(1) : '0'}%
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">CTR</div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400">Source</span>
                                <span className="text-white font-medium capitalize">{blink.source}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 font-medium">Active</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400">URL</span>
                                <a 
                                    href={blink.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 font-mono text-xs truncate max-w-[150px] transition-colors"
                                >
                                    {new URL(blink.url).hostname}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tags if available */}
                    {blink.tags && blink.tags.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {blink.tags.map((tag, idx) => (
                                    <span 
                                        key={idx}
                                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs rounded-full transition-colors cursor-default"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Action Preview */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Blink Action
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        </div>

                        {/* This is the real action preview that fetches and shows buttons */}
                        <BlinkActionPreview url={blink.url} />

                        {/* Action URL Info */}
                        <div className="mt-6 p-4 bg-black/20 border border-white/5 rounded-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Action Endpoint</p>
                                    <p className="text-xs text-gray-400 font-mono break-all">{blink.url}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
