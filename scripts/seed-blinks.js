require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Curated list of high-quality Solana Blink candidates
const CANDIDATE_URLS = [
    // Top DeFi
    'https://jup.ag',
    'https://raydium.io',
    'https://orcawhirlpool.com', // Attempt alternate
    'https://orca.so',
    'https://tensor.trade',
    'https://magiceden.io',
    'https://app.kamino.finance',
    'https://app.meteora.ag',
    'https://marginfi.com',
    'https://drift.trade',
    'https://app.zeta.markets',
    'https://sanctum.so',

    // Utilities & Tools
    'https://dial.to',
    'https://tiplink.io',
    'https://solnftscanner.com',
    'https://squads.so',
    'https://app.realms.today',
    'https://solana.fm',
    'https://solscan.io',
    'https://rugcheck.xyz',
    'https://explorer.solana.com',
    'https://www.helius.dev',
    'https://birdeye.so',
    'https://geckoterminal.com',

    // NFT & Community
    'https://drip.haus',
    'https://famousfoxes.com',
    'https://shop.solana.com',
    'https://www.askanon.me',
    'https://www.cact.club',
    'https://accessprotocol.co',
    'https://bounty.superteam.fun',
    'https://donate.cubik.so',

    // Games
    'https://theheist.game',
    'https://photofinish.live',
    'https://staratlas.com',
    'https://mixmob.io',
    'https://genopets.me',
    'https://aurory.io'
];

async function validateAndFetchMetadata(url) {
    try {
        console.log(`🔍 Checking ${url}...`);

        // 1. Check for actions.json
        const actionsUrl = new URL('/actions.json', url).toString();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(actionsUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlinkDir-Bot/1.0'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`   ⚠️ No actions.json found at ${actionsUrl} (Status: ${response.status})`);
            return null;
        }

        // 2. Parse JSON
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.warn(`   ❌ Invalid JSON at ${actionsUrl}`);
            return null;
        }

        // 3. Extract Metadata
        // Some actions.json have top-level metadata, others rely on rules
        const rules = data.rules || [];

        // Try to find a meaningful name/description if not at top level
        let name = data.title || data.name || new URL(url).hostname.replace('www.', '');
        let description = data.description || `Interact with ${name} on Solana.`;
        let icon = data.icon || `https://www.google.com/s2/favicons?domain=${url}&sz=128`;

        // Determine category based on URL/Description
        const category = determineCategory(url, description);

        return {
            url: url,
            name: name,
            description: description,
            icon_url: icon,
            category: category,
            screenshot_url: null, // Will generate placeholder
            verified: true, // If it has actions.json, we consider it technically verified as a Blink provider
            status: 'approved', // Auto-approve seeded blinks
            source: 'seed_script'
        };

    } catch (error) {
        console.warn(`   ❌ Error checking ${url}: ${error.message}`);
        return null;
    }
}

function determineCategory(url, desc) {
    const text = (url + ' ' + desc).toLowerCase();
    if (text.includes('swap') || text.includes('dex') || text.includes('finance') || text.includes('yield') || text.includes('stake') || text.includes('margin')) return 'defi';
    if (text.includes('nft') || text.includes('collection') || text.includes('art') || text.includes('fox') || text.includes('drip')) return 'nft';
    if (text.includes('game') || text.includes('play') || text.includes('metaverse')) return 'gaming';
    if (text.includes('dao') || text.includes('vote') || text.includes('govern')) return 'governance';
    if (text.includes('tip') || text.includes('pay') || text.includes('scan') || text.includes('explore') || text.includes('tool')) return 'utilities';
    return 'other';
}

async function clearAndSeed() {
    console.log('🌱 Starting Seed Process...');

    // 1. Clear Database
    console.log('🗑️ Clearing existing Blinks...');
    const { error: deleteError } = await supabase
        .from('blinks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('❌ Failed to clear database:', deleteError);
        return;
    }

    // 2. Validate and Insert
    let addedCount = 0;

    for (const url of CANDIDATE_URLS) {
        const metadata = await validateAndFetchMetadata(url);

        if (metadata) {
            const { error: insertError } = await supabase
                .from('blinks')
                .insert(metadata);

            if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                    console.log(`   🔸 ${metadata.name} already exists`);
                } else {
                    console.error(`   ❌ Failed to insert ${metadata.name}:`, insertError.message);
                }
            } else {
                console.log(`   ✅ Successfully added: ${metadata.name}`);
                addedCount++;
            }
        }

        // Politeness delay
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✨ Seeding Complete! Added ${addedCount} valid Blinks.`);
}

clearAndSeed();
