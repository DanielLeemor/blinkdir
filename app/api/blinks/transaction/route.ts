import { NextRequest, NextResponse } from 'next/server';
import { Connection, VersionedTransaction } from '@solana/web3.js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transaction, blinkUrl } = body;

        if (!transaction) {
            return NextResponse.json({ error: 'Missing transaction' }, { status: 400 });
        }

        // Deserialize the transaction
        const transactionBuffer = Buffer.from(transaction, 'base64');
        const versionedTransaction = VersionedTransaction.deserialize(transactionBuffer);

        // Connect to Solana
        const connection = new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
            'confirmed'
        );

        // Send the transaction
        const signature = await connection.sendRawTransaction(versionedTransaction.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
        });

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            throw new Error('Transaction failed');
        }

        // Optionally: Track the transaction in your database here
        // await trackBlinkTransaction(blinkUrl, signature);

        return NextResponse.json({
            success: true,
            signature,
            explorerUrl: `https://solscan.io/tx/${signature}`
        });

    } catch (error) {
        console.error('Transaction submission error:', error);
        return NextResponse.json(
            {
                error: 'Failed to submit transaction',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
