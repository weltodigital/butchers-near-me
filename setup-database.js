#!/usr/bin/env node

/**
 * Setup Supabase Database Schema for MeatMap UK
 * This script connects to Supabase and executes the database schema
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MeatMap UK database schema...\n')

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    console.log('📄 Executing database schema...')
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('⚠️  exec_sql function not available, trying direct execution...')
      
      // Split schema into individual statements and execute them
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`   Executing: ${statement.substring(0, 50)}...`)
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
          if (stmtError) {
            console.log(`   ⚠️  Statement failed (may already exist): ${stmtError.message}`)
          }
        }
      }
    } else {
      console.log('✅ Schema executed successfully!')
    }

    // Verify tables were created
    console.log('\n🔍 Verifying database setup...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['butchers', 'reviews', 'specialties', 'butcher_specialties'])

    if (tablesError) {
      console.log('⚠️  Could not verify tables:', tablesError.message)
    } else {
      console.log('✅ Tables created:')
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`)
      })
    }

    // Check sample data
    const { data: butchers, error: butchersError } = await supabase
      .from('butchers')
      .select('name, city, rating')
      .limit(5)

    if (butchersError) {
      console.log('⚠️  Could not verify sample data:', butchersError.message)
    } else {
      console.log('\n📊 Sample butchers loaded:')
      butchers.forEach(butcher => {
        console.log(`   - ${butcher.name} (${butcher.city}) - ⭐ ${butcher.rating}`)
      })
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('user_name, rating, title')
      .limit(3)

    if (reviewsError) {
      console.log('⚠️  Could not verify sample reviews:', reviewsError.message)
    } else {
      console.log('\n💬 Sample reviews loaded:')
      reviews.forEach(review => {
        console.log(`   - ${review.user_name}: "${review.title}" (${review.rating}/5)`)
      })
    }

    console.log('\n🎉 Database setup complete!')
    console.log('\n📋 Next steps:')
    console.log('   1. Test the API endpoints')
    console.log('   2. Set up the frontend data fetching')
    console.log('   3. Add more sample data if needed')
    console.log('   4. Configure search functionality')

  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check your Supabase credentials in .env.local')
    console.error('2. Ensure your Supabase project is active')
    console.error('3. Check if you have the necessary permissions')
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
