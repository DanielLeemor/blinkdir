"use client";

import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton with SSR disabled
// This prevents hydration errors since wallet detection requires browser APIs
const WalletMultiButtonDynamic = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function WalletButton() {
    return (
        <div className="nav-wallet-btn">
            <WalletMultiButtonDynamic style={{
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                height: '40px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                padding: '0 20px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }} />
        </div>
    );
}
