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

// Helper function to create URL-friendly slugs
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Enhanced SEO content generator for counties
function generateCountySEOContent(county) {
  const title = `${county.name} Butchers Directory | Premium Meat Suppliers | Butchers Near Me`;
  const metaDescription = `Discover exceptional butchers across ${county.name}. Premium meat suppliers offering traditional craftsmanship, local sourcing, and quality cuts. Find verified butchers near you.`;
  const h1 = `Premium Butchers in ${county.name}`;
  const intro = `Explore ${county.name}'s finest butchers, where traditional craftsmanship meets modern standards. Our comprehensive directory showcases quality meat suppliers committed to excellence, local sourcing, and exceptional customer service.`;

  const mainContent = `
    <h2>Exceptional Butchery Across ${county.name}</h2>
    <p>${county.name} boasts a rich heritage of quality butchery, with skilled artisans maintaining centuries-old traditions while embracing modern food safety standards. Discover meat suppliers across the region who understand the art of butchery.</p>

    <h3>Local Sourcing & Quality Assurance</h3>
    <p>Butchers throughout ${county.name} prioritize local partnerships with farms and suppliers, ensuring traceability and supporting regional agriculture. This commitment to local sourcing guarantees fresher products while reducing environmental impact and supporting community economies.</p>

    <h3>Traditional Craftsmanship & Modern Standards</h3>
    <p>The butchers of ${county.name} blend time-honored techniques passed down through generations with contemporary food safety protocols. This unique combination ensures you receive expertly prepared meat that meets the highest standards of quality, safety, and flavor.</p>

    <h3>Comprehensive Services Offered</h3>
    <p>Professional butchers across ${county.name} provide extensive services including:</p>
    <ul>
      <li>Expert meat cutting and preparation</li>
      <li>Custom orders for special occasions</li>
      <li>Local sourcing and seasonal specialties</li>
      <li>Professional cooking advice and preparation guidance</li>
      <li>Sustainable and organic meat options</li>
      <li>Home delivery and catering services</li>
      <li>Wholesale supplies for restaurants and cafes</li>
    </ul>

    <h3>Why Choose Local ${county.name} Butchers?</h3>
    <p>Independent butchers offer personalized service that large retailers cannot match. They understand local preferences, provide expert advice, and often source from nearby farms. Supporting local butchers means investing in your community's economy and preserving traditional skills.</p>
  `;

  return {
    seo_title: title,
    meta_description: metaDescription,
    h1_title: h1,
    intro_text: intro,
    main_content: mainContent,
    seo_keywords: county.seo_keywords || [],
    faq_content: {
      questions: [
        {
          question: `How many butchers are listed in ${county.name}?`,
          answer: `Our ${county.name} directory includes verified butchers across all major locations. Each listing is carefully curated to ensure quality and reliability for our users.`
        },
        {
          question: `Do ${county.name} butchers offer local sourcing?`,
          answer: `Many butchers in ${county.name} prioritize local sourcing, working directly with regional farms to ensure freshness, support local agriculture, and provide full traceability.`
        },
        {
          question: `What services do ${county.name} butchers typically offer?`,
          answer: `${county.name} butchers typically provide custom cutting, special orders, cooking advice, seasonal specialties, and many offer delivery services. Contact individual suppliers for specific services.`
        },
        {
          question: `Are ${county.name} butchers more expensive than supermarkets?`,
          answer: `While local butchers may charge premium prices, they offer superior quality, expert service, custom cutting, and often better value per portion due to reduced waste and higher quality.`
        }
      ]
    }
  };
}

// Enhanced SEO content generator for cities/towns
function generateCitySEOContent(city, county) {
  const title = `${city.name} Butchers | Quality Meat Suppliers in ${county.name} | Butchers Near Me`;
  const metaDescription = `Find premium butchers in ${city.name}, ${county.name}. Local meat suppliers offering fresh cuts, expert service, and traditional quality. Reviews, locations, and contact details.`;
  const h1 = `Quality Butchers in ${city.name}`;
  const intro = `Discover ${city.name}'s premier butchers offering exceptional meat quality and traditional service. Our directory features verified local suppliers committed to craft excellence and community service.`;

  const mainContent = `
    <h2>Premium Meat Suppliers in ${city.name}</h2>
    <p>${city.name} maintains proud traditions of quality butchery in ${county.name}. Local suppliers here understand the community's needs and preferences, combining traditional techniques with modern standards to deliver exceptional products and service.</p>

    <h3>Community-Focused Service</h3>
    <p>Butchers in ${city.name} are integral to the local community, providing personalized service that builds lasting relationships. They know their customers' preferences, offer expert advice, and often accommodate special requests that larger retailers cannot fulfill.</p>

    <h3>Quality & Freshness Guaranteed</h3>
    <p>The meat suppliers of ${city.name} maintain strict quality standards, often sourcing from local farms and ensuring optimal freshness. Their expertise in meat selection, storage, and preparation guarantees you receive the finest products available.</p>

    <h3>Specialized Services Available</h3>
    <p>Professional butchers in ${city.name} typically offer:</p>
    <ul>
      <li>Daily fresh cuts and specialty preparations</li>
      <li>Custom butchery for special events</li>
      <li>Expert cooking advice and recipes</li>
      <li>Seasonal and locally-sourced products</li>
      <li>Competitive pricing with loyalty programs</li>
      <li>Professional delivery services</li>
      <li>Catering support for local businesses</li>
    </ul>

    <h3>Supporting Local Business</h3>
    <p>Choosing ${city.name} butchers means supporting local entrepreneurship and preserving traditional skills. These businesses contribute to the community's economic vitality while maintaining standards of excellence that have served customers for generations.</p>
  `;

  return {
    seo_title: title,
    meta_description: metaDescription,
    h1_title: h1,
    intro_text: intro,
    main_content: mainContent,
    seo_keywords: city.seo_keywords || [],
    faq_content: {
      questions: [
        {
          question: `What butchers are available in ${city.name}?`,
          answer: `${city.name} hosts several quality butchers offering fresh meat, traditional cuts, and personalized service. Check our directory for verified local suppliers with customer reviews and detailed contact information.`
        },
        {
          question: `Do ${city.name} butchers offer delivery services?`,
          answer: `Many butchers in ${city.name} now provide delivery services, particularly following increased demand. Contact individual suppliers to inquire about delivery areas, minimum orders, and scheduling.`
        },
        {
          question: `Can I order custom cuts from ${city.name} butchers?`,
          answer: `Yes, most professional butchers in ${city.name} offer custom cutting services. It's recommended to call ahead or visit in person to discuss your specific requirements and allow adequate preparation time.`
        },
        {
          question: `Are ${city.name} butchers suitable for special dietary requirements?`,
          answer: `Many butchers in ${city.name} can accommodate special dietary needs including organic, grass-fed, halal, and other specialty requirements. Contact suppliers directly to discuss your specific needs.`
        }
      ]
    }
  };
}

