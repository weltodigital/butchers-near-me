const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// UK County mapping - comprehensive list
const cityToCountyMap = {
  // England
  'London': 'Greater London',
  'Birmingham': 'West Midlands',
  'Manchester': 'Greater Manchester',
  'Liverpool': 'Merseyside',
  'Leeds': 'West Yorkshire',
  'Sheffield': 'South Yorkshire',
  'Bristol': 'Gloucestershire',
  'Newcastle': 'Tyne and Wear',
  'Bradford': 'West Yorkshire',
  'Leicester': 'Leicestershire',
  'Coventry': 'West Midlands',
  'Nottingham': 'Nottinghamshire',
  'Kingston upon Hull': 'East Yorkshire',
  'Plymouth': 'Devon',
  'Stoke-on-Trent': 'Staffordshire',
  'Wolverhampton': 'West Midlands',
  'Derby': 'Derbyshire',
  'Southampton': 'Hampshire',
  'Portsmouth': 'Hampshire',
  'York': 'North Yorkshire',
  'Peterborough': 'Cambridgeshire',
  'Norwich': 'Norfolk',
  'Reading': 'Berkshire',
  'Luton': 'Bedfordshire',
  'Northampton': 'Northamptonshire',
  'Preston': 'Lancashire',
  'Milton Keynes': 'Buckinghamshire',
  'Aberdeen': 'Aberdeenshire',
  'Dundee': 'Angus',
  'Stirling': 'Stirlingshire',
  'Swindon': 'Wiltshire',
  'Gloucester': 'Gloucestershire',
  'Exeter': 'Devon',
  'Chelmsford': 'Essex',
  'Ipswich': 'Suffolk',
  'Cambridge': 'Cambridgeshire',
  'Oxford': 'Oxfordshire',
  'Bath': 'Somerset',
  'Canterbury': 'Kent',
  'Salisbury': 'Wiltshire',
  'Winchester': 'Hampshire',
  'Chester': 'Cheshire',
  'Worcester': 'Worcestershire',
  'Hereford': 'Herefordshire',
  'Shrewsbury': 'Shropshire',
  'Telford': 'Shropshire',
  'Stafford': 'Staffordshire',
  'Burton upon Trent': 'Staffordshire',
  'Tamworth': 'Staffordshire',
  'Nuneaton': 'Warwickshire',
  'Warwick': 'Warwickshire',
  'Rugby': 'Warwickshire',
  'Stratford-upon-Avon': 'Warwickshire',
  'Kenilworth': 'Warwickshire',
  'Leamington Spa': 'Warwickshire',
  'Redditch': 'Worcestershire',
  'Bromsgrove': 'Worcestershire',
  'Kidderminster': 'Worcestershire',
  'Evesham': 'Worcestershire',
  'Malvern': 'Worcestershire',
  'Bridgnorth': 'Shropshire',
  'Ludlow': 'Shropshire',
  'Market Drayton': 'Shropshire',
  'Oswestry': 'Shropshire',
  'Wellington': 'Shropshire',
  'Whitchurch': 'Shropshire',
  'Stone': 'Staffordshire',
  'Leek': 'Staffordshire',
  'Cannock': 'Staffordshire',
  'Lichfield': 'Staffordshire',
  'Rugeley': 'Staffordshire',
  'Uttoxeter': 'Staffordshire',
  'Ashby-de-la-Zouch': 'Leicestershire',
  'Coalville': 'Leicestershire',
  'Hinckley': 'Leicestershire',
  'Loughborough': 'Leicestershire',
  'Market Harborough': 'Leicestershire',
  'Melton Mowbray': 'Leicestershire',
  'Oakham': 'Rutland',
  'Uppingham': 'Rutland',
  'Grantham': 'Lincolnshire',
  'Lincoln': 'Lincolnshire',
  'Skegness': 'Lincolnshire',
  'Boston': 'Lincolnshire',
  'Spalding': 'Lincolnshire',
  'Stamford': 'Lincolnshire',
  'Sleaford': 'Lincolnshire',
  'Gainsborough': 'Lincolnshire',
  'Grimsby': 'Lincolnshire',
  'Scunthorpe': 'Lincolnshire',
  'Cleethorpes': 'Lincolnshire',
  'Louth': 'Lincolnshire',
  'Horncastle': 'Lincolnshire',
  'Market Rasen': 'Lincolnshire',
  'Alford': 'Lincolnshire',
  'Spilsby': 'Lincolnshire',
  'Mablethorpe': 'Lincolnshire',
  'Sutton-on-Sea': 'Lincolnshire',
  'Chapel St Leonards': 'Lincolnshire',
  'Ingoldmells': 'Lincolnshire',
  'Holbeach': 'Lincolnshire',
  'Long Sutton': 'Lincolnshire',
  'Crowland': 'Lincolnshire',
  'Bourne': 'Lincolnshire',
  'Market Deeping': 'Lincolnshire',
  'Donington': 'Lincolnshire',
  'Folkingham': 'Lincolnshire',
  'Billinghay': 'Lincolnshire',
  'Metheringham': 'Lincolnshire',
  'Washingborough': 'Lincolnshire',
  'Welton': 'Lincolnshire',
  'Saxilby': 'Lincolnshire',
  'Caistor': 'Lincolnshire',
  'Brigg': 'Lincolnshire',
  'Barton-upon-Humber': 'Lincolnshire',
  'Epworth': 'Lincolnshire',
  'Crowle': 'Lincolnshire',
  'Kirton in Lindsey': 'Lincolnshire',
  'Winterton': 'Lincolnshire',

  // Scotland
  'Edinburgh': 'Midlothian',
  'Glasgow': 'Lanarkshire',
  'Stirling': 'Stirlingshire',
  'Perth': 'Perthshire',
  'Inverness': 'Inverness-shire',
  'Fort William': 'Inverness-shire',
  'Oban': 'Argyll',
  'Ayr': 'Ayrshire',
  'Dumfries': 'Dumfriesshire',
  'Stranraer': 'Wigtownshire',
  'Kirkcudbright': 'Kirkcudbrightshire',
  'Dalbeattie': 'Kirkcudbrightshire',
  'Castle Douglas': 'Kirkcudbrightshire',
  'New Galloway': 'Kirkcudbrightshire',
  'Gatehouse of Fleet': 'Kirkcudbrightshire',
  'Annan': 'Dumfriesshire',
  'Lockerbie': 'Dumfriesshire',
  'Moffat': 'Dumfriesshire',
  'Gretna': 'Dumfriesshire',
  'Langholm': 'Dumfriesshire',
  'Sanquhar': 'Dumfriesshire',
  'Thornhill': 'Dumfriesshire',
  'Moniaive': 'Dumfriesshire',
  'Dunscore': 'Dumfriesshire',
  'Ae': 'Dumfriesshire',
  'Beattock': 'Dumfriesshire',
  'Johnstonebridge': 'Dumfriesshire',
  'Dalmellington': 'Ayrshire',

  // Wales
  'Cardiff': 'Glamorgan',
  'Swansea': 'Glamorgan',
  'Newport': 'Monmouthshire',
  'Wrexham': 'Denbighshire',
  'Bangor': 'Gwynedd',
  'Aberystwyth': 'Ceredigion',
  'Carmarthen': 'Carmarthenshire',
  'Llanelli': 'Carmarthenshire',
  'Neath': 'Glamorgan',
  'Port Talbot': 'Glamorgan',
  'Bridgend': 'Glamorgan',
  'Merthyr Tydfil': 'Glamorgan',
  'Pontypridd': 'Glamorgan',
  'Caerphilly': 'Glamorgan',
  'Barry': 'Glamorgan',
  'Penarth': 'Glamorgan',
  'Cowbridge': 'Glamorgan',
  'Llantwit Major': 'Glamorgan',
  'Porthcawl': 'Glamorgan',
  'Maesteg': 'Glamorgan',
  'Aberdare': 'Glamorgan',
  'Mountain Ash': 'Glamorgan',
  'Treorchy': 'Glamorgan',
  'Ferndale': 'Glamorgan',
  'Tonypandy': 'Glamorgan',
  'Porth': 'Glamorgan',
  'Pontypridd': 'Glamorgan',

  // Northern Ireland
  'Belfast': 'County Antrim',
  'Derry': 'County Londonderry',
  'Lisburn': 'County Antrim',
  'Newtownabbey': 'County Antrim',
  'Bangor': 'County Down',
  'Craigavon': 'County Armagh',
  'Castlereagh': 'County Down',
  'Ballymena': 'County Antrim',
  'Newry': 'County Down',
  'Carrickfergus': 'County Antrim',
  'Coleraine': 'County Londonderry',
  'Omagh': 'County Tyrone',
  'Larne': 'County Antrim',
  'Dungannon': 'County Tyrone',
  'Limavady': 'County Londonderry',
  'Enniskillen': 'County Fermanagh',
  'Strabane': 'County Tyrone',
  'Downpatrick': 'County Down',
  'Antrim': 'County Antrim',
  'Armagh': 'County Armagh',
  'Ballymoney': 'County Antrim',
  'Magherafelt': 'County Londonderry',
  'Newcastle': 'County Down',
  'Portstewart': 'County Londonderry',
  'Holywood': 'County Down',
  'Comber': 'County Down',

  // More specific mappings for common variations and smaller places
  'Holsworthy': 'Devon',
  'Larkhall': 'Lanarkshire',
  'Thornton-Cleveleys': 'Lancashire',
  'Bedale': 'North Yorkshire',
  'Bridport': 'Dorset',
  'Frome': 'Somerset',
  'Nailsea': 'Somerset',
  'Cheddar': 'Somerset',
  'Street': 'Somerset',
  'Burnham-on-Sea': 'Somerset',
  'Highbridge': 'Somerset',
  'Weston-super-Mare': 'Somerset',
  'Clevedon': 'Somerset',
  'Portishead': 'Somerset',
  'Keynsham': 'Somerset',
  'Midsomer Norton': 'Somerset',
  'Radstock': 'Somerset',
  'Shepton Mallet': 'Somerset',
  'Wells': 'Somerset',
  'Glastonbury': 'Somerset',
  'Somerton': 'Somerset',
  'Langport': 'Somerset',
  'Burnham-on-Sea': 'Somerset',
  'Minehead': 'Somerset',
  'Watchet': 'Somerset',
  'Dulverton': 'Somerset',
  'Wiveliscombe': 'Somerset',
  'Wellington': 'Somerset',
  'Chard': 'Somerset',
  'Crewkerne': 'Somerset',
  'Ilminster': 'Somerset',
  'Martock': 'Somerset',
  'South Petherton': 'Somerset',
  'Curry Rivel': 'Somerset',
  'Huish Episcopi': 'Somerset',
  'Muchelney': 'Somerset',
  'Kingsbury Episcopi': 'Somerset',
  'East Lambrook': 'Somerset',
  'Norton sub Hamdon': 'Somerset',
  'Stoke sub Hamdon': 'Somerset',
  'Montacute': 'Somerset',
  'Odcombe': 'Somerset',
  'Closworth': 'Somerset',
  'Hardington': 'Somerset',
  'Pendomer': 'Somerset',
  'Allowenshay': 'Somerset',

  // Add more as needed
  'Paignton': 'Devon',
  'Torquay': 'Devon',
  'Dartmouth': 'Devon',
  'Totnes': 'Devon',
  'Kingsbridge': 'Devon',
  'Salcombe': 'Devon',
  'Ivybridge': 'Devon',
  'Modbury': 'Devon',
  'South Brent': 'Devon',
  'Buckfastleigh': 'Devon',
  'Ashburton': 'Devon',
  'Newton Abbot': 'Devon',
  'Teignmouth': 'Devon',
  'Dawlish': 'Devon',
  'Exmouth': 'Devon',
  'Sidmouth': 'Devon',
  'Seaton': 'Devon',
  'Axminster': 'Devon',
  'Honiton': 'Devon',
  'Ottery St Mary': 'Devon',
  'Crediton': 'Devon',
  'Tiverton': 'Devon',
  'Cullompton': 'Devon',
  'Brixham': 'Devon',
  'Bovey Tracey': 'Devon',

  // Default fallback for unmatched cities
}

