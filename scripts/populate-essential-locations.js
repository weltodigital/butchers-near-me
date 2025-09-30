const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to create slug from name
function createSlug(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');
}

// Essential missing counties with their most important cities and towns
const essentialLocations = {
  'Greater Manchester': {
    cities: ['Manchester', 'Salford'],
    towns: ['Bolton', 'Bury', 'Oldham', 'Rochdale', 'Stockport', 'Wigan', 'Altrincham', 'Sale']
  },
  'West Midlands': {
    cities: ['Birmingham', 'Wolverhampton'],
    towns: ['Coventry', 'Dudley', 'Walsall', 'West Bromwich', 'Solihull', 'Sutton Coldfield']
  },
  'West Yorkshire': {
    cities: ['Leeds', 'Bradford', 'Wakefield'],
    towns: ['Huddersfield', 'Halifax', 'Keighley', 'Dewsbury', 'Batley', 'Morley', 'Pudsey']
  },
  'Merseyside': {
    cities: ['Liverpool'],
    towns: ['Birkenhead', 'Southport', 'St Helens', 'Bootle', 'Crosby', 'Formby']
  },
  'Tyne and Wear': {
    cities: ['Newcastle upon Tyne', 'Sunderland'],
    towns: ['Gateshead', 'South Shields', 'North Shields', 'Whitley Bay']
  },
  'South Yorkshire': {
    cities: ['Sheffield'],
    towns: ['Rotherham', 'Doncaster', 'Barnsley']
  },
  'Essex': {
    cities: ['Chelmsford', 'Southend-on-Sea'],
    towns: ['Colchester', 'Basildon', 'Harlow', 'Brentwood', 'Thurrock']
  },
  'Lancashire': {
    cities: ['Lancaster', 'Preston'],
    towns: ['Blackpool', 'Blackburn', 'Burnley', 'Accrington', 'Fleetwood']
  },
  'Hertfordshire': {
    cities: ['St Albans'],
    towns: ['Watford', 'Hemel Hempstead', 'Stevenage', 'Hatfield', 'Welwyn Garden City']
  },
  'Staffordshire': {
    cities: ['Stoke-on-Trent'],
    towns: ['Stafford', 'Burton upon Trent', 'Cannock', 'Lichfield', 'Tamworth']
  },
  'Leicestershire': {
    cities: ['Leicester'],
    towns: ['Loughborough', 'Hinckley', 'Coalville', 'Melton Mowbray', 'Market Harborough']
  },
  'Nottinghamshire': {
    cities: ['Nottingham'],
    towns: ['Mansfield', 'Newark-on-Trent', 'Worksop', 'Sutton-in-Ashfield']
  },
  'Warwickshire': {
    cities: ['Coventry'],
    towns: ['Warwick', 'Leamington Spa', 'Rugby', 'Nuneaton', 'Stratford-upon-Avon']
  },
  'North Yorkshire': {
    cities: ['York'],
    towns: ['Harrogate', 'Scarborough', 'Middlesbrough', 'Whitby', 'Ripon']
  },
  'Cambridgeshire': {
    cities: ['Cambridge', 'Peterborough'],
    towns: ['Ely', 'Huntingdon', 'Wisbech', 'St Neots']
  }
};

// Helper function to generate basic SEO content
function generateSEOContent(name, type, parentName = null) {
  const locationText = parentName ? `${name}, ${parentName}` : name;

  if (type === 'county') {
    return {
      seo_title: `Find Quality Butchers in ${name} | Find A Butchers`,
      meta_description: `Discover the best butcher shops in ${name}. Find local butchers, meat suppliers, and quality cuts across cities and towns in ${name}.`,
      h1_title: `Quality Butchers in ${name}`,
      intro_text: `Find the finest butcher shops and meat suppliers across ${name}. Our directory features trusted local butchers offering premium cuts, traditional methods, and exceptional service.`,
      main_content: `<h2>About Butchers in ${name}</h2><p>${name} is home to many excellent butcher shops, from traditional family-run businesses to modern artisan meat suppliers.</p>`,
      seo_keywords: [`butchers ${name}`, `meat suppliers ${name}`, `local butchers ${name}`],
      faq_content: {
        questions: [
          {
            question: `What types of butchers can I find in ${name}?`,
            answer: `${name} has a variety of butcher shops including traditional family butchers, artisan meat suppliers, and specialty dealers.`
          }
        ]
      }
    };
  } else {
    return {
      seo_title: `Best Butchers in ${locationText} | Find A Butchers`,
      meta_description: `Find top-rated butcher shops in ${locationText}. Quality meat suppliers, local butchers, and premium cuts in ${name}.`,
      h1_title: `Best Butchers in ${name}`,
      intro_text: `Discover exceptional butcher shops in ${name}. Our curated directory features the finest local butchers offering premium cuts and expert service.`,
      main_content: `<h2>Butchers in ${name}</h2><p>Whether you're looking for everyday cuts or specialty meats, ${name} offers excellent butcher shops to meet your needs.</p>`,
      seo_keywords: [`butchers ${name}`, `butchers ${locationText}`, `meat suppliers ${name}`],
      faq_content: {
        questions: [
          {
            question: `Where are the best butchers located in ${name}?`,
            answer: `The best butchers in ${name} are typically found in the town center, local markets, and established shopping areas.`
          }
        ]
      }
    };
  }
}

