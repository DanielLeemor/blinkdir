"use client";

import { useState, useEffect } from "react";

interface BlinkImageProps {
    src: string;
    alt: string;
    iconUrl?: string;
}

export default function BlinkImage({ src, alt, iconUrl }: BlinkImageProps) {
    const [mounted, setMounted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [iconError, setIconError] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if screenshot URL is ScreenshotOne API (these are broken)
    const isScreenshotApi = src?.includes('screenshotone.com');

    // Try to show icon if screenshot is API or failed
    const useIcon = iconUrl && (isScreenshotApi || !src || imageError);

    // Always render the same wrapper to avoid hydration issues
    // Use suppressHydrationWarning for dynamic content
    return (
        <div className="w-full h-full" suppressHydrationWarning>
            {!mounted ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-green-900/20 animate-pulse">
                    <div className="w-24 h-24 rounded-2xl bg-white/5"></div>
                </div>
            ) : useIcon && !iconError ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 via-black to-green-900/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={iconUrl}
                        alt={alt}
                        className="w-32 h-32 object-contain"
                        onError={() => setIconError(true)}
                    />
                </div>
            ) : src && !isScreenshotApi && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-green-900/20">
                    <div className="flex flex-col items-center gap-3 text-white/40">
                        <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center text-4xl font-bold border border-white/10">
                            {alt?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm">No Preview</span>
                    </div>
                </div>
            )}
        </div>
    );
}