// Function to map city to county with fuzzy matching
function mapCityToCounty(city) {
  if (!city) return 'Unknown'

  const cleanCity = city.trim()

  // Direct match
  if (cityToCountyMap[cleanCity]) {
    return cityToCountyMap[cleanCity]
  }

  // Try partial matches
  for (const [mapCity, county] of Object.entries(cityToCountyMap)) {
    if (cleanCity.toLowerCase().includes(mapCity.toLowerCase()) ||
        mapCity.toLowerCase().includes(cleanCity.toLowerCase())) {
      return county
    }
  }

  // Fallback based on common patterns
  if (cleanCity.toLowerCase().includes('london')) return 'Greater London'
  if (cleanCity.toLowerCase().includes('manchester')) return 'Greater Manchester'
  if (cleanCity.toLowerCase().includes('birmingham')) return 'West Midlands'
  if (cleanCity.toLowerCase().includes('liverpool')) return 'Merseyside'
  if (cleanCity.toLowerCase().includes('leeds')) return 'West Yorkshire'
  if (cleanCity.toLowerCase().includes('glasgow')) return 'Lanarkshire'
  if (cleanCity.toLowerCase().includes('edinburgh')) return 'Midlothian'
  if (cleanCity.toLowerCase().includes('cardiff')) return 'Glamorgan'
  if (cleanCity.toLowerCase().includes('belfast')) return 'County Antrim'

  // Default
  return 'Other'
}

