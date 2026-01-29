"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

interface WalletContextType {
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    connect: () => Promise<void>;
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

    // Check if wallet is already connected on mount
    useEffect(() => {
        const checkIfWalletConnected = async () => {
            try {
                const { solana } = window as any;
                if (solana?.isPhantom) {
                    const response = await solana.connect({ onlyIfTrusted: true });
                    setPublicKey(new PublicKey(response.publicKey.toString()));
                    setConnected(true);
                }
            } catch (error) {
                console.log('Wallet not connected:', error);
            }
        };

        checkIfWalletConnected();
    }, []);

    const connect = async () => {
        if (connecting) return;
        
        setConnecting(true);
        try {
            const { solana } = window as any;
            
            if (!solana) {
                window.open('https://phantom.app/', '_blank');
                throw new Error('Phantom wallet not found! Please install Phantom wallet.');
            }

            const response = await solana.connect();
            setPublicKey(new PublicKey(response.publicKey.toString()));
            setConnected(true);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = () => {
        const { solana } = window as any;
        if (solana) {
            solana.disconnect();
            setPublicKey(null);
            setConnected(false);
        }
    };

    const signAndSendTransaction = async (transaction: Transaction | VersionedTransaction): Promise<string> => {
        const { solana } = window as any;
        
        if (!solana || !publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const connection = new Connection(endpoint);
            
            // Sign the transaction
            const signedTransaction = await solana.signTransaction(transaction);
            
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
                connect,
                disconnect,
                signAndSendTransaction,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
