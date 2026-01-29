"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

type WalletType = 'phantom' | 'solflare' | 'backpack' | null;

interface WalletContextType {
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    walletType: WalletType;
    connect: (type?: WalletType) => Promise<void>;
    disconnect: () => void;
    signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
}

interface WalletProviderProps {
    children: ReactNode;
    endpoint?: string;
}

export function WalletProvider({ 
    children, 
    endpoint = 'https://api.mainnet-beta.solana.com' 
}: WalletProviderProps) {
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [walletType, setWalletType] = useState<WalletType>(null);

    // Check for auto-connect on mount (all wallets)
    useEffect(() => {
        const checkAutoConnect = async () => {
            const { solana, solflare, backpack } = window as any;

            // Try Phantom
            if (solana?.isPhantom) {
                try {
                    const response = await solana.connect({ onlyIfTrusted: true });
                    setPublicKey(new PublicKey(response.publicKey.toString()));
                    setConnected(true);
                    setWalletType('phantom');
                    return;
                } catch (e) {
                    // Silently fail, try next wallet
                }
            }

            // Try Solflare
            if (solflare?.isSolflare) {
                try {
                    await solflare.connect({ onlyIfTrusted: true });
                    if (solflare.publicKey) {
                        setPublicKey(new PublicKey(solflare.publicKey.toString()));
                        setConnected(true);
                        setWalletType('solflare');
                        return;
                    }
                } catch (e) {
                    // Silently fail, try next wallet
                }
            }

            // Try Backpack
            if (backpack?.isBackpack) {
                try {
                    const response = await backpack.connect({ onlyIfTrusted: true });
                    setPublicKey(new PublicKey(response.publicKey.toString()));
                    setConnected(true);
                    setWalletType('backpack');
                } catch (e) {
                    // Silently fail
                }
            }
        };

        checkAutoConnect();
    }, []);

    const connect = async (preferredType?: WalletType) => {
        if (connecting) return;
        
        setConnecting(true);
        try {
            const { solana, solflare, backpack } = window as any;

            // Phantom
            if (preferredType === 'phantom' || (!preferredType && solana?.isPhantom)) {
                if (!solana) {
                    window.open('https://phantom.app/', '_blank');
                    throw new Error('Phantom wallet not installed. Please install it and refresh.');
                }
                const response = await solana.connect();
                setPublicKey(new PublicKey(response.publicKey.toString()));
                setConnected(true);
                setWalletType('phantom');
                return;
            }

            // Solflare
            if (preferredType === 'solflare' || (!preferredType && solflare?.isSolflare)) {
                if (!solflare) {
                    window.open('https://solflare.com/', '_blank');
                    throw new Error('Solflare wallet not installed. Please install it and refresh.');
                }
                await solflare.connect();
                setPublicKey(new PublicKey(solflare.publicKey.toString()));
                setConnected(true);
                setWalletType('solflare');
                return;
            }

            // Backpack
            if (preferredType === 'backpack' || (!preferredType && backpack?.isBackpack)) {
                if (!backpack) {
                    window.open('https://backpack.app/', '_blank');
                    throw new Error('Backpack wallet not installed. Please install it and refresh.');
                }
                const response = await backpack.connect();
                setPublicKey(new PublicKey(response.publicKey.toString()));
                setConnected(true);
                setWalletType('backpack');
                return;
            }

            // No wallet found
            throw new Error('No Solana wallet detected. Please install Phantom, Solflare, or Backpack.');

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = () => {
        const { solana, solflare, backpack } = window as any;
        
        if (walletType === 'phantom' && solana) {
            solana.disconnect();
        } else if (walletType === 'solflare' && solflare) {
            solflare.disconnect();
        } else if (walletType === 'backpack' && backpack) {
            backpack.disconnect();
        }

        setPublicKey(null);
        setConnected(false);
        setWalletType(null);
    };

    const signAndSendTransaction = async (transaction: Transaction | VersionedTransaction): Promise<string> => {
        const { solana, solflare, backpack } = window as any;
        
        if (!publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const connection = new Connection(endpoint);
            let signedTransaction;

            // Sign with appropriate wallet
            if (walletType === 'phantom' && solana) {
                signedTransaction = await solana.signTransaction(transaction);
            } else if (walletType === 'solflare' && solflare) {
                signedTransaction = await solflare.signTransaction(transaction);
            } else if (walletType === 'backpack' && backpack) {
                signedTransaction = await backpack.signTransaction(transaction);
            } else {
                throw new Error('Wallet not available');
            }
            
            // Send the transaction
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            
            // Confirm the transaction
            await connection.confirmTransaction(signature, 'confirmed');
            
            return signature;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    };

    return (
        <WalletContext.Provider
            value={{
                publicKey,
                connected,
                connecting,
                walletType,
                connect,
                disconnect,
                signAndSendTransaction,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
