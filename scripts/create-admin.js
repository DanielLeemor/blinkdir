
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin@blinkdir.com';
    const password = 'admin'; // Change this in production!

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('admin_users')
        .insert({
            email,
            password_hash: hashedPassword,
            name: 'Super Admin',
            role: 'admin'
        })
        .select();

    if (error) {
        console.error('Error creating admin:', error);
    } else {
        console.log('Admin created successfully:', data);
        console.log(`Credentials: ${email} / ${password}`);
    }
}

createAdmin();
