/**
 * Blink Discovery Scraper
 * 
 * Discovers and validates real Solana Actions from the ecosystem.
 * Only inserts Blinks that pass live validation with at least 1 action.
 * 
 * Run with: npx tsx scripts/scrape-blinks.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Known working Solana Actions endpoints
// These are manually verified to have working actions.json
const KNOWN_BLINKS = [
    // Dialect's official examples
    {
        url: 'https://dial.to/donate',
        name: 'Donate via Dial.to',
        description: 'Send SOL donations through Dialect',
        category: 'utilities',
        creator: 'Dialect'
    },
    // Helius example actions
    {
        url: 'https://dial.to/devnet?action=solana-action:https://memo-api.helius-rpc.com/api/actions/memo',
        name: 'Helius Memo',
        description: 'Write a memo on Solana using Helius',
        category: 'utilities',
        creator: 'Helius'
    },
];

// URLs to test for actions.json directly
const ENDPOINTS_TO_TEST = [
    // Testing known action API patterns
    { url: 'https://dial.to', name: 'Dial.to', creator: 'Dialect' },
    { url: 'https://actions.jup.ag', name: 'Jupiter Actions', creator: 'Jupiter' },
    { url: 'https://send.dialect.to', name: 'Dialect Send', creator: 'Dialect' },
];

interface ActionResponse {
    icon?: string;
    title?: string;
    description?: string;
    label?: string;
    links?: {
        actions?: Array<{
            label: string;
            href: string;
            parameters?: any[];
        }>;
    };
}

async function testActionsEndpoint(baseUrl: string): Promise<{ isValid: boolean; data?: ActionResponse; error?: string; actionCount?: number }> {
    try {
        // Try fetching actions.json
        const actionsJsonUrl = new URL('/actions.json', baseUrl).toString();
        console.log(`   Testing: ${actionsJsonUrl}`);

        const res = await fetch(actionsJsonUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlinkDir/1.0 (Solana Actions Directory)'
            },
            signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
            // Try the base URL with actions header
            const actionRes = await fetch(baseUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BlinkDir/1.0 (Solana Actions Directory)'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!actionRes.ok) {
                return { isValid: false, error: `HTTP ${actionRes.status}` };
            }

            const data = await actionRes.json();
            const actionCount = data.links?.actions?.length || (data.label ? 1 : 0);

            if (actionCount > 0) {
                return { isValid: true, data, actionCount };
            }
            return { isValid: false, error: 'No actions found' };
        }

        const actionsJson = await res.json();

        // Check if it has rules
        if (actionsJson.rules && actionsJson.rules.length > 0) {
            // Test the first rule's API path
            const firstRule = actionsJson.rules[0];
            const apiUrl = firstRule.apiPath.startsWith('http')
                ? firstRule.apiPath
                : new URL(firstRule.apiPath, baseUrl).toString();

            const apiRes = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BlinkDir/1.0 (Solana Actions Directory)'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (apiRes.ok) {
                const data = await apiRes.json();
                const actionCount = data.links?.actions?.length || (data.label ? 1 : 0);
                if (actionCount > 0) {
                    return { isValid: true, data, actionCount };
                }
            }
        }

        return { isValid: false, error: 'No valid actions found in actions.json' };
    } catch (err: any) {
        return { isValid: false, error: err.message || 'Unknown error' };
    }
}

async function scrapeAndInsertBlinks() {
    console.log('🔍 Starting Blink Discovery...\n');
    console.log('='.repeat(60));

    let added = 0;
    let skipped = 0;
    let failed = 0;

    // First check existing URLs to avoid duplicates
    const { data: existing } = await supabase.from('blinks').select('url');
    const existingUrls = new Set((existing || []).map(b => b.url));

    console.log(`📋 Found ${existingUrls.size} existing Blinks in database\n`);

    // Test each endpoint
    for (const endpoint of ENDPOINTS_TO_TEST) {
        console.log(`\n🔍 Testing: ${endpoint.name}`);
        console.log(`   URL: ${endpoint.url}`);

        if (existingUrls.has(endpoint.url)) {
            console.log('   ⏭️  Already exists in database');
            skipped++;
            continue;
        }

        const result = await testActionsEndpoint(endpoint.url);

        if (!result.isValid) {
            console.log(`   ❌ INVALID: ${result.error}`);
            failed++;
            continue;
        }

        console.log(`   ✅ VALID: ${result.actionCount} action(s) found`);

        // Insert into database
        const blink = {
            name: result.data?.title || endpoint.name,
            url: endpoint.url,
            description: result.data?.description || `Solana Actions from ${endpoint.creator}`,
            category: 'defi',
            creator_name: endpoint.creator,
            icon_url: result.data?.icon || `https://www.google.com/s2/favicons?domain=${new URL(endpoint.url).hostname}&sz=128`,
            is_valid_blink: true,
            action_count: result.actionCount,
            status: 'approved',
            verified: true,
            source: 'scraper'
        };

        const { error: insertError } = await supabase.from('blinks').insert(blink);

        if (insertError) {
            console.log(`   ❌ Insert failed: ${insertError.message}`);
            failed++;
        } else {
            console.log('   💾 Added to database!');
            added++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 DISCOVERY SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Added: ${added} Blinks`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log(`❌ Failed: ${failed} (invalid or error)`);
    console.log('='.repeat(60));

    if (added > 0) {
        console.log('\n🎉 Discovery complete! New Blinks added to directory.');
    } else {
        console.log('\n💡 No new working Blinks found. Consider adding verified URLs manually.');
    }
}

scrapeAndInsertBlinks().catch(console.error);
