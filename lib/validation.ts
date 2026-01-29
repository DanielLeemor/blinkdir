
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

/**
 * STRICT Blink Validation - Ensures URL is an actual Solana Action
 * Not just a website with actions.json
 */
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
        // Step 1: URL must return JSON with GET request
        const getResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlinkDir-Validator/1.0'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!getResponse.ok) {
            return { 
                isValid: false, 
                error: `Action endpoint returned ${getResponse.status}. This doesn't appear to be a valid Blink Action URL.` 
            };
        }

        const contentType = getResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return { 
                isValid: false, 
                error: 'Endpoint did not return JSON. Blink Actions must respond with application/json.' 
            };
        }

        const metadata = await getResponse.json();

        // Step 2: Must have required Solana Actions fields
        if (!metadata.icon) {
            return { 
                isValid: false, 
                error: 'Missing required field: "icon". This is not a valid Solana Action.' 
            };
        }

        if (!metadata.title) {
            return { 
                isValid: false, 
                error: 'Missing required field: "title". This is not a valid Solana Action.' 
            };
        }

        // Step 3: Must have action buttons (this is critical!)
        if (!metadata.links?.actions || !Array.isArray(metadata.links.actions) || metadata.links.actions.length === 0) {
            return { 
                isValid: false, 
                error: 'No action buttons found. A valid Blink must have at least one action in links.actions[]. You may have submitted a website homepage instead of an action endpoint.' 
            };
        }

        // Step 4: Verify POST endpoint works (MOST IMPORTANT CHECK)
        const firstAction = metadata.links.actions[0];
        
        if (!firstAction.href) {
            return {
                isValid: false,
                error: 'Action is missing "href" field. Invalid action structure.'
            };
        }

        const actionHref = firstAction.href;
        
        // Build absolute URL for POST request
        const postUrl = actionHref.startsWith('http') 
            ? actionHref 
            : new URL(actionHref, url).toString();

        try {
            const postResponse = await fetch(postUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'BlinkDir-Validator/1.0'
                },
                body: JSON.stringify({
                    account: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH' // Valid test Solana address
                }),
                signal: AbortSignal.timeout(8000)
            });

            // POST should return 200 (success) or 400 (validation error), but NOT 404/500
            if (postResponse.status === 404) {
                return { 
                    isValid: false, 
                    error: 'POST endpoint returned 404. The action endpoint is not configured properly. Please verify the URL is correct.' 
                };
            }

            if (postResponse.status === 405) {
                return { 
                    isValid: false, 
                    error: 'POST method not allowed. This endpoint does not support Solana Actions.' 
                };
            }

            if (postResponse.status >= 500) {
                return { 
                    isValid: false, 
                    error: 'POST endpoint returned a server error. The action is not working properly.' 
                };
            }

            // Try to parse response
            const postContentType = postResponse.headers.get('content-type');
            if (postContentType && postContentType.includes('application/json')) {
                try {
                    const postData = await postResponse.json();
                    
                    // Check for transaction data or at least a proper error response
                    if (!postData.transaction && !postData.error && !postData.message && postResponse.status === 200) {
                        return { 
                            isValid: false, 
                            error: 'POST endpoint does not return transaction data. This is not a valid Solana Action endpoint.' 
                        };
                    }
                } catch (jsonError) {
                    // If JSON parsing fails but status was ok-ish, might still be valid
                    if (postResponse.status > 400) {
                        return {
                            isValid: false,
                            error: 'POST endpoint returned invalid JSON response.'
                        };
                    }
                }
            }

        } catch (postError) {
            const errorMsg = postError instanceof Error ? postError.message : 'Unknown error';
            return { 
                isValid: false, 
                error: `POST endpoint test failed: ${errorMsg}. The action may be down or not properly configured.` 
            };
        }

        // All checks passed! This is a real Blink Action
        return {
            isValid: true,
            metadata: {
                icon: metadata.icon,
                title: metadata.title,
                description: metadata.description || ''
            }
        };

    } catch (error: any) {
        return { 
            isValid: false, 
            error: `Failed to validate Blink: ${error.message || 'Unknown error'}. Please check the URL and try again.` 
        };
    }
}

/**
 * Quick check if domain has actions.json (for discovery purposes)
 */
export async function checkActionsJsonExists(domain: string): Promise<boolean> {
    try {
        const actionsJsonUrl = `https://${domain}/actions.json`;
        const response = await fetch(actionsJsonUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });
        return response.ok;
    } catch {
        return false;
    }
}
