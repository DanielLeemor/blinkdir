"use client";

import { useWallet } from './WalletProvider';
import { useState } from 'react';

export default function WalletButton() {
    const { publicKey, connected, connecting, walletType, connect, disconnect } = useWallet();
    const [showMenu, setShowMenu] = useState(false);
    const [showWalletPicker, setShowWalletPicker] = useState(false);

    const handleConnect = async (type?: 'phantom' | 'solflare' | 'backpack') => {
        try {
            await connect(type);
            setShowWalletPicker(false);
        } catch (error) {
            console.error('Connection failed:', error);
            alert(error instanceof Error ? error.message : 'Failed to connect wallet');
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const getWalletIcon = () => {
        switch (walletType) {
            case 'phantom':
                return '👻';
            case 'solflare':
                return '🔥';
            case 'backpack':
                return '🎒';
            default:
                return '⚡';
        }
    };

    const getWalletName = () => {
        switch (walletType) {
            case 'phantom':
                return 'Phantom';
            case 'solflare':
                return 'Solflare';
            case 'backpack':
                return 'Backpack';
            default:
                return 'Wallet';
        }
    };

    return (
        <div className="relative">
            {!connected ? (
                <button
                    onClick={() => setShowWalletPicker(true)}
                    disabled={connecting}
                    className="btn-primary py-2 px-4 text-sm whitespace-nowrap flex items-center gap-2"
                >
                    {connecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Connecting...
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
            ) : (
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="btn-primary py-2 px-4 text-sm whitespace-nowrap flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{getWalletIcon()}</span>
                    {formatAddress(publicKey!.toString())}
                </button>
            )}

            {/* Wallet Picker Modal */}
            {showWalletPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        onClick={() => setShowWalletPicker(false)} 
                    />
                    <div className="relative bg-[#1a1a25] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Select Wallet</h3>
                            <button
                                onClick={() => setShowWalletPicker(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {/* Phantom */}
                            <button
                                onClick={() => handleConnect('phantom')}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all group"
                            >
                                <span className="text-4xl">👻</span>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">Phantom</div>
                                    <div className="text-xs text-gray-400">Most popular Solana wallet</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Solflare */}
                            <button
                                onClick={() => handleConnect('solflare')}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-xl transition-all group"
                            >
                                <span className="text-4xl">🔥</span>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">Solflare</div>
                                    <div className="text-xs text-gray-400">Secure Solana wallet</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Backpack */}
                            <button
                                onClick={() => handleConnect('backpack')}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all group"
                            >
                                <span className="text-4xl">🎒</span>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">Backpack</div>
                                    <div className="text-xs text-gray-400">Modern crypto wallet</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-500">
                            Don't have a wallet? Click any option to install.
                        </div>
                    </div>
                </div>
            )}

            {/* Connected Menu */}
            {showMenu && connected && (
                <>
                    <div className="absolute right-0 mt-2 w-72 bg-[#1a1a25] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getWalletIcon()}</span>
                                <div className="text-xs text-gray-500">Connected with {getWalletName()}</div>
                            </div>
                            <div className="font-mono text-sm text-white break-all bg-black/20 p-2 rounded">
                                {publicKey?.toString()}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                disconnect();
                                setShowMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Disconnect Wallet
                        </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                </>
            )}
        </div>
    );
}
