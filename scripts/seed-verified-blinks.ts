/**
 * Seed Verified Blinks Script
 * 
 * Inserts verified, working Solana Actions into the database.
 * These are endpoints that have been manually tested and confirmed working.
 * 
 * Run with: npx tsx scripts/seed-verified-blinks.ts
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

// Verified working Solana Actions - manually tested
const VERIFIED_BLINKS = [
    {
        name: 'On-chain Memo',
        url: 'https://solana-actions.vercel.app/api/actions/memo',
        description: 'Send a message on-chain using a Memo. Official Solana developer example.',
        category: 'utilities',
        creator_name: 'Solana Foundation',
        icon_url: 'https://solana-actions.vercel.app/solana_devs.jpg',
    },
    {
        name: 'Transfer SOL',
        url: 'https://solana-actions.vercel.app/api/actions/transfer-sol',
        description: 'Transfer native SOL to another Solana wallet. Official Solana developer example.',
        category: 'defi',
        creator_name: 'Solana Foundation',
        icon_url: 'https://solana-actions.vercel.app/solana_devs.jpg',
    },
];

async function seedVerifiedBlinks() {
    console.log('🌱 Seeding Verified Blinks...\n');

    // Check existing URLs to avoid duplicates
    const { data: existing } = await supabase.from('blinks').select('url');
    const existingUrls = new Set((existing || []).map(b => b.url));

    console.log(`📋 Found ${existingUrls.size} existing Blinks\n`);

    let added = 0;
    let skipped = 0;

    for (const blink of VERIFIED_BLINKS) {
        console.log(`\n🔍 Processing: ${blink.name}`);

        if (existingUrls.has(blink.url)) {
            console.log('   ⏭️  Already exists - skipping');
            skipped++;
            continue;
        }

        // Verify the endpoint is still working
        try {
            const res = await fetch(blink.url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BlinkDir/1.0 (Solana Actions Directory)'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) {
                console.log(`   ❌ Endpoint returned ${res.status} - skipping`);
                skipped++;
                continue;
            }

            const data = await res.json();
            if (!data.title && !data.label) {
                console.log('   ❌ Invalid response - skipping');
                skipped++;
                continue;
            }

            console.log(`   ✅ Verified: "${data.title || data.label}"`);
        } catch (err: any) {
            console.log(`   ❌ Fetch failed: ${err.message} - skipping`);
            skipped++;
            continue;
        }

        // Insert into database
        const { error: insertError } = await supabase.from('blinks').insert({
            ...blink,
            is_valid_blink: true,
            status: 'approved',
            verified: true,
            source: 'verified_seed'
        });

        if (insertError) {
            console.log(`   ❌ Insert failed: ${insertError.message}`);
        } else {
            console.log('   💾 Added to database!');
            added++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added: ${added} Blinks`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log('='.repeat(50));

    if (added > 0) {
        console.log('\n🎉 Verified Blinks seeded successfully!');
    }
}

seedVerifiedBlinks().catch(console.error);
