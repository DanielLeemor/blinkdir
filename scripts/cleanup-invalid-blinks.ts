/**
 * Cleanup Invalid Blinks Script
 * 
 * Removes all Blinks from the database that:
 * 1. Have is_valid_blink = false
 * 2. Fail live validation check
 * 
 * Run with: npx tsx scripts/cleanup-invalid-blinks.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { validateActionEndpoint } from '../lib/blinkCrawler';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupInvalidBlinks() {
    console.log('🧹 Starting Blink Cleanup...\n');

    // Step 1: Get all Blinks
    const { data: blinks, error: fetchError } = await supabase
        .from('blinks')
        .select('id, name, url, is_valid_blink');

    if (fetchError) {
        console.error('❌ Failed to fetch Blinks:', fetchError.message);
        process.exit(1);
    }

    console.log(`📋 Found ${blinks?.length || 0} Blinks in database\n`);

    const toDelete: string[] = [];
    const toKeep: string[] = [];

    for (const blink of blinks || []) {
        console.log(`\n🔍 Checking: ${blink.name}`);
        console.log(`   URL: ${blink.url}`);
        console.log(`   DB Status: is_valid_blink = ${blink.is_valid_blink}`);

        // If already marked as invalid, delete it
        if (blink.is_valid_blink === false) {
            console.log('   ❌ Marked as invalid in DB → Will be DELETED');
            toDelete.push(blink.id);
            continue;
        }

        // Live validation check
        console.log('   🔄 Running live validation...');
        const validation = await validateActionEndpoint(blink.url);

        if (!validation.isValid) {
            console.log(`   ❌ Live validation FAILED: ${validation.error}`);
            toDelete.push(blink.id);
        } else if (!validation.metadata?.actionCount || validation.metadata.actionCount === 0) {
            console.log('   ❌ No actions found → Will be DELETED');
            toDelete.push(blink.id);
        } else {
            console.log(`   ✅ VALID: ${validation.metadata.actionCount} action(s) found`);
            toKeep.push(blink.id);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Keeping: ${toKeep.length} Blinks`);
    console.log(`❌ Deleting: ${toDelete.length} Blinks`);
    console.log('='.repeat(60));

    if (toDelete.length === 0) {
        console.log('\n✨ No invalid Blinks found. Database is clean!');
        return;
    }

    // Delete invalid Blinks
    console.log('\n🗑️  Deleting invalid Blinks...');

    const { error: deleteError } = await supabase
        .from('blinks')
        .delete()
        .in('id', toDelete);

    if (deleteError) {
        console.error('❌ Failed to delete Blinks:', deleteError.message);
        process.exit(1);
    }

    console.log(`\n✅ Successfully deleted ${toDelete.length} invalid Blinks!`);
    console.log('🎉 Database cleanup complete!');
}

cleanupInvalidBlinks().catch(console.error);
