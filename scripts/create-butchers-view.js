const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createButchersView() {
  try {
    console.log('Creating public_butchers view...');

    // Create the public_butchers view
    const viewSQL = `
      CREATE OR REPLACE VIEW public_butchers AS
      SELECT
        id,
        name,
        description,
        address,
        postcode,
        city,
        county,
        phone,
        email,
        website,
        latitude,
        longitude,
        rating,
        review_count,
        specialties,
        opening_hours,
        images,
        county_slug,
        city_slug,
        full_url_path,
        created_at,
        updated_at
      FROM butchers
      WHERE is_active = true;
    `;

    const { error: viewError } = await supabase.rpc('exec_sql', {
      query: viewSQL
    });

    if (viewError) {
      console.log('Warning creating view via RPC:', viewError.message);
      console.log('\n📋 Please manually create this view in your Supabase dashboard:');
      console.log('='.repeat(60));
      console.log(viewSQL);
      console.log('='.repeat(60));
    } else {
      console.log('✅ public_butchers view created successfully!');
    }

    // Grant permissions
    const permissionSQL = `GRANT SELECT ON public_butchers TO anon, authenticated;`;
    const { error: permError } = await supabase.rpc('exec_sql', {
      query: permissionSQL
    });

    if (permError) {
      console.log('Warning setting permissions:', permError.message);
    } else {
      console.log('✅ Permissions granted to public_butchers view');
    }

    // Test the view
    console.log('Testing public_butchers view...');
    const { data, error } = await supabase
      .from('public_butchers')
      .select('name, county_slug, city_slug, full_url_path')
      .limit(3);

    if (error) {
      console.log('❌ View test failed:', error.message);
    } else {
      console.log('✅ View is working!');
      console.log('Sample data:', data);
    }

  } catch (error) {
    console.error('❌ Error creating butchers view:', error);
  }
}

createButchersView();