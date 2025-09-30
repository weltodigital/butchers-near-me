#!/usr/bin/env node

/**
 * Simple database setup script for MeatMap UK
 * This script will help you set up the Supabase database manually
 */

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🗄️  MeatMap UK Database Setup')
console.log('================================\n')

console.log('This script will help you set up your Supabase database.')
console.log('You have two options:\n')

console.log('1. 📋 Manual Setup (Recommended)')
console.log('   - Copy the SQL schema to Supabase SQL Editor')
console.log('   - Execute the schema manually')
console.log('   - Verify tables are created\n')

console.log('2. 🔧 Automated Setup')
console.log('   - Try to execute schema programmatically')
console.log('   - May require additional Supabase permissions\n')

rl.question('Choose an option (1 or 2): ', (choice) => {
  if (choice === '1') {
    showManualSetup()
  } else if (choice === '2') {
    showAutomatedSetup()
  } else {
    console.log('Invalid choice. Please run the script again.')
    rl.close()
  }
})

function showManualSetup() {
  console.log('\n📋 Manual Setup Instructions')
  console.log('============================\n')
  
  console.log('1. Open your Supabase project dashboard')
  console.log('2. Go to the SQL Editor')
  console.log('3. Copy the contents of supabase-schema.sql')
  console.log('4. Paste and execute the SQL')
  console.log('5. Verify the following tables were created:')
  console.log('   - butchers')
  console.log('   - reviews')
  console.log('   - specialties')
  console.log('   - butcher_specialties')
  
  console.log('\n📄 SQL Schema Location:')
  console.log('   ./supabase-schema.sql')
  
  console.log('\n✅ After setup, you can test with:')
  console.log('   npm run test:db')
  
  rl.close()
}

function showAutomatedSetup() {
  console.log('\n🔧 Automated Setup')
  console.log('==================\n')
  
  console.log('This will attempt to create the database schema automatically.')
  console.log('Make sure you have the following environment variables set:')
  console.log('   - SUPABASE_URL')
  console.log('   - SUPABASE_SERVICE_ROLE_KEY')
  
  rl.question('\nContinue with automated setup? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      runAutomatedSetup()
    } else {
      console.log('Setup cancelled.')
      rl.close()
    }
  })
}

async function runAutomatedSetup() {
  try {
    console.log('\n🚀 Starting automated setup...')
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' })
    
    const { createClient } = require('@supabase/supabase-js')
    const fs = require('fs')
    
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables!')
      console.error('Please check your .env.local file')
      rl.close()
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Read and execute schema
    const schema = fs.readFileSync('./supabase-schema.sql', 'utf8')
    
    console.log('📄 Executing database schema...')
    
    // Split schema into statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`   Executing: ${statement.substring(0, 50)}...`)
        
        try {
          const { error } = await supabase.rpc('exec', { sql: statement })
          if (error) {
            console.log(`   ⚠️  ${error.message}`)
          } else {
            console.log(`   ✅ Success`)
          }
        } catch (err) {
          console.log(`   ⚠️  ${err.message}`)
        }
      }
    }
    
    console.log('\n🎉 Automated setup complete!')
    console.log('\nNext steps:')
    console.log('1. Check your Supabase dashboard to verify tables')
    console.log('2. Test the API endpoints')
    console.log('3. Run: npm run test:db')
    
  } catch (error) {
    console.error('❌ Error during automated setup:', error.message)
    console.log('\nFalling back to manual setup...')
    showManualSetup()
  }
  
  rl.close()
}
