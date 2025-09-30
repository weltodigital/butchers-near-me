#!/usr/bin/env node

import dotenv from 'dotenv'
import { addUrlPathColumn, updateAllButchersWithUrlPaths } from '../src/lib/supabase.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runMigration() {
  console.log('🚀 Starting URL path migration...')
  console.log('')

  try {
    // Step 1: Add the column to the database
    console.log('Step 1: Adding full_url_path column...')
    const columnAdded = await addUrlPathColumn()

    if (!columnAdded) {
      console.error('❌ Failed to add column. Exiting.')
      process.exit(1)
    }

    console.log('')

    // Step 2: Update all existing butchers with URL paths
    console.log('Step 2: Updating existing butchers...')
    const updated = await updateAllButchersWithUrlPaths()

    if (!updated) {
      console.error('❌ Failed to update butchers. Exiting.')
      process.exit(1)
    }

    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('   All butchers now have proper URL paths in the format:')
    console.log('   /county/city/butcher-name')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run the migration
runMigration()