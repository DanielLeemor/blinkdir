
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetStats() {
    console.log('🧹 Resetting all view/click counts to 0...');

    const { error } = await supabase
        .from('blinks')
        .update({
            views: 0,
            clicks: 0
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid hack to match all rows

    if (error) {
        console.error('❌ Error resetting stats:', error);
    } else {
        console.log('✅ All counts reset to 0. Honesty is the best policy!');
    }
}

resetStats();
