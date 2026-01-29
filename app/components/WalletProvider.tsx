"use client";

import React, { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";
import { useCallback } from "react";

// Default styles for wallet adapter UI
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Empty array = rely on Wallet Standard auto-detection
    // This ensures only actually installed wallets are shown
    const wallets = useMemo(() => [], []);

    const onError = useCallback((error: WalletError) => {
        // Suppress "User rejected" errors as they are expected user behavior
        if (error.name === "WalletConnectionError" && error.message === "User rejected the request.") {
            return;
        }
        console.error(error);
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect={true} onError={onError}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}

// Re-export the useWallet hook from the official adapter
export { useWallet } from "@solana/wallet-adapter-react";
