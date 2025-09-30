const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Debug environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ No Supabase key found in environment variables');
  process.exit(1);
}

console.log('✅ Supabase configuration found, initializing client...');

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

// Helper function to generate SEO content for counties
function generateCountySEOContent(county) {
  const title = `${county.name} Butchers Directory | Quality Meat Suppliers | MeatMap UK`;
  const metaDescription = `Find premium butchers across ${county.name}. Discover quality meat suppliers in cities and towns throughout this historic county. Local sourcing, traditional methods, expert service.`;
  const h1 = `Butchers in ${county.name}`;
  const intro = `Discover ${county.name}'s finest butchers across historic market towns and vibrant cities. Our comprehensive directory showcases quality meat suppliers who maintain the county's proud tradition of exceptional butchery and local sourcing.`;

  const mainContent = `
    <h2>Premium Butchers Across ${county.name}</h2>
    <p>${county.name} boasts a remarkable heritage of quality butchery, from bustling market towns to historic cities. The county's diverse landscape and agricultural traditions have fostered a community of skilled butchers who combine time-honored techniques with modern standards of excellence.</p>

    <h3>Local Sourcing & County Traditions</h3>
    <p>Butchers throughout ${county.name} maintain strong relationships with local farms and suppliers, ensuring the freshest, highest-quality meat reaches your table. This commitment to local sourcing supports the county's agricultural economy while guaranteeing exceptional flavor and freshness.</p>

    <h3>Market Towns & City Centers</h3>
    <p>From historic market squares to modern shopping districts, ${county.name}'s butchers serve communities with pride and expertise. Whether you're seeking traditional cuts, specialty preparations, or expert advice, the county's meat suppliers offer unparalleled service and quality.</p>

    <h3>Services & Specialties</h3>
    <p>Butchers across ${county.name} offer comprehensive services including:</p>
    <ul>
      <li>Traditional and contemporary meat cutting</li>
      <li>Local sourcing and seasonal specialties</li>
      <li>Custom orders and special occasions</li>
      <li>Expert cooking advice and preparation tips</li>
      <li>Sustainable and organic options</li>
      <li>Home delivery services</li>
    </ul>
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
          question: `How many butchers are there in ${county.name}?`,
          answer: `${county.name} hosts numerous quality butchers across its cities and towns. Our directory includes verified businesses that meet high standards of quality and service.`
        },
        {
          question: `Do ${county.name} butchers offer local sourcing?`,
          answer: `Many butchers in ${county.name} prioritize local sourcing, working with nearby farms to ensure freshness and support the regional agricultural economy.`
        },
        {
          question: `Can I find specialty meats in ${county.name}?`,
          answer: `Yes, ${county.name} butchers offer various specialties including organic options, traditional preparations, game meats, and seasonal specialties reflecting local culinary traditions.`
        }
      ]
    }
  };
}

// Helper function to generate SEO content for cities/towns
function generateCitySEOContent(city, county) {
  const title = `${city.name} Butchers | Premium Meat Suppliers in ${county.name} | MeatMap UK`;
  const metaDescription = `Find quality butchers in ${city.name}, ${county.name}. Local meat suppliers offering fresh cuts, traditional service, and expert advice. Reviews, locations, and opening hours.`;
  const h1 = `Butchers in ${city.name}`;
  const intro = `Discover ${city.name}'s finest butchers offering premium quality meat and traditional service. Our directory features verified local suppliers committed to excellence and community service.`;

  const mainContent = `
    <h2>Quality Meat Suppliers in ${city.name}</h2>
    <p>${city.name} maintains a proud tradition of quality butchery, with local suppliers who understand the needs of the community. These businesses combine traditional skills with modern standards to deliver exceptional products and service.</p>

    <h3>Local Community Focus</h3>
    <p>Butchers in ${city.name} are integral to the local community, providing personalized service that larger retailers cannot match. They know their customers, understand local preferences, and often source from nearby farms to ensure optimal freshness.</p>

    <h3>Traditional Skills & Modern Standards</h3>
    <p>The butchers of ${city.name} blend time-honored techniques with contemporary food safety standards. This combination ensures you receive expertly prepared meat that meets the highest standards of quality and safety.</p>

    <h3>Specialties & Services</h3>
    <p>Local butchers in ${city.name} typically offer:</p>
    <ul>
      <li>Fresh daily cuts and prepared meats</li>
      <li>Custom cutting and special orders</li>
      <li>Expert cooking advice and recommendations</li>
      <li>Seasonal and specialty products</li>
      <li>Competitive pricing and loyalty programs</li>
      <li>Community-focused personal service</li>
    </ul>
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
          answer: `${city.name} hosts several quality butchers offering fresh meat, traditional cuts, and personalized service. Check our directory for verified local suppliers with reviews and contact details.`
        },
        {
          question: `Do ${city.name} butchers offer delivery services?`,
          answer: `Many butchers in ${city.name} now offer delivery services, especially following increased demand. Contact individual suppliers to inquire about their delivery areas and minimum orders.`
        },
        {
          question: `Can I get custom cuts from ${city.name} butchers?`,
          answer: `Yes, most professional butchers in ${city.name} offer custom cutting services. It's best to call ahead or visit to discuss your specific requirements and allow time for preparation.`
        }
      ]
    }
  };
}

