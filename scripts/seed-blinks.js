
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for bypassing RLS if needed

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- LIST OF KNOWN BLINKS TO SEED ---
// Expanded list with more specific Action URLs and additional platforms
const BLINK_URLS = [
    // DeFi / Trading
    'https://jup.ag',
    'https://app.meteora.ag',
    'https://dial.to',
    'https://sanctum.so',
    'https://app.kamino.finance',
    'https://marginfi.com',
    'https://drift.trade',
    'https://app.zeta.markets',
    'https://www.orca.so',
    'https://raydium.io',
    'https://app.realms.today', // DAO Governance
    'https://squads.so', // Multisig

    // NFT & Consumer
    'https://tensor.trade',
    'https://magiceden.io',
    'https://solnftscanner.com',
    'https://drip.haus',
    'https://famousfoxes.com',
    'https://shop.solana.com', // Solana Saga/Merch
    'https://tiplink.io', // Social payments (often has actions)

    // Social / Community / Donations
    'https://www.askanon.me',
    'https://www.cact.club',
    'https://accessprotocol.co',
    'https://bounty.superteam.fun',
    'https://donate.cubik.so', // Donations
    'https://theheist.game', // Gaming

    // Specific Action Deep Links (If root fails, these might work if logic handled deep links)
    // For now, sticking to roots that host actions.json as primary entry

    // Tools / Utilities
    'https://solana.fm',
    'https://solscan.io',
    'https://rugcheck.xyz',
    'https://explorer.solana.com',
    'https://www.helius.dev',
    'https://birdeye.so', // Analytics
    'https://geckoterminal.com',

    // Games / Metaverse
    'https://photofinish.live',
    'https://staratlas.com',
    'https://mixmob.io',
    'https://genopets.me',
    'https://aurory.io'
];

async function validateAndFetchMetadata(url) {
    try {
        console.log(`🔍 Checking ${url}...`);

        // 1. Try fetching actions.json
        // The spec says it should be at /actions.json
        const actionsUrl = new URL('/actions.json', url).toString();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(actionsUrl, {
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`   ⚠️ No actions.json found at ${actionsUrl} (Status: ${response.status})`);
            // Fallback: Some sites might be valid but not strictly following /actions.json yet or blocking bots
            // For seeding purposes, we might want to be lenient OR strict.
            // Strict for now to ensure quality.
            return null;
        }

        const data = await response.json();

        // Basic validation of spec
        // Spec requires 'rules' or 'links' usually, but minimal is icon/title/description for display
        // Many actions.json might have different structures (standard vs dialect extensions)
        // We look for 'rules' array or top level metadata

        // Simplistic extraction for Directory Display (we assume the site IS the action for now)
        // Real parsing is complex, for Seed we use site metadata if JSON is sparse

        // NOTE: Many main domains (like jup.ag) hosting actions.json might return a rules list mapping paths to actions.
        // For the directory, we want to list the PLATFORM (e.g. Jupiter)

        const name = data.title || data.name || new URL(url).hostname;
        const description = data.description || `Interact with ${name} on Solana.`;
        const icon = data.icon || `https://www.google.com/s2/favicons?domain=${url}&sz=128`;

        return {
            url: url,
            name: name,
            description: description,
            icon_url: icon,
            category: determineCategory(url, description),
            screenshot_url: null // Will generate later
        };

    } catch (error) {
        console.warn(`   ❌ Error checking ${url}: ${error.message}`);
        return null;
    }
}

function determineCategory(url, desc) {
    const text = (url + ' ' + desc).toLowerCase();
    if (text.includes('nft') || text.includes('marketplace') || text.includes('drip') || text.includes('fox')) return 'nft';
    if (text.includes('swap') || text.includes('trade') || text.includes('stake') || text.includes('yield') || text.includes('finance')) return 'defi';
    if (text.includes('game') || text.includes('play') || text.includes('arcade')) return 'gaming';
    if (text.includes('social') || text.includes('chat') || text.includes('access')) return 'social';
    if (text.includes('tool') || text.includes('explorer') || text.includes('scan') || text.includes('check')) return 'utilities';
    return 'other';
}

async function generateScreenshot(url) {
    const apiKey = process.env.SCREENSHOT_API_KEY;
    if (!apiKey) {
        console.warn('   ⚠️ No SCREENSHOT_API_KEY found, skipping screenshot generation.');
        return null;
    }
    // Construct screenshot.one URL
    return `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&full_page=false&viewport_width=1280&viewport_height=800&device_scale_factor=1&format=jpg&image_quality=80&block_ads=true&block_cookie_banners=true&block_trackers=true&wait_for_selector=body`;
}

async function seed() {
    console.log('🌱 Starting Seed Process...');

    let successCount = 0;

    for (const url of BLINK_URLS) {
        const metadata = await validateAndFetchMetadata(url);

        if (metadata) {
            // Check if already exists
            const { data: existing } = await supabase
                .from('blinks')
                .select('id')
                .eq('url', metadata.url)
                .single();

            if (existing) {
                console.log(`   ⏭️  Skipping ${metadata.name} (Already exists)`);
                continue;
            }

            // Generate Screenshot URL
            metadata.screenshot_url = await generateScreenshot(metadata.url);

            // Insert into DB
            const { error } = await supabase.from('blinks').insert({
                ...metadata,
                status: 'approved', // Auto-approve seeded items
                source: 'seed_script',
                verified: true,
                views: Math.floor(Math.random() * 1000) + 50, // Fake initial stats for lively look
                clicks: Math.floor(Math.random() * 200) + 10
            });

            if (error) {
                console.error(`   ❌ Failed to insert ${metadata.name}:`, error.message);
            } else {
                console.log(`   ✅ Successfully added: ${metadata.name}`);
                successCount++;
            }
        }
    }

    console.log(`\n✨ Seeding Complete! Added ${successCount} new Blinks.`);
}

seed();
