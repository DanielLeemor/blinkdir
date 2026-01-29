"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "./WalletProvider";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import TransactionPreviewModal from "./TransactionPreviewModal";
import TransactionSuccessModal from "./TransactionSuccessModal";

interface ActionLink {
    label: string;
    href: string;
    parameters?: Array<{
        name: string;
        label?: string;
        required?: boolean;
        type?: string;
    }>;
}

interface ActionResponse {
    icon: string;
    title: string;
    description: string;
    label?: string;
    disabled?: boolean;
    error?: { message: string };
    links?: {
        actions: ActionLink[];
    };
}

interface ActionRule {
    pathPattern: string;
    apiPath: string;
}

interface ActionsJson {
    rules: ActionRule[];
    icon?: string;
    title?: string;
    description?: string;
    name?: string;
    links?: { actions: ActionLink[] };
}

interface BlinkActionPreviewProps {
    url: string;
}

/**
 * Matches a URL path against a pattern (e.g., /swap/**)
 */
function matchPath(urlPath: string, pattern: string): boolean {
    // Simple implementation of path matching
    // Handles /path/** and /path/* patterns
    const normalizedPattern = pattern.replace(/\/+$/, '');
    const normalizedPath = urlPath.replace(/\/+$/, '');

    if (normalizedPattern.endsWith('/**')) {
        const prefix = normalizedPattern.slice(0, -3);
        return normalizedPath.startsWith(prefix) || normalizedPath === prefix;
    }

    if (normalizedPattern.endsWith('/*')) {
        const prefix = normalizedPattern.slice(0, -2);
        if (!normalizedPath.startsWith(prefix)) return false;
        const remainder = normalizedPath.slice(prefix.length);
        return remainder.length > 0 && !remainder.includes('/', 1);
    }

    return normalizedPath === normalizedPattern;
}

/**
 * Resolves the API path based on actions.json rules
 */
function resolveApiPath(url: string, actionsJson: ActionsJson): string | null {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const rules = actionsJson.rules || [];

    // 1. Try exact/wildcard match first
    for (const rule of rules) {
        if (matchPath(path, rule.pathPattern)) {
            if (rule.pathPattern.endsWith('/**')) {
                const prefix = rule.pathPattern.slice(0, -3);
                const suffix = path.slice(prefix.length);
                return rule.apiPath.replace('/**', suffix);
            }
            return rule.apiPath;
        }
    }

    // 2. If no match but we are at root, try to find a reasonable fallback
    if (path === '/' || path === '') {
        // Many sites only have one action rule (like /api/actions/audit)
        // If there's only one rule, use it.
        if (rules.length === 1) {
            return rules[0].apiPath;
        }

        // If multiple, look for common patterns
        const priorityPatterns = ['/swap', '/audit', '/mint', '/stake', '/trade'];
        for (const pattern of priorityPatterns) {
            const rule = rules.find(r => r.pathPattern.toLowerCase().includes(pattern) || r.apiPath.toLowerCase().includes(pattern));
            if (rule) return rule.apiPath;
        }

        // Final fallback: use the first rule if it's not a generic wildcard that failed match
        if (rules.length > 0) {
            return rules[0].apiPath;
        }
    }

    return null;
}

