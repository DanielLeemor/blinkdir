"use client";

interface TransactionSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    signature: string;
    actionTitle: string;
}

export default function TransactionSuccessModal({
    isOpen,
    onClose,
    signature,
    actionTitle,
}: TransactionSuccessModalProps) {
    if (!isOpen) return null;

    const explorerUrl = `https://solscan.io/tx/${signature}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a25] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full">
                {/* Success Animation */}
                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Transaction Successful!</h2>
                    <p className="text-gray-400 mb-6">{actionTitle} completed</p>

                    {/* Transaction Details */}
                    <div className="bg-black/20 rounded-xl p-4 mb-6 text-left space-y-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Transaction Signature</div>
                            <div className="font-mono text-xs text-white break-all bg-black/30 p-2 rounded">
                                {signature}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:brightness-110 text-black font-bold rounded-xl transition-all"
                        >
                            View on Solscan ↗
                        </a>
                        <button
                            onClick={onClose}
                            className="block w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
