require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const { data: tables, error } = await supabase.from('prompts').select('*').limit(1);
  if (error) {
    console.error("Error querying 'prompts' table:", error);
  } else {
    console.log("Table 'prompts' exists.");
  }
}
test();
