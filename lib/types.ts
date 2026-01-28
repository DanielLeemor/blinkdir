
export interface Blink {
    id: string;
    url: string;
    name: string;
    description: string | null;
    category: string;
    creator_name: string | null;
    creator_twitter: string | null;
    screenshot_url: string | null;
    icon_url: string | null;
    verified: boolean;
    featured: boolean;
    featured_tier: 'basic' | 'premium' | null;
    views: number;
    clicks: number;
    tags: string[] | null;
    source: string;
    created_at: string;
}

export interface Category {
    name: string;
    slug: string;
    description: string;
}

export const CATEGORIES: Category[] = [
    { name: 'NFT Tools', slug: 'nft', description: 'NFT marketplaces, minting, analysis' },
    { name: 'DeFi', slug: 'defi', description: 'Trading, lending, staking, yield' },
    { name: 'Gaming', slug: 'gaming', description: 'On-chain games, gaming tools' },
    { name: 'Social', slug: 'social', description: 'Social platforms, tipping, communities' },
    { name: 'Utilities', slug: 'utilities', description: 'Developer tools, explorers, wallets' },
    { name: 'Other', slug: 'other', description: 'Everything else' },
];