async function populateComprehensiveLocations() {
  try {
    console.log('🚀 Starting comprehensive location population...');

    // Load the comprehensive location data
    const locationsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/comprehensive-uk-locations.json'), 'utf8')
    );

    console.log(`📊 Loaded ${locationsData.counties.length} counties with ${locationsData.counties.reduce((sum, county) => sum + county.cities_and_towns.length, 0)} locations`);

    console.log('🗑️ Clearing existing location data...');
    // Clear existing locations
    await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Populating counties...');

    // Insert counties first
    let countyCount = 0;
    for (const county of locationsData.counties) {
      const slug = createSlug(county.name);
      const seoContent = generateCountySEOContent(county);

      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: county.name,
          slug: slug,
          type: 'county',
          county_slug: slug,
          full_path: slug,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Local Sourcing', 'Traditional Craftsmanship', 'Quality Assured', 'Expert Service'],
          nearby_locations: []
        })
        .select();

      if (error) {
        console.error(`❌ Error inserting county ${county.name}:`, error);
      } else {
        countyCount++;
        console.log(`✓ Inserted county: ${county.name} (${county.cities_and_towns.length} locations)`);
      }
    }

    console.log('📍 Populating locations...');

    // Insert cities and towns with county relationships
    let cityCount = 0;
    for (const county of locationsData.counties) {
      const countySlug = createSlug(county.name);

      // Get the county ID
      const { data: countyData, error: countyError } = await supabase
        .from('locations')
        .select('id')
        .eq('slug', countySlug)
        .eq('type', 'county')
        .single();

      if (countyError) {
        console.error(`❌ Error finding county ${county.name}:`, countyError);
        continue;
      }

      for (const city of county.cities_and_towns) {
        const citySlug = createSlug(city.name);
        const seoContent = generateCitySEOContent(city, county);

        const { data, error } = await supabase
          .from('locations')
          .insert({
            name: city.name,
            slug: citySlug,
            type: 'town',
            parent_county_id: countyData.id,
            county_slug: countySlug,
            full_path: `${countySlug}/${citySlug}`,
            seo_title: seoContent.seo_title,
            seo_description: seoContent.meta_description,
            seo_keywords: seoContent.seo_keywords,
            meta_description: seoContent.meta_description,
            h1_title: seoContent.h1_title,
            intro_text: seoContent.intro_text,
            main_content: seoContent.main_content,
            faq_content: seoContent.faq_content,
            local_specialties: ['Fresh Daily', 'Expert Advice', 'Community Service', 'Custom Orders'],
            nearby_locations: []
          })
          .select();

        if (error) {
          console.error(`❌ Error inserting ${city.name}:`, error);
        } else {
          cityCount++;
          if (cityCount % 50 === 0) {
            console.log(`⏳ Progress: ${cityCount} locations populated...`);
          }
        }
      }

      console.log(`✓ Completed ${county.name}: ${county.cities_and_towns.length} locations`);
    }

    console.log('✅ Comprehensive location population complete!');

    // Generate summary statistics
    const { data: finalLocations } = await supabase
      .from('locations')
      .select('type');

    const locationCounts = finalLocations.reduce((acc, location) => {
      acc[location.type] = (acc[location.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Final Statistics:');
    console.log(`🏴󠁧󠁢󠁥󠁮󠁧󠁿 Counties: ${locationCounts.county || 0}`);
    console.log(`🏘️ Towns: ${locationCounts.town || 0}`);
    console.log(`📊 Total Locations: ${finalLocations.length}`);

    console.log('\n🎯 SEO Optimization Summary:');
    console.log('✓ Comprehensive meta descriptions and titles');
    console.log('✓ Location-specific keywords and content');
    console.log('✓ FAQ sections for featured snippets');
    console.log('✓ Local search optimization');
    console.log('✓ Hierarchical URL structure ready');

    // Sample locations for verification
    console.log('\n📋 Sample Locations Created:');
    const sampleLocations = await supabase
      .from('locations')
      .select('name, type, full_path')
      .limit(10);

    sampleLocations.data?.forEach(loc => {
      console.log(`- ${loc.name} (${loc.type}): /${loc.full_path}`);
    });

  } catch (error) {
    console.error('❌ Error populating comprehensive locations:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateComprehensiveLocations();
}

module.exports = { populateComprehensiveLocations };