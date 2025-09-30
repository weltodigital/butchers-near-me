const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Location-specific characteristics and features
const locationData = {
  // Metropolitan areas
  'Greater Manchester': {
    characteristics: 'industrial heritage, vibrant food scene, Victorian markets',
    specialties: 'black pudding, Manchester tart, traditional Lancashire hotpot',
    keywords: ['manchester butchers', 'greater manchester meat suppliers', 'salford butchers'],
    description: 'Greater Manchester\'s butchers combine industrial heritage with modern culinary innovation, offering everything from traditional Lancashire specialties to contemporary artisan cuts.'
  },
  'West Midlands': {
    characteristics: 'automotive heritage, diverse communities, traditional markets',
    specialties: 'faggots and peas, pork scratchings, Birmingham balti meats',
    keywords: ['birmingham butchers', 'west midlands meat suppliers', 'wolverhampton butchers'],
    description: 'The West Midlands boasts a rich tradition of butchery, serving diverse communities with quality meats from traditional British cuts to international specialties.'
  },
  'West Yorkshire': {
    characteristics: 'textile heritage, Yorkshire traditions, hill farming',
    specialties: 'Yorkshire pudding beef, lamb from the Pennines, traditional pork pies',
    keywords: ['leeds butchers', 'yorkshire butchers', 'bradford meat suppliers'],
    description: 'West Yorkshire\'s butchers are renowned for their Yorkshire traditions, offering premium meats from local Pennine farms and traditional Yorkshire specialties.'
  },
  'Merseyside': {
    characteristics: 'maritime heritage, cosmopolitan culture, traditional markets',
    specialties: 'scouse lamb, Merseyside sausages, fresh seafood',
    keywords: ['liverpool butchers', 'merseyside meat suppliers', 'wirral butchers'],
    description: 'Merseyside\'s butchers reflect the area\'s maritime heritage, offering quality meats with influences from the region\'s diverse cultural history.'
  },
  'Tyne and Wear': {
    characteristics: 'industrial heritage, Geordie traditions, coastal location',
    specialties: 'Northumberland lamb, Newcastle Brown ale sausages, traditional stottie fillings',
    keywords: ['newcastle butchers', 'sunderland meat suppliers', 'tyne and wear butchers'],
    description: 'Tyne and Wear\'s butchers maintain strong Geordie traditions, specializing in high-quality Northumberland meats and regional delicacies.'
  },
  'South Yorkshire': {
    characteristics: 'steel heritage, traditional markets, hill country',
    specialties: 'Sheffield steel-cut meats, traditional Yorkshire fare, Pennine lamb',
    keywords: ['sheffield butchers', 'south yorkshire meat suppliers', 'rotherham butchers'],
    description: 'South Yorkshire combines steel city heritage with traditional butchery, offering precision-cut meats and authentic Yorkshire specialties.'
  },

  // Eastern counties
  'Essex': {
    characteristics: 'rural traditions, market towns, coastal influences',
    specialties: 'Essex lamb, traditional sausages, fresh game',
    keywords: ['essex butchers', 'chelmsford meat suppliers', 'colchester butchers'],
    description: 'Essex butchers combine rural traditions with modern techniques, offering quality meats from local farms and traditional English specialties.'
  },
  'Norfolk': {
    characteristics: 'agricultural heritage, traditional farming, coastal location',
    specialties: 'Norfolk turkey, local game birds, traditional bacon',
    keywords: ['norfolk butchers', 'norwich meat suppliers', 'great yarmouth butchers'],
    description: 'Norfolk\'s butchers are steeped in agricultural tradition, renowned for their Norfolk turkey, game birds, and high-quality local produce.'
  },
  'Suffolk': {
    characteristics: 'farming heritage, market towns, traditional methods',
    specialties: 'Suffolk lamb, traditional pork, local game',
    keywords: ['suffolk butchers', 'ipswich meat suppliers', 'bury st edmunds butchers'],
    description: 'Suffolk butchers maintain centuries-old traditions, specializing in locally-reared Suffolk lamb and traditional English meat preparations.'
  },
  'Lincolnshire': {
    characteristics: 'agricultural county, traditional farming, market heritage',
    specialties: 'Lincolnshire sausages, local lamb, traditional bacon',
    keywords: ['lincolnshire butchers', 'lincoln meat suppliers', 'boston butchers'],
    description: 'Lincolnshire is famous for its traditional sausages and agricultural heritage, with butchers offering premium local meats and time-honored recipes.'
  },

  // Northern counties
  'Lancashire': {
    characteristics: 'industrial heritage, traditional recipes, hill farming',
    specialties: 'Lancashire hotpot lamb, black pudding, traditional sausages',
    keywords: ['lancashire butchers', 'preston meat suppliers', 'blackpool butchers'],
    description: 'Lancashire butchers are famous for their traditional recipes, especially Lancashire hotpot ingredients and authentic black pudding made to family recipes.'
  },
  'Cheshire': {
    characteristics: 'dairy farming, market towns, traditional methods',
    specialties: 'Cheshire beef, traditional pork, local lamb',
    keywords: ['cheshire butchers', 'chester meat suppliers', 'crewe butchers'],
    description: 'Cheshire\'s butchers benefit from the county\'s excellent dairy farming, offering premium beef and traditional cuts prepared with time-honored methods.'
  },
  'Cumbria': {
    characteristics: 'Lake District, hill farming, traditional methods',
    specialties: 'Herdwick lamb, Cumberland sausage, fell-bred beef',
    keywords: ['cumbria butchers', 'carlisle meat suppliers', 'kendal butchers'],
    description: 'Cumbria\'s butchers specialize in Lake District meats, including famous Herdwick lamb and Cumberland sausage made to traditional recipes.'
  },
  'Northumberland': {
    characteristics: 'rural county, traditional farming, border heritage',
    specialties: 'Northumberland lamb, local beef, traditional game',
    keywords: ['northumberland butchers', 'hexham meat suppliers', 'berwick butchers'],
    description: 'Northumberland butchers offer premium meats from this rural county, specializing in locally-reared lamb and beef from traditional farms.'
  },
  'Durham': {
    characteristics: 'mining heritage, traditional methods, rural farming',
    specialties: 'Durham beef, traditional sausages, local lamb',
    keywords: ['durham butchers', 'darlington meat suppliers', 'hartlepool butchers'],
    description: 'Durham\'s butchers combine mining heritage with rural traditions, offering quality meats and traditional preparations passed down through generations.'
  },

  // Midland counties
  'Derbyshire': {
    characteristics: 'Peak District, traditional farming, market heritage',
    specialties: 'Peak District lamb, Derbyshire beef, traditional game',
    keywords: ['derbyshire butchers', 'derby meat suppliers', 'chesterfield butchers'],
    description: 'Derbyshire butchers benefit from Peak District farming, offering premium lamb and beef from high moorland farms with exceptional flavor.'
  },
  'Staffordshire': {
    characteristics: 'traditional farming, market towns, pottery heritage',
    specialties: 'Staffordshire beef, traditional pork, local sausages',
    keywords: ['staffordshire butchers', 'stafford meat suppliers', 'stoke butchers'],
    description: 'Staffordshire\'s butchers maintain traditional methods, offering quality meats from local farms and time-honored sausage recipes.'
  },
  'Leicestershire': {
    characteristics: 'market towns, traditional farming, hunting heritage',
    specialties: 'Leicester sheep, traditional pork pie meat, local beef',
    keywords: ['leicestershire butchers', 'leicester meat suppliers', 'melton mowbray butchers'],
    description: 'Leicestershire butchers are famous for their role in traditional pork pie making, offering premium meats and Melton Mowbray specialties.'
  },
  'Nottinghamshire': {
    characteristics: 'market heritage, traditional farming, Sherwood Forest',
    specialties: 'Nottinghamshire beef, traditional pork, local game',
    keywords: ['nottinghamshire butchers', 'nottingham meat suppliers', 'mansfield butchers'],
    description: 'Nottinghamshire butchers combine market town traditions with quality local farming, offering excellent beef and traditional game meats.'
  },
  'Warwickshire': {
    characteristics: 'Shakespeare country, market towns, traditional farming',
    specialties: 'Warwickshire beef, traditional lamb, local pork',
    keywords: ['warwickshire butchers', 'warwick meat suppliers', 'stratford butchers'],
    description: 'Warwickshire\'s butchers serve Shakespeare country with premium meats from local farms and traditional English preparations.'
  },

  // South-west counties
  'Worcestershire': {
    characteristics: 'Vale of Evesham, traditional farming, market heritage',
    specialties: 'Worcestershire beef, local lamb, traditional sausages',
    keywords: ['worcestershire butchers', 'worcester meat suppliers', 'kidderminster butchers'],
    description: 'Worcestershire butchers benefit from the fertile Vale of Evesham, offering premium meats and traditional preparations with local character.'
  },
  'Herefordshire': {
    characteristics: 'border county, traditional farming, cider heritage',
    specialties: 'Hereford beef, local lamb, traditional preparations',
    keywords: ['herefordshire butchers', 'hereford meat suppliers', 'ross-on-wye butchers'],
    description: 'Herefordshire is famous for its Hereford cattle, with butchers offering some of England\'s finest beef alongside traditional border county specialties.'
  },
  'Shropshire': {
    characteristics: 'border heritage, hill farming, market towns',
    specialties: 'Shropshire lamb, local beef, traditional game',
    keywords: ['shropshire butchers', 'shrewsbury meat suppliers', 'telford butchers'],
    description: 'Shropshire butchers specialize in hill-farmed meats, offering exceptional lamb and beef from the county\'s traditional pastoral farming.'
  },

  // Southern counties
  'Bedfordshire': {
    characteristics: 'market towns, traditional farming, agricultural heritage',
    specialties: 'Bedfordshire beef, local pork, traditional sausages',
    keywords: ['bedfordshire butchers', 'bedford meat suppliers', 'luton butchers'],
    description: 'Bedfordshire\'s butchers maintain agricultural traditions, offering quality meats from local farms and traditional English preparations.'
  },
  'Hertfordshire': {
    characteristics: 'market towns, commuter belt, traditional methods',
    specialties: 'Hertfordshire beef, quality lamb, artisan sausages',
    keywords: ['hertfordshire butchers', 'watford meat suppliers', 'st albans butchers'],
    description: 'Hertfordshire butchers combine traditional methods with modern demands, serving discerning customers with premium meats and artisan preparations.'
  },
  'Cambridgeshire': {
    characteristics: 'fenland farming, university town, agricultural heritage',
    specialties: 'Fenland beef, local lamb, traditional preparations',
    keywords: ['cambridgeshire butchers', 'cambridge meat suppliers', 'peterborough butchers'],
    description: 'Cambridgeshire butchers benefit from fertile fenland farming, offering quality meats with both traditional and innovative preparations.'
  },
  'Northamptonshire': {
    characteristics: 'market towns, traditional farming, county heritage',
    specialties: 'Northamptonshire beef, local lamb, traditional sausages',
    keywords: ['northamptonshire butchers', 'northampton meat suppliers', 'kettering butchers'],
    description: 'Northamptonshire\'s butchers maintain county traditions, offering quality meats from local farms with time-honored butchery methods.'
  },
  'Rutland': {
    characteristics: 'smallest county, traditional methods, quality focus',
    specialties: 'Rutland lamb, premium beef, artisan preparations',
    keywords: ['rutland butchers', 'oakham meat suppliers', 'uppingham butchers'],
    description: 'England\'s smallest county hosts butchers focused on quality over quantity, offering premium meats with personal service and attention to detail.'
  },

  // Sussex counties
  'East Sussex': {
    characteristics: 'South Downs, coastal location, traditional methods',
    specialties: 'South Downs lamb, local beef, coastal specialties',
    keywords: ['east sussex butchers', 'brighton meat suppliers', 'hastings butchers'],
    description: 'East Sussex butchers benefit from South Downs farming, offering exceptional lamb and beef with the quality that comes from coastal grazing.'
  },
  'West Sussex': {
    characteristics: 'South Downs, market towns, traditional farming',
    specialties: 'Sussex beef, South Downs lamb, traditional game',
    keywords: ['west sussex butchers', 'chichester meat suppliers', 'crawley butchers'],
    description: 'West Sussex butchers specialize in South Downs meats, offering premium lamb and beef from the county\'s traditional downland farming.'
  },
  'Isle of Wight': {
    characteristics: 'island location, traditional methods, local specialties',
    specialties: 'Island lamb, local beef, traditional preparations',
    keywords: ['isle of wight butchers', 'newport meat suppliers', 'ryde butchers'],
    description: 'The Isle of Wight\'s butchers offer unique island-reared meats, with lamb and beef that benefit from the island\'s clean air and traditional farming methods.'
  },
  'East Riding of Yorkshire': {
    characteristics: 'Yorkshire Wolds, traditional farming, market heritage',
    specialties: 'Wolds lamb, Yorkshire beef, traditional preparations',
    keywords: ['east riding butchers', 'beverley meat suppliers', 'bridlington butchers'],
    description: 'East Riding butchers maintain Yorkshire traditions, offering quality meats from the Yorkshire Wolds with authentic Yorkshire preparation methods.'
  },
  'Bristol': {
    characteristics: 'maritime heritage, diverse communities, food innovation',
    specialties: 'West Country beef, local lamb, artisan preparations',
    keywords: ['bristol butchers', 'bristol meat suppliers', 'clifton butchers'],
    description: 'Bristol\'s butchers combine maritime heritage with modern food innovation, offering quality West Country meats alongside contemporary preparations.'
  },
  'North Yorkshire': {
    characteristics: 'Yorkshire Dales, moors, traditional farming',
    specialties: 'Dales lamb, Yorkshire beef, traditional game',
    keywords: ['north yorkshire butchers', 'york meat suppliers', 'harrogate butchers'],
    description: 'North Yorkshire butchers benefit from Dales and moors farming, offering some of England\'s finest lamb and beef with traditional Yorkshire character.'
  }
};

