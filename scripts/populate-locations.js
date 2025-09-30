const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Debug environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');

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

// Helper function to generate SEO content
function generateSEOContent(location, type) {
  const butcherTypes = [
    'Traditional Butchers',
    'Artisan Butchers',
    'Quality Meat Suppliers',
    'Local Butchers',
    'Premium Butchers',
    'Family Butchers',
    'Specialist Butchers'
  ];

  const contentVariations = {
    city: {
      title: `Best Butchers in ${location.name} | Premium Quality Meat | MeatMap UK`,
      metaDescription: `Find the finest butchers in ${location.name}. Discover premium quality meat, traditional cuts, and artisan specialties from trusted local butchers. Reviews, locations & opening hours.`,
      h1: `Best Butchers in ${location.name}`,
      intro: `Discover ${location.name}'s finest butchers offering premium quality meat, traditional cuts, and artisan specialties. Our comprehensive directory features verified local butchers with customer reviews, detailed information, and convenient location details.`,
      mainContent: `
        <h2>Premium Quality Butchers in ${location.name}</h2>
        <p>${location.name} boasts an exceptional selection of traditional and modern butchers, each committed to providing the highest quality meat and outstanding customer service. From family-run establishments with decades of experience to innovative artisan butchers pushing culinary boundaries, ${location.name}'s meat suppliers cater to every taste and requirement.</p>

        <h3>Traditional Butchers</h3>
        <p>The traditional butchers of ${location.name} maintain time-honored techniques passed down through generations. These establishments pride themselves on expert knife skills, traditional aging methods, and personal customer relationships. You'll find classic cuts prepared to perfection, house-made sausages, and traditional specialties that reflect ${location.name}'s culinary heritage.</p>

        <h3>Artisan & Specialty Butchers</h3>
        <p>Modern artisan butchers in ${location.name} combine traditional craftsmanship with innovative techniques. These specialists often focus on sustainable sourcing, rare breeds, dry-aging, and unique preparations. Many offer cooking classes, custom cutting services, and expert advice on preparation and cooking techniques.</p>

        <h3>Local Sourcing & Sustainability</h3>
        <p>Many ${location.name} butchers prioritize local sourcing, working directly with nearby farms to ensure traceability and freshness. This commitment to local supply chains supports the regional economy while guaranteeing customers the freshest, highest-quality meat possible.</p>

        <h3>Services & Specialties</h3>
        <p>Butchers in ${location.name} offer a wide range of services including:</p>
        <ul>
          <li>Custom meat cutting and preparation</li>
          <li>Special occasion orders and catering</li>
          <li>Home delivery services</li>
          <li>Cooking advice and recipe suggestions</li>
          <li>Seasonal specialties and game meats</li>
          <li>Organic and free-range options</li>
        </ul>
      `
    },
    town: {
      title: `Local Butchers in ${location.name} | Quality Meat Suppliers | MeatMap UK`,
      metaDescription: `Discover trusted local butchers in ${location.name}. Quality meat, traditional service, and competitive prices. Find opening hours, reviews, and contact details for the best butchers near you.`,
      h1: `Local Butchers in ${location.name}`,
      intro: `Find quality local butchers in ${location.name} offering fresh meat, traditional cuts, and personalized service. Our directory connects you with trusted meat suppliers who understand the needs of the local community.`,
      mainContent: `
        <h2>Quality Meat Suppliers in ${location.name}</h2>
        <p>${location.name} may be a smaller community, but it's home to butchers who take immense pride in serving their neighbors with the finest quality meat. These local businesses form the backbone of the community, providing personalized service that larger retailers simply cannot match.</p>

        <h3>Community-Focused Service</h3>
        <p>Local butchers in ${location.name} know their customers by name and understand their preferences. This personal touch ensures you receive exactly what you need, whether it's a special cut for Sunday roast, advice on cooking techniques, or custom orders for special occasions.</p>

        <h3>Fresh, Quality Products</h3>
        <p>Supporting local butchers in ${location.name} means accessing the freshest meat available. Many maintain direct relationships with local farms, ensuring short supply chains and optimal freshness. You'll find seasonal specialties, locally-sourced products, and traditional preparations that reflect regional tastes.</p>

        <h3>Competitive Value</h3>
        <p>Despite their smaller scale, local butchers in ${location.name} often provide excellent value through competitive pricing, bulk purchase discounts, and loyalty programs. The quality-to-price ratio frequently exceeds that of larger retailers, especially when considering the superior freshness and personalized service.</p>
      `
    },
    county: {
      title: `${location.name} Butchers Directory | Premium Meat Suppliers Across ${location.name}`,
      metaDescription: `Complete directory of butchers across ${location.name}. Find local meat suppliers, traditional butchers, and artisan specialists throughout the county. Reviews, locations, and contact details.`,
      h1: `Butchers Across ${location.name}`,
      intro: `Explore the rich tradition of butchery across ${location.name}. From market towns to rural villages, discover quality meat suppliers who maintain the highest standards of craftsmanship and customer service throughout the county.`,
      mainContent: `
        <h2>The Butchers of ${location.name}</h2>
        <p>${location.name} has a proud tradition of quality butchery, with establishments ranging from historic family businesses to modern artisan shops. The county's diverse geography and agricultural heritage have shaped a unique landscape of meat suppliers, each contributing to the region's culinary identity.</p>

        <h3>Regional Specialties</h3>
        <p>Butchers throughout ${location.name} often specialize in products that reflect the county's agricultural strengths and culinary traditions. Whether it's locally-reared livestock, traditional preservation methods, or regional recipes passed down through generations, ${location.name}'s butchers maintain important cultural connections to the land and its produce.</p>

        <h3>Market Town Traditions</h3>
        <p>The market towns of ${location.name} serve as vital centers for the county's butchery trade. These locations often host weekly markets where local butchers showcase their finest products, maintaining traditions that stretch back centuries while adapting to modern consumer needs.</p>

        <h3>Rural Excellence</h3>
        <p>Village butchers across ${location.name} provide essential services to rural communities while often maintaining the closest relationships with local farmers. These establishments frequently offer the most direct farm-to-table experience, with meat that travels minimal distances from pasture to plate.</p>
      `
    },
    region: {
      title: `${location.name} Butchers | Regional Meat Suppliers Directory | MeatMap UK`,
      metaDescription: `Discover exceptional butchers across ${location.name}. Regional directory of traditional and artisan meat suppliers, featuring local specialties, quality products, and expert craftsmanship.`,
      h1: `Butchers of ${location.name}`,
      intro: `${location.name} represents one of the UK's most diverse regions for quality butchery. Discover the exceptional meat suppliers who maintain regional traditions while embracing innovation across this varied landscape.`,
      mainContent: `
        <h2>Regional Excellence in ${location.name}</h2>
        <p>${location.name} encompasses a remarkable diversity of landscapes, communities, and culinary traditions, all reflected in its exceptional butchers. From urban artisan specialists to rural farm shops, the region's meat suppliers represent the very best of British butchery.</p>

        <h3>Cultural Heritage</h3>
        <p>The butchers of ${location.name} maintain strong connections to regional food culture, preserving traditional methods and recipes while adapting to contemporary tastes. This balance between heritage and innovation makes the region a fascinating destination for meat enthusiasts.</p>

        <h3>Agricultural Connections</h3>
        <p>With its diverse agricultural landscape, ${location.name} supports a complex network of relationships between farmers and butchers. This close collaboration ensures optimal quality while supporting sustainable farming practices and maintaining the region's agricultural economy.</p>

        <h3>Urban and Rural Diversity</h3>
        <p>The contrast between urban and rural areas in ${location.name} creates a unique butchery landscape. City-based artisan butchers push creative boundaries while rural establishments maintain traditional methods, creating a rich tapestry of options for consumers throughout the region.</p>
      `
    }
  };

  const selectedContent = contentVariations[type] || contentVariations.city;

  return {
    seo_title: selectedContent.title,
    meta_description: selectedContent.metaDescription,
    h1_title: selectedContent.h1,
    intro_text: selectedContent.intro,
    main_content: selectedContent.mainContent,
    seo_keywords: location.seo_keywords || [],
    faq_content: {
      questions: [
        {
          question: `What types of butchers can I find in ${location.name}?`,
          answer: `${location.name} offers a variety of butchers including traditional family-run shops, modern artisan specialists, organic meat suppliers, and specialty butchers focusing on particular cuts or preparation methods.`
        },
        {
          question: `Do butchers in ${location.name} offer delivery services?`,
          answer: `Many butchers in ${location.name} now offer delivery services, especially following increased demand. Contact individual butchers to inquire about their delivery areas and minimum order requirements.`
        },
        {
          question: `Can I order custom cuts from ${location.name} butchers?`,
          answer: `Most professional butchers in ${location.name} offer custom cutting services. It's best to call ahead or visit in person to discuss your specific requirements and allow time for preparation.`
        },
        {
          question: `Are there organic and free-range options available in ${location.name}?`,
          answer: `Yes, many butchers in ${location.name} stock organic, free-range, and grass-fed options. Some specialize exclusively in these premium products, while others offer them alongside conventional selections.`
        }
      ]
    }
  };
}

