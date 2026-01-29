"use client";

import { useState } from 'react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

interface TransactionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    actionTitle: string;
    actionDescription: string;
    actionIcon?: string;
    transaction?: Transaction | VersionedTransaction | null;
    loading?: boolean;
}

export default function TransactionPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    actionTitle,
    actionDescription,
    actionIcon,
    transaction,
    loading = false,
}: TransactionPreviewModalProps) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setConfirming(true);
        setError(null);
        try {
            await onConfirm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transaction failed');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a25] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#1a1a25] border-b border-white/10 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {actionIcon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={actionIcon} alt="" className="w-10 h-10 rounded-lg" />
                        )}
                        <h2 className="text-xl font-bold text-white">Confirm Transaction</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={confirming}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Action Info */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">{actionTitle}</h3>
                        <p className="text-gray-300 leading-relaxed">{actionDescription}</p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-black/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-gray-400">Transaction Ready</span>
                        </div>

                        {transaction && (
                            <div className="text-xs font-mono text-gray-500 break-all">
                                {transaction instanceof Transaction 
                                    ? `Instructions: ${transaction.instructions.length}`
                                    : 'Versioned Transaction'}
                            </div>
                        )}

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Network</span>
                                <span className="text-white font-medium">Solana Mainnet</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Est. Fee</span>
                                <span className="text-white font-medium">~0.000005 SOL</span>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="text-sm text-yellow-200">
                                <p className="font-semibold mb-1">Review Carefully</p>
                                <p className="text-yellow-300/80">
                                    Make sure you trust this action. Transactions on Solana are irreversible.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-red-200">
                                    <p className="font-semibold mb-1">Transaction Failed</p>
                                    <p className="text-red-300/80">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-[#1a1a25] border-t border-white/10 p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={confirming}
                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirming || loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:brightness-110 disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {confirming ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                Signing...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve & Sign
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