export default function BlinkActionPreview({ url }: BlinkActionPreviewProps) {
    const { publicKey, connected, connect } = useWallet();
    const [actionData, setActionData] = useState<ActionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

    // Transaction modal states
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState<Transaction | VersionedTransaction | null>(null);
    const [currentAction, setCurrentAction] = useState<ActionLink | null>(null);
    const [txSignature, setTxSignature] = useState<string>('');
    
    // Prevent duplicate fetches
    const fetchingRef = useRef(false);
    const fetchedUrlRef = useRef<string | null>(null);

    useEffect(() => {
        // Skip if already fetching or already fetched this URL
        if (fetchingRef.current || fetchedUrlRef.current === url) {
            return;
        }

        const fetchActionData = async () => {
            fetchingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const origin = new URL(url).origin;
                const actionsJsonUrl = `${origin}/actions.json`;

                // 1. Fetch actions.json
                const actionsRes = await fetch(`/api/proxy?url=${encodeURIComponent(actionsJsonUrl)}`);
                if (!actionsRes.ok) {
                    throw new Error('Failed to load actions.json');
                }

                const actionsJson: ActionsJson = await actionsRes.json();

                // 2. Resolve API path from rules
                const apiPath = resolveApiPath(url, actionsJson);

                if (apiPath) {
                    // 3. Fetch actual Action metadata
                    // Ensure apiPath is absolute
                    const absoluteApiPath = apiPath.startsWith('http')
                        ? apiPath
                        : `${origin}${apiPath.startsWith('/') ? '' : '/'}${apiPath}`;

                    const actionRes = await fetch(`/api/proxy?url=${encodeURIComponent(absoluteApiPath)}`);
                    if (actionRes.ok) {
                        const data = await actionRes.json();
                        setActionData(data);
                        fetchedUrlRef.current = url; // Mark as fetched
                    } else {
                        throw new Error('Failed to load specific action metadata');
                    }
                } else if (actionsJson.links?.actions) {
                    // Fallback to top-level metadata if no rule matched
                    setActionData({
                        icon: actionsJson.icon || '',
                        title: actionsJson.title || actionsJson.name || new URL(url).hostname,
                        description: actionsJson.description || '',
                        links: actionsJson.links
                    });
                    fetchedUrlRef.current = url; // Mark as fetched
                } else {
                    throw new Error('No matching action found for this URL');
                }
            } catch (err) {
                console.error('Failed to fetch action:', err);
                setError('Could not resolve Action metadata');
            } finally {
                setLoading(false);
                fetchingRef.current = false;
            }
        };

        fetchActionData();
    }, [url]);

    const handleActionClick = async (action: ActionLink) => {
        // Check wallet connection first
        if (!connected || !publicKey) {
            try {
                await connect();
            } catch (error) {
                alert('Please connect your wallet to use this action.');
                return;
            }
        }

        try {
            // Build the action URL with parameters
            let actionUrl = action.href;

            // Replace parameters in URL
            if (action.parameters && action.parameters.length > 0) {
                action.parameters.forEach(param => {
                    const value = inputValues[param.name] || '';
                    actionUrl = actionUrl.replace(`{${param.name}}`, encodeURIComponent(value));
                });
            }

            // Make actionUrl absolute if it's relative
            const absoluteActionUrl = actionUrl.startsWith('http')
                ? actionUrl
                : new URL(actionUrl, new URL(url).origin).toString();

            // POST to the action endpoint to get transaction
            const response = await fetch(`/api/proxy?url=${encodeURIComponent(absoluteActionUrl)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account: publicKey?.toString() || ""
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            const result = await response.json();

            // Parse the transaction from the result
            // The Solana Actions spec returns transaction as base64 encoded string
            if (result.transaction) {
                const transactionBuffer = Buffer.from(result.transaction, 'base64');
                const transaction = VersionedTransaction.deserialize(transactionBuffer);

                setPendingTransaction(transaction);
                setCurrentAction(action);
                setShowPreviewModal(true);
            } else {
                throw new Error('No transaction returned from action');
            }

        } catch (error) {
            console.error('Action execution error:', error);
            alert(`Failed to prepare transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleConfirmTransaction = async () => {
        if (!pendingTransaction || !publicKey) {
            throw new Error('No transaction to confirm');
        }

        try {
            const { solana } = window as any;
            if (!solana) {
                throw new Error('Wallet not found');
            }

            // Sign and send transaction
            const signedTransaction = await solana.signTransaction(pendingTransaction);

            // Send via our API to track it
            const response = await fetch('/api/blinks/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transaction: Buffer.from(signedTransaction.serialize()).toString('base64'),
                    blinkUrl: url
                })
            });

            const result = await response.json();

            if (result.signature) {
                setTxSignature(result.signature);
                setShowPreviewModal(false);
                setShowSuccessModal(true);

                // Track the click
                await fetch(`/api/blinks/${url}/track`, { method: 'POST' });
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('Transaction signing error:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="bg-black/20 rounded-2xl border border-white/10 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/5 rounded-xl"></div>
                        <div className="h-6 bg-white/5 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-white/5 rounded w-full"></div>
                    <div className="h-4 bg-white/5 rounded w-2/3"></div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                        <div className="h-12 bg-white/5 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !actionData) {
        return (
            <div className="bg-black/20 rounded-2xl border border-white/10 p-6 text-center">
                <p className="text-gray-500 text-sm mb-4">{error || 'Action data unavailable'}</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                >
                    Visit Website ↗
                </a>
            </div>
        );
    }

    const actions = actionData.links?.actions || [];

    return (
        <>
            <div className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Action Header */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        {actionData.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={actionData.icon}
                                alt=""
                                className="w-16 h-16 rounded-xl object-contain bg-white/5 p-2"
                            />
                        )}
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            {actionData.title}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            {actionData.description}
                        </p>
                    </div>

                    {/* Wallet Connection Warning */}
                    {!connected && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-purple-200">
                                    <p className="font-semibold mb-1">Wallet Required</p>
                                    <p className="text-purple-300/80">
                                        Connect your Solana wallet to use this action
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interaction Section */}
                    <div className="pt-4 space-y-5">
                        {actions.map((action, idx) => (
                            <div key={idx} className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                {action.parameters?.map((param) => (
                                    <div key={param.name} className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-400 ml-1">
                                            {param.label || param.name}
                                            {param.required && <span className="text-red-400 ml-1">*</span>}
                                        </label>
                                        <input
                                            type={param.type || "text"}
                                            placeholder={param.label || param.name}
                                            value={inputValues[param.name] || ''}
                                            onChange={(e) => setInputValues(prev => ({
                                                ...prev,
                                                [param.name]: e.target.value
                                            }))}
                                            className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#14F195] transition-all text-lg"
                                        />
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleActionClick(action)}
                                    disabled={actionData.disabled}
                                    className="w-full group relative px-6 py-5 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:brightness-110 disabled:opacity-50 text-black font-extrabold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.97] shadow-[0_0_20px_rgba(20,241,149,0.2)]"
                                >
                                    <span className="text-lg">{action.label}</span>
                                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {!actions.length && actionData.label && (
                            <button
                                onClick={() => window.open(url, '_blank')}
                                className="w-full px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-lg hover:brightness-110 transition-all active:scale-[0.97]"
                            >
                                {actionData.label}
                            </button>
                        )}
                    </div>
                </div>

                {/* Verification Footer */}
                <div className="bg-black/40 px-6 py-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-help" title="This is a standard Solana Action">
                        <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Verified Action</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600 uppercase font-medium">Status:</span>
                        <span className="text-[10px] font-mono text-gray-400">Ready</span>
                    </div>
                </div>
            </div>

            {/* Transaction Preview Modal */}
            <TransactionPreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                onConfirm={handleConfirmTransaction}
                actionTitle={currentAction?.label || actionData.title}
                actionDescription={actionData.description}
                actionIcon={actionData.icon}
                transaction={pendingTransaction}
            />

            {/* Transaction Success Modal */}
            <TransactionSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                signature={txSignature}
                actionTitle={currentAction?.label || actionData.title}
            />
        </>
    );
}