async function addEssentialLocations() {
  console.log('🚀 Adding essential missing counties and locations...\n');

  for (const [countyName, data] of Object.entries(essentialLocations)) {
    console.log(`📍 Processing ${countyName}...`);

    const countySlug = createSlug(countyName);

    // Check if county exists
    const { data: existingCounty } = await supabase
      .from('public_locations')
      .select('id')
      .eq('name', countyName)
      .eq('type', 'county')
      .single();

    if (!existingCounty) {
      // Add county
      const countyContent = generateSEOContent(countyName, 'county');

      const { data: newCounty, error: countyError } = await supabase
        .from('public_locations')
        .insert([{
          name: countyName,
          slug: countySlug,
          type: 'county',
          full_path: countySlug,
          county_slug: countySlug,
          butcher_count: 0,
          ...countyContent
        }])
        .select()
        .single();

      if (countyError) {
        console.error(`❌ Error adding county ${countyName}:`, countyError);
        continue;
      }

      console.log(`  ✅ Added county: ${countyName}`);
    } else {
      console.log(`  ⚪ County ${countyName} already exists`);
    }

    // Add cities
    for (const cityName of data.cities) {
      const citySlug = createSlug(cityName);
      const cityFullPath = `${countySlug}/${citySlug}`;

      const { data: existingCity } = await supabase
        .from('public_locations')
        .select('id')
        .eq('name', cityName)
        .eq('county_slug', countySlug)
        .eq('type', 'city')
        .single();

      if (!existingCity) {
        const cityContent = generateSEOContent(cityName, 'city', countyName);

        const { error: cityError } = await supabase
          .from('public_locations')
          .insert([{
            name: cityName,
            slug: citySlug,
            type: 'city',
            full_path: cityFullPath,
            county_slug: countySlug,
            butcher_count: 0,
            ...cityContent
          }]);

        if (!cityError) {
          console.log(`    ✅ Added city: ${cityName}`);
        }
      }
    }

    // Add towns
    for (const townName of data.towns) {
      const townSlug = createSlug(townName);
      const townFullPath = `${countySlug}/${townSlug}`;

      const { data: existingTown } = await supabase
        .from('public_locations')
        .select('id')
        .eq('name', townName)
        .eq('county_slug', countySlug)
        .eq('type', 'town')
        .single();

      if (!existingTown) {
        const townContent = generateSEOContent(townName, 'town', countyName);

        const { error: townError } = await supabase
          .from('public_locations')
          .insert([{
            name: townName,
            slug: townSlug,
            type: 'town',
            full_path: townFullPath,
            county_slug: countySlug,
            butcher_count: 0,
            ...townContent
          }]);

        if (!townError) {
          console.log(`    ✅ Added town: ${townName}`);
        }
      }
    }

    console.log(`  📊 Processed ${data.cities.length} cities and ${data.towns.length} towns\n`);
  }

  console.log('✨ Finished adding essential locations!');
}

async function main() {
  try {
    await addEssentialLocations();

    // Show final counts
    const { data: finalCounties } = await supabase
      .from('public_locations')
      .select('name')
      .eq('type', 'county');

    const { data: finalCitiesTowns } = await supabase
      .from('public_locations')
      .select('name, type')
      .in('type', ['city', 'town']);

    console.log(`\n📈 Current Results:`);
    console.log(`  Counties: ${finalCounties?.length || 0}`);
    console.log(`  Cities: ${finalCitiesTowns?.filter(l => l.type === 'city').length || 0}`);
    console.log(`  Towns: ${finalCitiesTowns?.filter(l => l.type === 'town').length || 0}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();