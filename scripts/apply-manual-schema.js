const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyManualSchema() {
  try {
    console.log('📋 Applying manual schema...');

    // Read the manual schema file
    const schemaPath = path.join(__dirname, 'manual-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split into statements and filter out comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nStatement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));

      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          console.warn(`⚠️ Warning for statement ${i + 1}:`, error.message);
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️ Error for statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n✅ Schema application completed!');

    // Test the schema
    console.log('Testing new schema...');
    const { data, error } = await supabase
      .from('locations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Schema test failed:', error.message);
      console.log('\n📋 Please manually apply the following SQL in your Supabase dashboard:');
      console.log('='.repeat(60));
      console.log(schema);
      console.log('='.repeat(60));
    } else {
      console.log('✅ New schema is working!');
    }

  } catch (error) {
    console.error('❌ Error applying manual schema:', error);
  }
}

applyManualSchema();