async function analyzeAndUpdateLocations() {
  console.log('Fetching all butchers from database...')

  const { data: butchers, error } = await supabase
    .from('butchers')
    .select('id, city')

  if (error) {
    console.error('Error fetching butchers:', error)
    return
  }

  console.log(`Found ${butchers.length} butchers`)

  // Analyze cities and map to counties
  const cityStats = {}
  const countyStats = {}

  butchers.forEach(butcher => {
    const city = butcher.city
    const county = mapCityToCounty(city)

    // City stats
    if (!cityStats[city]) {
      cityStats[city] = {
        count: 0,
        county: county,
        butcherIds: []
      }
    }
    cityStats[city].count++
    cityStats[city].butcherIds.push(butcher.id)

    // County stats
    if (!countyStats[county]) {
      countyStats[county] = {
        count: 0,
        cities: new Set()
      }
    }
    countyStats[county].count++
    countyStats[county].cities.add(city)
  })

  // Convert sets to arrays for logging
  Object.keys(countyStats).forEach(county => {
    countyStats[county].cities = Array.from(countyStats[county].cities)
  })

  console.log('\n=== COUNTY BREAKDOWN ===')
  Object.entries(countyStats)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([county, stats]) => {
      console.log(`${county}: ${stats.count} butchers in ${stats.cities.length} cities`)
      console.log(`  Cities: ${stats.cities.slice(0, 5).join(', ')}${stats.cities.length > 5 ? '...' : ''}`)
    })

  console.log('\n=== TOP CITIES ===')
  Object.entries(cityStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .forEach(([city, stats]) => {
      console.log(`${city} (${stats.county}): ${stats.count} butchers`)
    })

  // Now update the database with county information
  console.log('\n=== UPDATING DATABASE ===')
  let updated = 0

  for (const [city, stats] of Object.entries(cityStats)) {
    const { error: updateError } = await supabase
      .from('butchers')
      .update({ county: stats.county })
      .eq('city', city)

    if (updateError) {
      console.error(`Error updating city ${city}:`, updateError)
    } else {
      updated += stats.count
      console.log(`Updated ${stats.count} butchers in ${city} → ${stats.county}`)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`\n✅ Updated ${updated} butchers with county information`)

  return { cityStats, countyStats }
}

async function main() {
  try {
    const results = await analyzeAndUpdateLocations()
    console.log('\nLocation analysis and update completed!')
  } catch (error) {
    console.error('Error:', error)
  }
}

main()