async function populateLocations() {
  try {
    console.log('Loading location data...');

    // Load the UK locations data
    const locationsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/uk-locations.json'), 'utf8')
    );

    console.log('Populating major cities...');

    // Insert major cities
    for (const city of locationsData.major_cities) {
      const slug = createSlug(city.name);
      const seoContent = generateSEOContent(city, 'city');

      const { data, error } = await supabase
        .from('locations')
        .upsert({
          name: city.name,
          slug: slug,
          type: 'city',
          county: city.county,
          region: city.region,
          population: city.population,
          latitude: city.lat,
          longitude: city.lng,
          postcode_areas: city.postcode_areas,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Traditional Cuts', 'Artisan Sausages', 'Premium Steaks'],
          nearby_locations: []
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`Error inserting city ${city.name}:`, error);
      } else {
        console.log(`✓ Inserted city: ${city.name}`);
      }
    }

    console.log('Populating major towns...');

    // Insert major towns
    for (const town of locationsData.major_towns) {
      const slug = createSlug(town.name);
      const seoContent = generateSEOContent(town, 'town');

      const { data, error } = await supabase
        .from('locations')
        .upsert({
          name: town.name,
          slug: slug,
          type: 'town',
          county: town.county,
          region: town.region,
          population: town.population,
          latitude: town.lat,
          longitude: town.lng,
          postcode_areas: town.postcode_areas,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Local Produce', 'Community Service', 'Fresh Daily'],
          nearby_locations: []
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`Error inserting town ${town.name}:`, error);
      } else {
        console.log(`✓ Inserted town: ${town.name}`);
      }
    }

    console.log('Populating counties...');

    // Insert counties
    for (const county of locationsData.counties) {
      const slug = createSlug(county.name);
      const seoContent = generateSEOContent(county, 'county');

      const { data, error } = await supabase
        .from('locations')
        .upsert({
          name: county.name,
          slug: slug,
          type: 'county',
          county: county.name,
          region: county.region,
          population: county.population,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Regional Specialties', 'County Traditions', 'Local Sourcing'],
          nearby_locations: county.major_towns || []
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`Error inserting county ${county.name}:`, error);
      } else {
        console.log(`✓ Inserted county: ${county.name}`);
      }
    }

    console.log('Populating regions...');

    // Insert regions
    for (const region of locationsData.regions) {
      const slug = createSlug(region.name);
      const seoContent = generateSEOContent(region, 'region');

      const { data, error } = await supabase
        .from('locations')
        .upsert({
          name: region.name,
          slug: slug,
          type: 'region',
          region: region.name,
          population: region.population,
          seo_title: seoContent.seo_title,
          seo_description: seoContent.meta_description,
          seo_keywords: seoContent.seo_keywords,
          meta_description: seoContent.meta_description,
          h1_title: seoContent.h1_title,
          intro_text: seoContent.intro_text,
          main_content: seoContent.main_content,
          faq_content: seoContent.faq_content,
          local_specialties: ['Regional Excellence', 'Cultural Heritage', 'Traditional Methods'],
          nearby_locations: []
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`Error inserting region ${region.name}:`, error);
      } else {
        console.log(`✓ Inserted region: ${region.name}`);
      }
    }

    console.log('✅ Location population complete!');

    // Get a count of inserted locations
    const { data: countData, error: countError } = await supabase
      .from('locations')
      .select('type', { count: 'exact' });

    if (!countError) {
      console.log(`Total locations in database: ${countData.length}`);
    }

  } catch (error) {
    console.error('Error populating locations:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateLocations();
}

module.exports = { populateLocations, generateSEOContent, createSlug };