// Comprehensive SEO content generator
function generateAdvancedSEOContent(name, type, countyName = null) {
  const isCounty = type === 'county';
  const locationText = countyName ? `${name}, ${countyName}` : name;
  const countyData = isCounty ? locationData[name] : locationData[countyName];

  // Generate title variations
  const titleVariations = {
    county: [
      `Best Butchers in ${name} | Premium Local Meat Suppliers`,
      `Find Quality Butchers in ${name} | Traditional Meat Specialists`,
      `${name} Butchers Directory | Local Meat Suppliers & Specialists`,
      `Top Butchers in ${name} | Fresh Local Meat & Traditional Cuts`
    ],
    city: [
      `Best Butchers in ${name} | Quality Meat Suppliers ${countyName}`,
      `Find Top Butchers in ${locationText} | Premium Local Meat`,
      `${name} Butchers Directory | Fresh Meat & Traditional Cuts`,
      `Quality Butchers in ${name} | Local Meat Specialists ${countyName}`
    ],
    town: [
      `Best Butchers in ${name} | Local Meat Suppliers ${countyName}`,
      `Find Quality Butchers in ${locationText} | Fresh Local Meat`,
      `${name} Butcher Shops | Traditional Meat & Local Specialists`,
      `Top Butchers in ${name} | Premium Meat Suppliers ${countyName}`
    ]
  };

  // Generate meta descriptions
  const metaDescriptions = {
    county: [
      `Discover the finest butchers across ${name}. Find local meat specialists, traditional butchers, and premium suppliers offering quality cuts, ${countyData?.specialties || 'traditional specialties'} and expert service throughout the county.`,
      `Find top-rated butchers in ${name} with our comprehensive directory. Quality local meat suppliers, traditional cuts, and ${countyData?.characteristics || 'regional specialties'} from trusted family butchers across the county.`,
      `Browse the best butcher shops in ${name}. Premium local meat, traditional methods, and ${countyData?.specialties || 'quality cuts'} from experienced butchers serving communities throughout the county.`
    ],
    city: [
      `Find the best butchers in ${name}, ${countyName}. Quality local meat suppliers, fresh cuts, traditional methods and ${countyData?.specialties || 'regional specialties'} from trusted city centre and neighbourhood butchers.`,
      `Discover top-rated butcher shops in ${locationText}. Premium local meat, expert service, and ${countyData?.characteristics || 'traditional preparations'} from the finest butchers serving the local community.`,
      `Browse quality butchers in ${name} offering fresh local meat, traditional cuts, and ${countyData?.specialties || 'specialty preparations'} with expert advice and personal service.`
    ],
    town: [
      `Find quality butchers in ${name}, ${countyName}. Local meat specialists offering fresh cuts, traditional methods and ${countyData?.specialties || 'regional favorites'} with personal service and expert knowledge.`,
      `Discover the best butcher shops in ${locationText}. Premium local meat, traditional preparations, and ${countyData?.characteristics || 'quality service'} from experienced local butchers.`,
      `Browse top butchers in ${name} for fresh local meat, quality cuts, and ${countyData?.specialties || 'traditional specialties'} with friendly service and local expertise.`
    ]
  };

  // Generate H1 titles
  const h1Titles = {
    county: [
      `Quality Butchers Across ${name}`,
      `Find the Best Butchers in ${name}`,
      `${name} Butchers Directory`,
      `Premium Meat Suppliers in ${name}`
    ],
    city: [
      `Best Butchers in ${name}`,
      `${name} Meat Specialists & Butchers`,
      `Find Quality Butchers in ${name}`,
      `${name} Butcher Shops Directory`
    ],
    town: [
      `${name} Butchers & Meat Suppliers`,
      `Find Quality Butchers in ${name}`,
      `Best Butcher Shops in ${name}`,
      `${name} Local Meat Specialists`
    ]
  };

  // Generate intro text
  function generateIntro() {
    if (isCounty) {
      return `Discover exceptional butcher shops across ${name}, where ${countyData?.characteristics || 'traditional methods meet quality service'}. Our comprehensive directory features the finest local butchers specializing in ${countyData?.specialties || 'premium cuts, traditional preparations, and fresh local meat'}. From family-run establishments with generations of expertise to modern artisan suppliers, ${name}'s butchers maintain the highest standards of quality and service.`;
    } else {
      const areaDesc = type === 'city' ? 'vibrant city' : 'charming town';
      return `Find the finest butcher shops in ${name}, a ${areaDesc} in ${countyName} known for its ${countyData?.characteristics || 'quality local food scene'}. Our directory showcases local butchers who specialize in ${countyData?.specialties || 'fresh local meat, traditional cuts, and expert preparation'}. Whether you're looking for everyday essentials or special occasion cuts, ${name}'s butchers combine traditional craftsmanship with modern service standards.`;
    }
  }

  // Generate comprehensive main content
  function generateMainContent() {
    const contentSections = [];

    if (isCounty) {
      contentSections.push(`
        <h2>About Butchers in ${name}</h2>
        <p>${name} is renowned for its ${countyData?.characteristics || 'diverse range of quality butcher shops'}, each offering unique specialties and maintaining the highest standards of meat preparation. The county's butchers are particularly famous for ${countyData?.specialties || 'their traditional methods and fresh local produce'}, sourced from trusted local farms and suppliers.</p>

        <p>From bustling market towns to quiet rural villages, ${name}'s butchers serve their communities with dedication, offering everything from everyday cuts to specialty items for special occasions. Many shops have been family-run for generations, passing down traditional techniques and recipes that define the region's culinary heritage.</p>

        <h3>What Makes ${name} Butchers Special</h3>
        <ul>
          <li><strong>Local Sourcing:</strong> Direct relationships with ${name} farms and suppliers ensure freshness and traceability</li>
          <li><strong>Traditional Methods:</strong> Time-honored techniques including dry-aging, house-made sausages, and traditional curing</li>
          <li><strong>Specialty Products:</strong> Regional favorites including ${countyData?.specialties || 'local specialties and traditional preparations'}</li>
          <li><strong>Expert Knowledge:</strong> Professional advice on cuts, cooking methods, and preparation techniques</li>
          <li><strong>Community Focus:</strong> Strong ties to local communities with personalized service and custom orders</li>
        </ul>

        <h3>Popular Meat Types and Cuts in ${name}</h3>
        <p>Butchers throughout ${name} offer an extensive range of high-quality meats, with particular expertise in ${countyData?.specialties || 'traditional British cuts and preparations'}. Popular offerings include:</p>

        <ul>
          <li><strong>Premium Beef:</strong> From traditional roasting joints to specialty steaks, sourced from local and regional suppliers</li>
          <li><strong>Fresh Lamb:</strong> Including local varieties and seasonal specialties, perfect for traditional and contemporary cooking</li>
          <li><strong>Quality Pork:</strong> Traditional cuts, bacon, and house-made sausages using family recipes</li>
          <li><strong>Poultry:</strong> Fresh chicken, duck, and seasonal birds including local free-range options</li>
          <li><strong>Game Meats:</strong> Seasonal offerings including venison, rabbit, and game birds when available</li>
        </ul>

        <h3>Services Offered by ${name} Butchers</h3>
        <p>Modern butchers in ${name} offer comprehensive services beyond just selling meat:</p>

        <ul>
          <li>Custom cutting and preparation to your specifications</li>
          <li>Special occasion catering and large order fulfillment</li>
          <li>Cooking advice and recipe recommendations</li>
          <li>Seasonal specialties and holiday preparations</li>
          <li>Home delivery services (where available)</li>
          <li>Corporate and restaurant supply services</li>
        </ul>`);

    } else {
      contentSections.push(`
        <h2>Butchers in ${name}</h2>
        <p>${name} offers excellent butcher shops that reflect both ${countyName}'s ${countyData?.characteristics || 'traditional heritage'} and modern culinary standards. Local butchers specialize in ${countyData?.specialties || 'quality fresh meat, traditional cuts, and expert preparation'}, serving both residents and visitors with exceptional products and service.</p>

        <p>Whether you're a local resident looking for weekly essentials or a visitor wanting to experience regional specialties, ${name}'s butchers provide expert knowledge, quality products, and the personal service that makes shopping for meat a pleasure rather than a chore.</p>

        <h3>Why Choose Local Butchers in ${name}</h3>
        <ul>
          <li><strong>Fresh Quality:</strong> Daily deliveries and careful handling ensure peak freshness</li>
          <li><strong>Local Knowledge:</strong> Understanding of regional preferences and traditional preparations</li>
          <li><strong>Personal Service:</strong> Individual attention and custom cutting to your requirements</li>
          <li><strong>Community Connection:</strong> Support for local businesses and the ${name} community</li>
          <li><strong>Expert Advice:</strong> Professional guidance on cooking methods and meat selection</li>
        </ul>

        <h3>Butcher Services in ${name}</h3>
        <p>Local butchers in ${name} typically offer:</p>
        <ul>
          <li>Fresh daily cuts of beef, lamb, pork, and poultry</li>
          <li>House-made sausages using traditional ${countyName} recipes</li>
          <li>Custom preparation and special cutting services</li>
          <li>Seasonal specialties and holiday orders</li>
          <li>Cooking advice and preparation tips</li>
          <li>Catering services for local events and celebrations</li>
        </ul>

        <h3>Finding the Right Butcher in ${name}</h3>
        <p>When choosing a butcher in ${name}, look for shops that demonstrate:</p>
        <ul>
          <li>Clean, well-organized premises with proper refrigeration</li>
          <li>Knowledgeable staff who can answer questions about their products</li>
          <li>Clear labeling showing meat sources and preparation dates</li>
          <li>Good local reputation and customer recommendations</li>
          <li>Willingness to provide custom cuts and special services</li>
        </ul>`);
    }

    return contentSections.join('\n');
  }

  // Generate comprehensive FAQ content
  function generateFAQContent() {
    const baseQuestions = [];

    if (isCounty) {
      baseQuestions.push(
        {
          question: `What types of butchers can I find in ${name}?`,
          answer: `${name} offers a diverse range of butcher shops including traditional family butchers with generations of experience, modern artisan meat suppliers, farm shops selling their own produce, specialty game dealers, and halal/kosher butchers. Many specialize in ${countyData?.specialties || 'regional specialties'} and maintain strong connections with local farms and suppliers.`
        },
        {
          question: `What makes ${name} butchers unique?`,
          answer: `Butchers in ${name} are known for their ${countyData?.characteristics || 'commitment to quality and traditional methods'}. Many offer ${countyData?.specialties || 'regional specialties'} and maintain direct relationships with local farms. The county's butchers often combine traditional techniques with modern food safety standards, providing both authentic flavors and contemporary convenience.`
        },
        {
          question: `How do I find the best butcher in ${name}?`,
          answer: `Look for butchers with strong local reputations, clean and well-organized shops, knowledgeable staff, and clear product labeling. The best butchers in ${name} often have long-standing relationships with customers, offer custom cutting services, and can provide cooking advice. Reading reviews and asking for local recommendations is also very helpful.`
        },
        {
          question: `Do butchers in ${name} offer delivery services?`,
          answer: `Many butchers in ${name} have expanded their services to include delivery, especially since 2020. Options vary by location but may include local delivery routes, online ordering systems, and even subscription boxes for regular customers. It's best to contact individual butchers directly to inquire about their specific delivery options and coverage areas.`
        },
        {
          question: `What seasonal specialties do ${name} butchers offer?`,
          answer: `Seasonal offerings in ${name} typically include spring lamb, summer barbecue packages, autumn game meats, and winter holiday specialties. Many butchers also offer ${countyData?.specialties || 'traditional preparations'} during relevant seasons. Christmas and Easter periods often feature special orders for turkey, ham, and traditional festive meats with advance ordering recommended.`
        }
      );
    } else {
      baseQuestions.push(
        {
          question: `Where are the best butchers located in ${name}?`,
          answer: `The finest butchers in ${name} are typically found in the town center, established shopping areas, and local markets. Many of the best shops are family businesses that have served the ${name} community for generations, often located on traditional high streets or in purpose-built market areas where they can offer the best selection and service.`
        },
        {
          question: `What makes ${name} butchers special?`,
          answer: `Butchers in ${name} are known for their commitment to quality and connection to ${countyName}'s ${countyData?.characteristics || 'culinary traditions'}. They often specialize in ${countyData?.specialties || 'local and regional specialties'}, provide personalized service, and maintain the traditional butchery skills that ensure optimal flavor and preparation of their meats.`
        },
        {
          question: `Do butchers in ${name} cater for special dietary requirements?`,
          answer: `Many butchers in ${name} can accommodate special dietary needs including organic, grass-fed, free-range, and locally-sourced options. Some may also offer halal or kosher meats, or be able to source them through their supply network. It's recommended to call ahead to discuss specific requirements and availability.`
        },
        {
          question: `What services do ${name} butchers typically offer?`,
          answer: `Butchers in ${name} typically provide fresh meat cutting, custom preparation, special orders, seasonal specialties, cooking advice, and often catering services for local events. Many also offer traditional preparations like house-made sausages, cured meats, and ${countyData?.specialties || 'regional specialties'} that reflect local tastes and traditions.`
        },
        {
          question: `How can I find opening hours for butchers in ${name}?`,
          answer: `Opening hours vary by shop, but most butchers in ${name} operate Tuesday through Saturday, with many closed on Sundays and Mondays. Some may have extended hours on Fridays and Saturdays. Check our directory for specific times, call the shops directly, or look for posted hours as they may change seasonally or for holidays.`
        }
      );
    }

    return { questions: baseQuestions };
  }

  // Generate comprehensive keywords
  function generateKeywords() {
    const baseKeywords = isCounty ? [
      `butchers ${name.toLowerCase()}`,
      `meat suppliers ${name.toLowerCase()}`,
      `local butchers ${name.toLowerCase()}`,
      `butcher shops ${name.toLowerCase()}`,
      `quality meat ${name.toLowerCase()}`,
      `fresh meat ${name.toLowerCase()}`,
      `traditional butchers ${name.toLowerCase()}`
    ] : [
      `butchers ${name.toLowerCase()}`,
      `butchers ${locationText.toLowerCase()}`,
      `meat suppliers ${name.toLowerCase()}`,
      `local butchers ${name.toLowerCase()}`,
      `butcher shops ${name.toLowerCase()}`,
      `${name.toLowerCase()} meat suppliers`,
      `quality meat ${name.toLowerCase()}`
    ];

    // Add county-specific keywords
    if (countyData?.keywords) {
      baseKeywords.push(...countyData.keywords);
    }

    return baseKeywords;
  }

  // Select random variations for uniqueness
  const titleOptions = titleVariations[type];
  const descOptions = metaDescriptions[type];
  const h1Options = h1Titles[type];

  const selectedTitle = titleOptions[Math.floor(Math.random() * titleOptions.length)];
  const selectedDesc = descOptions[Math.floor(Math.random() * descOptions.length)];
  const selectedH1 = h1Options[Math.floor(Math.random() * h1Options.length)];

  return {
    seo_title: selectedTitle,
    seo_description: selectedDesc.substring(0, 155), // Ensure meta description length
    meta_description: selectedDesc.substring(0, 155),
    h1_title: selectedH1,
    intro_text: generateIntro(),
    main_content: generateMainContent(),
    seo_keywords: generateKeywords(),
    faq_content: generateFAQContent()
  };
}

