"use client";

import { useWallet } from './WalletProvider';
import { useState } from 'react';

export default function WalletButton() {
    const { publicKey, connected, connecting, connect, disconnect } = useWallet();
    const [showMenu, setShowMenu] = useState(false);

    const handleClick = async () => {
        if (connected) {
            setShowMenu(!showMenu);
        } else {
            try {
                await connect();
            } catch (error) {
                alert('Failed to connect wallet. Please install Phantom wallet.');
            }
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={connecting}
                className="btn-primary py-2 px-4 text-sm whitespace-nowrap flex items-center gap-2"
            >
                {connecting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connecting...
                    </>
                ) : connected && publicKey ? (
                    <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {formatAddress(publicKey.toString())}
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Connect Wallet
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && connected && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
                        <div className="font-mono text-sm text-white break-all">
                            {publicKey?.toString()}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            disconnect();
                            setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}

            {/* Click outside to close */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
}
