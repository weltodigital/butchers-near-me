const fs = require('fs');
const path = require('path');
// Comprehensive UK locations data based on the provided list
const ukData = {
  "Greater London": {
    seo_keywords: ["london butchers", "london meat suppliers", "premium london butchers", "traditional london meat"],
    cities_and_towns: [
      "Westminster", "Camden", "Islington", "Hackney", "Tower Hamlets", "Greenwich", "Lewisham",
      "Southwark", "Lambeth", "Wandsworth", "Hammersmith & Fulham", "Kensington & Chelsea",
      "City of London", "Barking & Dagenham", "Barnet", "Bexley", "Brent", "Bromley", "Croydon",
      "Ealing", "Enfield", "Haringey", "Harrow", "Havering", "Hillingdon", "Hounslow",
      "Kingston upon Thames", "Merton", "Newham", "Redbridge", "Richmond upon Thames", "Sutton", "Waltham Forest"
    ]
  },
  "Kent": {
seo_keywords: ["kent butchers", "kent meat suppliers", "garden of england butchers", "kent quality meat"],
    cities_and_towns: [
      "Canterbury", "Maidstone", "Ashford", "Dover", "Folkestone", "Margate", "Ramsgate", "Broadstairs",
      "Deal", "Sandwich", "Whitstable", "Herne Bay", "Faversham", "Sittingbourne", "Gillingham",
      "Chatham", "Rochester", "Strood", "Rainham", "Gravesend", "Dartford", "Swanley", "Sevenoaks",
      "Tonbridge", "Tunbridge Wells", "Cranbrook", "Tenterden", "Hythe", "New Romney", "Lydd", "Edenbridge"
    ]
  },
  "Surrey": {
    seo_keywords: ["surrey butchers", "surrey meat suppliers", "home counties butchers", "surrey quality meat"],
    cities_and_towns: [
      "Guildford", "Woking", "Camberley", "Farnborough", "Aldershot", "Farnham", "Godalming",
      "Haslemere", "Reigate", "Redhill", "Dorking", "Leatherhead", "Esher", "Walton-on-Thames",
      "Weybridge", "Addlestone", "Chertsey", "Staines-upon-Thames", "Egham", "Epsom", "Ewell",
      "Banstead", "Caterham", "Oxted"
    ]
  },
  "Sussex": {
    seo_keywords: ["sussex butchers", "sussex meat suppliers", "south coast butchers", "sussex quality meat"],
    cities_and_towns: [
      "Brighton", "Hove", "Worthing", "Eastbourne", "Hastings", "Bexhill-on-Sea", "Lewes", "Seaford",
      "Newhaven", "Peacehaven", "Crawley", "Horsham", "Chichester", "Bognor Regis", "Littlehampton",
      "Arundel", "Shoreham-by-Sea", "Burgess Hill", "Haywards Heath", "East Grinstead", "Uckfield",
      "Crowborough", "Battle", "Rye", "Midhurst", "Petworth"
    ]
  },
  "Hampshire": {
    seo_keywords: ["hampshire butchers", "hampshire meat suppliers", "new forest butchers", "hampshire quality meat"],
    cities_and_towns: [
      "Southampton", "Portsmouth", "Winchester", "Basingstoke", "Andover", "Aldershot", "Farnborough",
      "Fleet", "Alton", "Petersfield", "Havant", "Waterlooville", "Fareham", "Gosport", "Eastleigh",
      "Romsey", "Totton", "Lymington", "New Milton", "Ringwood", "Fordingbridge", "Emsworth", "Hythe"
    ]
  },
  "Berkshire": {
    seo_keywords: ["berkshire butchers", "berkshire meat suppliers", "royal county butchers", "berkshire quality meat"],
    cities_and_towns: [
      "Reading", "Slough", "Maidenhead", "Windsor", "Bracknell", "Newbury", "Wokingham", "Ascot",
      "Sandhurst", "Crowthorne", "Thatcham", "Hungerford", "Woodley", "Earley"
    ]
  },
  "Oxfordshire": {
    seo_keywords: ["oxfordshire butchers", "oxfordshire meat suppliers", "oxford butchers", "oxfordshire quality meat"],
    cities_and_towns: [
      "Oxford", "Banbury", "Bicester", "Witney", "Abingdon", "Didcot", "Henley-on-Thames", "Thame",
      "Wallingford", "Faringdon", "Carterton", "Chipping Norton"
    ]
  },
  "Buckinghamshire": {
    seo_keywords: ["buckinghamshire butchers", "buckinghamshire meat suppliers", "bucks butchers", "buckinghamshire quality meat"],
    cities_and_towns: [
      "Milton Keynes", "High Wycombe", "Aylesbury", "Amersham", "Chesham", "Beaconsfield", "Marlow",
      "Princes Risborough", "Buckingham", "Winslow", "Newport Pagnell", "Olney", "Bletchley"
    ]
  },
  "Cornwall": {
    seo_keywords: ["cornwall butchers", "cornwall meat suppliers", "cornish butchers", "cornwall quality meat"],
    cities_and_towns: [
      "Truro", "Falmouth", "Penzance", "St Ives", "Hayle", "Camborne", "Redruth", "Newquay", "St Austell",
      "Bodmin", "Liskeard", "Launceston", "Saltash", "Torpoint", "Bude", "Wadebridge", "Helston",
      "Penryn", "St Columb Major"
    ]
  },
  "Devon": {
    seo_keywords: ["devon butchers", "devon meat suppliers", "devonshire butchers", "devon quality meat"],
    cities_and_towns: [
      "Exeter", "Plymouth", "Torquay", "Paignton", "Brixham", "Torbay", "Barnstaple", "Bideford",
      "Ilfracombe", "Newton Abbot", "Teignmouth", "Dawlish", "Exmouth", "Sidmouth", "Axminster",
      "Honiton", "Ottery St Mary", "Crediton", "Tiverton", "Okehampton", "Tavistock", "Kingsbridge",
      "Dartmouth", "Totnes", "Ivybridge", "Salcombe"
    ]
  },
  "Somerset": {
    seo_keywords: ["somerset butchers", "somerset meat suppliers", "west country butchers", "somerset quality meat"],
    cities_and_towns: [
      "Bath", "Taunton", "Yeovil", "Bridgwater", "Weston-super-Mare", "Frome", "Glastonbury", "Wells",
      "Street", "Shepton Mallet", "Chard", "Crewkerne", "Ilminster", "Wellington", "Minehead",
      "Burnham-on-Sea", "Clevedon", "Portishead", "Nailsea"
    ]
  },
  "Dorset": {
    seo_keywords: ["dorset butchers", "dorset meat suppliers", "dorset coast butchers", "dorset quality meat"],
    cities_and_towns: [
      "Bournemouth", "Poole", "Weymouth", "Portland", "Dorchester", "Christchurch", "Bridport",
      "Lyme Regis", "Sherborne", "Shaftesbury", "Blandford Forum", "Wimborne Minster", "Ferndown",
      "Swanage", "Wareham", "Verwood"
    ]
  },
  "Wiltshire": {
    seo_keywords: ["wiltshire butchers", "wiltshire meat suppliers", "salisbury butchers", "wiltshire quality meat"],
    cities_and_towns: [
      "Swindon", "Salisbury", "Chippenham", "Trowbridge", "Devizes", "Warminster", "Melksham", "Calne",
      "Corsham", "Bradford-on-Avon", "Marlborough", "Amesbury", "Tidworth", "Royal Wootton Bassett"
    ]
  },
  "Gloucestershire": {
    seo_keywords: ["gloucestershire butchers", "gloucestershire meat suppliers", "cotswold butchers", "gloucestershire quality meat"],
    cities_and_towns: [
      "Gloucester", "Cheltenham", "Stroud", "Cirencester", "Tewkesbury", "Cinderford", "Dursley",
      "Nailsworth", "Stonehouse", "Berkeley", "Lydney", "Fairford", "Lechlade", "Moreton-in-Marsh", "Stow-on-the-Wold"
    ]
  }
};
// Helper function to create URL-friendly slugs
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}
// Create comprehensive locations data
function createComprehensiveLocationsData() {
  const counties = [];
  Object.entries(ukData).forEach(([countyName, countyData]) => {
    const countySlug = createSlug(countyName);
    const citiesAndTowns = [];
    countyData.cities_and_towns.forEach(cityName => {
      const citySlug = createSlug(cityName);
      citiesAndTowns.push({
        name: cityName,
        slug: citySlug,
        seo_keywords: [
          `${cityName.toLowerCase()} butchers`,
          `${cityName.toLowerCase()} meat suppliers`,
          `${cityName.toLowerCase()} quality meat`,
          `butchers in ${cityName.toLowerCase()}`
        ]
      });
    });
    counties.push({
      name: countyName,
      slug: countySlug,
      seo_keywords: countyData.seo_keywords,
      cities_and_towns: citiesAndTowns
    });
  });
  return { counties };
}
// Generate the comprehensive data
const comprehensiveData = createComprehensiveLocationsData();
// Write to file
const outputPath = path.join(__dirname, '../data/comprehensive-uk-locations.json');
fs.writeFileSync(outputPath, JSON.stringify(comprehensiveData, null, 2));
console.log(`✅ Generated comprehensive UK locations data with ${comprehensiveData.counties.length} counties`);
console.log(`📊 Total cities and towns: ${comprehensiveData.counties.reduce((sum, county) => sum + county.cities_and_towns.length, 0)}`);
// Summary by county
comprehensiveData.counties.forEach(county => {
  console.log(`${county.name}: ${county.cities_and_towns.length} locations`);
});
module.exports = { createComprehensiveLocationsData };