async function updateAllLocationsSEO() {
  console.log('🚀 Updating SEO content for all locations...\n');

  // Get all locations that need SEO updates
  const { data: locations, error } = await supabase
    .from('public_locations')
    .select('id, name, type, county_slug, slug')
    .order('type, name');

  if (error) {
    console.error('Error fetching locations:', error);
    return;
  }

  console.log(`📊 Found ${locations.length} locations to update\n`);

  // Group locations by type for processing
  const counties = locations.filter(l => l.type === 'county');
  const cities = locations.filter(l => l.type === 'city');
  const towns = locations.filter(l => l.type === 'town');

  // Update counties
  console.log(`📍 Updating ${counties.length} counties...`);
  for (const county of counties) {
    const seoContent = generateAdvancedSEOContent(county.name, 'county');

    const { error: updateError } = await supabase
      .from('public_locations')
      .update(seoContent)
      .eq('id', county.id);

    if (!updateError) {
      console.log(`  ✅ Updated county: ${county.name}`);
    } else {
      console.error(`  ❌ Error updating ${county.name}:`, updateError);
    }
  }

  // Update cities
  console.log(`\n🏙️ Updating ${cities.length} cities...`);
  for (const city of cities) {
    // Get county name for context
    const county = counties.find(c => c.slug === city.county_slug);
    const countyName = county ? county.name : null;

    const seoContent = generateAdvancedSEOContent(city.name, 'city', countyName);

    const { error: updateError } = await supabase
      .from('public_locations')
      .update(seoContent)
      .eq('id', city.id);

    if (!updateError) {
      console.log(`  ✅ Updated city: ${city.name}, ${countyName}`);
    } else {
      console.error(`  ❌ Error updating ${city.name}:`, updateError);
    }
  }

  // Update towns
  console.log(`\n🏘️ Updating ${towns.length} towns...`);
  for (const town of towns) {
    // Get county name for context
    const county = counties.find(c => c.slug === town.county_slug);
    const countyName = county ? county.name : null;

    const seoContent = generateAdvancedSEOContent(town.name, 'town', countyName);

    const { error: updateError } = await supabase
      .from('public_locations')
      .update(seoContent)
      .eq('id', town.id);

    if (!updateError) {
      console.log(`  ✅ Updated town: ${town.name}, ${countyName}`);
    } else {
      console.error(`  ❌ Error updating ${town.name}:`, updateError);
    }
  }

  console.log('\n✨ SEO content update completed!');
  console.log(`📈 Updated ${counties.length} counties, ${cities.length} cities, and ${towns.length} towns`);
}

async function main() {
  try {
    await updateAllLocationsSEO();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();