"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled
const BlinkActionPreview = dynamic(
    () => import("./BlinkActionPreview"),
    {
        ssr: false,
        loading: () => (
            <div className="bg-[#12121a] rounded-xl border border-white/10 aspect-[4/3] w-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading Blink...</span>
            </div>
        )
    }
);

interface Props {
    url: string;
}

export default function BlinkActionWrapper({ url }: Props) {
    return <BlinkActionPreview url={url} />;
}
