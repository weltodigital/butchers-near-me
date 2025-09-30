const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive American to British English spelling mappings
const spellingReplacements = {
  // -ize to -ise
  'specializing': 'specialising',
  'recognized': 'recognised',
  'organized': 'organised',
  'characterized': 'characterised',
  'modernized': 'modernised',
  'localized': 'localised',
  'standardized': 'standardised',
  'emphasized': 'emphasised',
  'realize': 'realise',
  'organize': 'organise',
  'recognize': 'recognise',
  'specialize': 'specialise',
  'characterize': 'characterise',
  'modernize': 'modernise',
  'localize': 'localise',
  'standardize': 'standardise',
  'emphasize': 'emphasise',

  // -or to -our
  'flavor': 'flavour',
  'flavors': 'flavours',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'honor': 'honour',
  'honors': 'honours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  'harbor': 'harbour',
  'harbors': 'harbours',

  // -er to -re
  'center': 'centre',
  'centers': 'centres',
  'theater': 'theatre',
  'theaters': 'theatres',
  'fiber': 'fibre',
  'fibers': 'fibres',

  // -ense to -ence
  'defense': 'defence',
  'offense': 'offence',
  'license': 'licence', // when used as noun

  // -elled vs -eled
  'traveled': 'travelled',
  'traveling': 'travelling',
  'labeled': 'labelled',
  'labeling': 'labelling',
  'modeled': 'modelled',
  'modeling': 'modelling',

  // Other common differences
  'gray': 'grey',
  'skeptical': 'sceptical',
  'catalog': 'catalogue',
  'dialog': 'dialogue',
  'aging': 'ageing',
  'program': 'programme', // when referring to TV/radio programmes
  'aluminum': 'aluminium',
  'mom': 'mum',

  // Food-specific terms
  'appetizer': 'starter',
  'appetizers': 'starters',
  'entree': 'main course',
  'entrées': 'main courses',
  'entrees': 'main courses',
  'cilantro': 'coriander',
  'eggplant': 'aubergine',
  'zucchini': 'courgette',
  'arugula': 'rocket',
  'green onions': 'spring onions',
  'scallions': 'spring onions',

  // Business terms
  'check': 'cheque', // when referring to payment
  'tire': 'tyre',
  'tires': 'tyres',
  'pajamas': 'pyjamas',
  'mom and pop': 'family-run',
  'mom-and-pop': 'family-run',

  // Regional expressions
  'take out': 'takeaway',
  'take-out': 'takeaway',
  'takeout': 'takeaway',
  'downtown': 'city centre',
  'uptown': 'upmarket area',
  'strip mall': 'retail park',
  'parking lot': 'car park',
  'sidewalk': 'pavement'
};

function convertToUKSpelling(text) {
  if (!text || typeof text !== 'string') return text;

  let convertedText = text;

  // Apply all spelling replacements
  for (const [american, british] of Object.entries(spellingReplacements)) {
    // Case-insensitive replacement while preserving original case
    const regex = new RegExp(`\\b${american}\\b`, 'gi');
    convertedText = convertedText.replace(regex, (match) => {
      // Preserve the case of the original match
      if (match === match.toUpperCase()) {
        return british.toUpperCase();
      } else if (match[0] === match[0].toUpperCase()) {
        return british.charAt(0).toUpperCase() + british.slice(1);
      } else {
        return british;
      }
    });
  }

  return convertedText;
}

async function updateLocationSpelling() {
  console.log('🇬🇧 Converting American English to British English spelling...\n');

  // Get all locations
  const { data: locations, error: fetchError } = await supabase
    .from('public_locations')
    .select('id, name, seo_title, meta_description, h1_title, intro_text, main_content, seo_keywords, faq_content');

  if (fetchError) {
    console.error('Error fetching locations:', fetchError);
    return;
  }

  console.log(`📊 Processing ${locations.length} locations...`);

  let updatedCount = 0;

  for (const location of locations) {
    const updates = {};
    let hasChanges = false;

    // Convert text fields
    const textFields = ['seo_title', 'meta_description', 'h1_title', 'intro_text', 'main_content'];

    for (const field of textFields) {
      if (location[field]) {
        const converted = convertToUKSpelling(location[field]);
        if (converted !== location[field]) {
          updates[field] = converted;
          hasChanges = true;
        }
      }
    }

    // Convert SEO keywords array
    if (location.seo_keywords && Array.isArray(location.seo_keywords)) {
      const convertedKeywords = location.seo_keywords.map(keyword => convertToUKSpelling(keyword));
      const keywordsChanged = convertedKeywords.some((keyword, index) => keyword !== location.seo_keywords[index]);

      if (keywordsChanged) {
        updates.seo_keywords = convertedKeywords;
        hasChanges = true;
      }
    }

    // Convert FAQ content
    if (location.faq_content && location.faq_content.questions) {
      const convertedQuestions = location.faq_content.questions.map(q => ({
        question: convertToUKSpelling(q.question),
        answer: convertToUKSpelling(q.answer)
      }));

      const faqChanged = convertedQuestions.some((q, index) =>
        q.question !== location.faq_content.questions[index].question ||
        q.answer !== location.faq_content.questions[index].answer
      );

      if (faqChanged) {
        updates.faq_content = {
          ...location.faq_content,
          questions: convertedQuestions
        };
        hasChanges = true;
      }
    }

    // Update the location if there are changes
    if (hasChanges) {
      const { error: updateError } = await supabase
        .from('public_locations')
        .update(updates)
        .eq('id', location.id);

      if (updateError) {
        console.error(`❌ Error updating ${location.name}:`, updateError);
      } else {
        updatedCount++;
        console.log(`✅ Updated ${location.name} (${Object.keys(updates).length} fields)`);
      }
    }
  }

  console.log(`\n🎉 Spelling conversion complete!`);
  console.log(`📊 Updated ${updatedCount} out of ${locations.length} locations`);
  console.log(`🇬🇧 All content now uses British English spelling`);
}

async function main() {
  try {
    await updateLocationSpelling();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();