async function populateHierarchicalLocations() {
  try {
    console.log('Loading hierarchical location data...');

    // Load the hierarchical location data
    const locationsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/uk-hierarchical-locations.json'), 'utf8')
    );

    console.log('Populating counties...');

    // Insert counties first
    for (const county of locationsData.counties) {
      const slug = createSlug(county.name);
      const seoContent = generateCountySEOContent(county);

      const { data, error } = await supabase
        .from('locations')
        .upsert({
          name: county.name,
          slug: slug,
          type: 'county',
          population: county.population,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Local Sourcing', 'Traditional Methods', 'Quality Assured'],
          nearby_locations: []
        }, {
          onConflict: 'slug,type'
        });

      if (error) {
        console.error(`Error inserting county ${county.name}:`, error);
      } else {
        console.log(`✓ Inserted county: ${county.name}`);
      }
    }

    console.log('Populating cities and towns...');

    // Insert cities and towns with county relationships
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
        console.error(`Error finding county ${county.name}:`, countyError);
        continue;
      }

      for (const city of county.cities_and_towns) {
        const citySlug = createSlug(city.name);
        const seoContent = generateCitySEOContent(city, county);

        const { data, error } = await supabase
          .from('locations')
          .upsert({
            name: city.name,
            slug: citySlug,
            type: city.type,
            parent_county_id: countyData.id,
            county_slug: countySlug,
            population: city.population,
            seo_title: seoContent.seo_title,
            seo_description: seoContent.meta_description,
            seo_keywords: seoContent.seo_keywords,
            meta_description: seoContent.meta_description,
            h1_title: seoContent.h1_title,
            intro_text: seoContent.intro_text,
            main_content: seoContent.main_content,
            faq_content: seoContent.faq_content,
            local_specialties: ['Community Service', 'Fresh Daily', 'Expert Advice'],
            nearby_locations: []
          }, {
            onConflict: 'parent_county_id,slug'
          });

        if (error) {
          console.error(`Error inserting ${city.type} ${city.name}:`, error);
        } else {
          console.log(`✓ Inserted ${city.type}: ${city.name} in ${county.name}`);
        }
      }
    }

    console.log('✅ Hierarchical location population complete!');

    // Get a count of inserted locations
    const { data: countData, error: countError } = await supabase
      .from('locations')
      .select('type', { count: 'exact' });

    if (!countError) {
      const countsByType = countData.reduce((acc, row) => {
        acc[row.type] = (acc[row.type] || 0) + 1;
        return acc;
      }, {});

      console.log('Location counts:');
      console.log(`- Counties: ${countsByType.county || 0}`);
      console.log(`- Cities: ${countsByType.city || 0}`);
      console.log(`- Towns: ${countsByType.town || 0}`);
      console.log(`- Total: ${countData.length}`);
    }

  } catch (error) {
    console.error('Error populating hierarchical locations:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateHierarchicalLocations();
}

module.exports = { populateHierarchicalLocations };