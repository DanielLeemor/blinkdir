
import { z } from 'zod';

// Schema for blink submission
export const blinkSubmissionSchema = z.object({
    url: z.string().url('Invalid URL format').startsWith('https://', 'URL must be HTTPS'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.enum(['nft', 'defi', 'gaming', 'social', 'utilities', 'other']),
    creator_name: z.string().optional(),
    creator_twitter: z.string().optional(),
    creator_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

// Helper validation function for Blink Actions
export async function validateBlinkUrl(url: string): Promise<{
    isValid: boolean;
    metadata?: {
        icon: string;
        title: string;
        description: string;
    };
    error?: string;
}> {
    try {
        // Construct actions.json URL
        // Standard is: https://domain.com/actions.json
        // But input might be https://domain.com/some/path
        // According to Solana Actions spec, we check the root or specific path?
        // The spec says: "GET /actions.json" from the same origin.
        // Ideally we assume the user gives the root of the blink or the direct link.
        // Let's try to fetch `actions.json` from the root of the origin first, as is standard.
        // Wait, blinks are specific endpoints. The `actions.json` allows discovery.
        // We should probably check if the URL *ITSELF* returns the GET headers for an action (GET request to the URL).
        // An Action URL responds to GET with metadata.

        // Spec correction:
        // A "Blink" is a client-side wrapper. The "Action" is the API.
        // The URL the user pastes is likely the "Action URL" (e.g. `https://jup.ag/swap/SOL-USDC`).
        // A GET request to this URL should return the Action metadata (icon, title, etc).

        // We will try to fetch the URL with correct headers.

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // Optional: Add a custom User-Agent so they know it's us
                'User-Agent': 'BlinkDir-Validator/1.0'
            },
            signal: AbortSignal.timeout(5000) // 5s timeout
        });

        if (!response.ok) {
            // Fallback: Check if domain serves actions.json
            try {
                const urlObj = new URL(url);
                const actionsJsonUrl = `${urlObj.origin}/actions.json`;
                const rootRes = await fetch(actionsJsonUrl);
                if (rootRes.ok) {
                    return {
                        isValid: true,
                        metadata: {
                            icon: '/placeholder.png',
                            title: 'Verified Action Provider',
                            description: 'Action from a verified domain'
                        }
                    };
                }
            } catch (e) {
                // ignore
            }
            return { isValid: false, error: `URL returned ${response.status} ${response.statusText}` };
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // Fallback: Check if domain serves actions.json
            try {
                const urlObj = new URL(url);
                const actionsJsonUrl = `${urlObj.origin}/actions.json`;
                const rootRes = await fetch(actionsJsonUrl);
                if (rootRes.ok) {
                    return {
                        isValid: true,
                        metadata: {
                            icon: '/placeholder.png',
                            title: 'Verified Action Provider',
                            description: 'Action from a verified domain'
                        }
                    };
                }
            } catch (e) {
                // ignore
            }
            return { isValid: false, error: 'URL did not return JSON. Is this a valid Action URL?' };
        }

        const json = await response.json();

        // Validate Solana Actions spec (Basic check)
        // Needs 'icon' and 'title' (and usually 'label' or 'links')
        if (!json.icon || !json.title) {
            return { isValid: false, error: 'Response is missing required Action fields (icon, title)' };
        }

        return {
            isValid: true,
            metadata: {
                icon: json.icon,
                title: json.title,
                description: json.description || ''
            }
        };
    } catch (error: any) {
        return { isValid: false, error: error.message || 'Failed to fetch URL' };
    }
}
