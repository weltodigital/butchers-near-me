const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createSlug(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '');
}

// Remaining important counties
const remainingLocations = {
  'Norfolk': {
    cities: ['Norwich'],
    towns: ['Great Yarmouth', 'King\'s Lynn', 'Thetford', 'Cromer']
  },
  'Suffolk': {
    cities: [],
    towns: ['Ipswich', 'Bury St Edmunds', 'Lowestoft', 'Felixstowe']
  },
  'Lincolnshire': {
    cities: ['Lincoln'],
    towns: ['Boston', 'Grantham', 'Skegness', 'Spalding']
  },
  'Derbyshire': {
    cities: ['Derby'],
    towns: ['Chesterfield', 'Glossop', 'Buxton', 'Matlock']
  },
  'Cheshire': {
    cities: ['Chester'],
    towns: ['Warrington', 'Crewe', 'Macclesfield', 'Runcorn']
  },
  'Cumbria': {
    cities: ['Carlisle'],
    towns: ['Barrow-in-Furness', 'Kendal', 'Workington', 'Whitehaven']
  },
  'Northumberland': {
    cities: [],
    towns: ['Berwick-upon-Tweed', 'Hexham', 'Cramlington', 'Blyth']
  },
  'Durham': {
    cities: ['Durham'],
    towns: ['Darlington', 'Hartlepool', 'Bishop Auckland']
  },
  'Shropshire': {
    cities: [],
    towns: ['Shrewsbury', 'Telford', 'Oswestry', 'Bridgnorth']
  },
  'Herefordshire': {
    cities: ['Hereford'],
    towns: ['Leominster', 'Ross-on-Wye', 'Ledbury']
  },
  'Worcestershire': {
    cities: ['Worcester'],
    towns: ['Kidderminster', 'Redditch', 'Bromsgrove', 'Evesham']
  },
  'Bedfordshire': {
    cities: ['Bedford', 'Luton'],
    towns: ['Dunstable', 'Leighton Buzzard', 'Biggleswade']
  },
  'Northamptonshire': {
    cities: ['Peterborough'],
    towns: ['Northampton', 'Kettering', 'Corby', 'Wellingborough']
  },
  'Rutland': {
    cities: [],
    towns: ['Oakham', 'Uppingham']
  },
  'East Sussex': {
    cities: ['Brighton and Hove'],
    towns: ['Hastings', 'Eastbourne', 'Bexhill-on-Sea', 'Lewes']
  },
  'West Sussex': {
    cities: ['Chichester'],
    towns: ['Crawley', 'Worthing', 'Horsham', 'East Grinstead']
  },
  'Isle of Wight': {
    cities: [],
    towns: ['Newport', 'Ryde', 'Cowes', 'Sandown']
  },
  'East Riding of Yorkshire': {
    cities: [],
    towns: ['Bridlington', 'Goole', 'Driffield', 'Beverley']
  },
  'Bristol': {
    cities: ['Bristol'],
    towns: []
  }
};

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

async function addRemainingLocations() {
  console.log('🚀 Adding remaining important counties and locations...\n');

  for (const [countyName, data] of Object.entries(remainingLocations)) {
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
      const countyContent = generateSEOContent(countyName, 'county');

      const { error: countyError } = await supabase
        .from('public_locations')
        .insert([{
          name: countyName,
          slug: countySlug,
          type: 'county',
          full_path: countySlug,
          county_slug: countySlug,
          butcher_count: 0,
          ...countyContent
        }]);

      if (!countyError) {
        console.log(`  ✅ Added county: ${countyName}`);
      }
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

  console.log('✨ Finished adding remaining locations!');
}

async function main() {
  try {
    await addRemainingLocations();

    // Show final counts
    const { data: finalCounties } = await supabase
      .from('public_locations')
      .select('name')
      .eq('type', 'county');

    const { data: finalCitiesTowns } = await supabase
      .from('public_locations')
      .select('name, type')
      .in('type', ['city', 'town']);

    console.log(`\n📈 Final Results:`);
    console.log(`  Counties: ${finalCounties?.length || 0}`);
    console.log(`  Cities: ${finalCitiesTowns?.filter(l => l.type === 'city').length || 0}`);
    console.log(`  Towns: ${finalCitiesTowns?.filter(l => l.type === 'town').length || 0}`);
    console.log(`  Total locations: ${(finalCounties?.length || 0) + (finalCitiesTowns?.length || 0)}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();