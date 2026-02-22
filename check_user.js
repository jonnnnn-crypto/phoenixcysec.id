const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("Checking %20:");
    const { data: d1 } = await supabase.from('users').select('*').ilike('username', '%Riski%').limit(10);
    console.log(d1);
}
run();
