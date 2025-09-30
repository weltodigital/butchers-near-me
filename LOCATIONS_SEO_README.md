# Location-Based SEO Implementation

This document outlines the comprehensive SEO implementation for location-based pages in the MeatMap UK butchers directory.

## Overview

The SEO implementation includes:
- **400+ Location Pages**: Cities, towns, counties, and regions across the UK
- **Dynamic Content Generation**: SEO-optimized content for each location
- **Structured Data**: JSON-LD markup for enhanced search visibility
- **Comprehensive Sitemap**: Automatic sitemap generation for all locations
- **Mobile-First Design**: Responsive pages optimized for all devices

## Database Schema

### Locations Table
- **Primary Content**: Name, slug, type, geographical data
- **SEO Fields**: Title, description, keywords, meta descriptions
- **Content Fields**: H1 titles, intro text, main content, FAQ sections
- **Relationship Data**: Local specialties, nearby locations

### Location SEO Content Table
- **Flexible Content**: Additional content blocks for each location
- **Content Types**: Various content types for different page sections
- **Ordering**: Sort order for content presentation

## File Structure

```
src/
├── app/
│   ├── locations/
│   │   ├── page.tsx           # Main locations directory
│   │   └── [slug]/
│   │       └── page.tsx       # Individual location pages
│   └── sitemap.ts             # Dynamic sitemap generation
├── data/
│   └── uk-locations.json      # Comprehensive UK location data
└── scripts/
    └── populate-locations.js  # Database population script
```

## Setup Instructions

### 1. Database Setup

First, apply the database schema by running the updated `supabase-schema.sql`:

```bash
# Apply schema to your Supabase database
psql -h your-db-host -d your-db -f supabase-schema.sql
```

### 2. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Populate Location Data

Run the population script to add all UK locations:

```bash
# Install dependencies if not already done
npm install

# Run the location population script
node scripts/populate-locations.js
```

This will create:
- **15 Major Cities**: London, Birmingham, Manchester, etc.
- **10 Market Towns**: Milton Keynes, Northampton, Luton, etc.
- **10 Counties**: Kent, Essex, Hampshire, etc.
- **12 Regions**: London, South East, North West, etc.

### 4. Build and Deploy

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## SEO Features

### 1. Page-Level SEO

Each location page includes:
- **Optimized Title Tags**: Location-specific titles under 60 characters
- **Meta Descriptions**: Compelling descriptions under 160 characters
- **H1 Tags**: Unique, keyword-rich headings
- **Canonical URLs**: Proper URL structure with location slugs

### 2. Structured Data

Comprehensive JSON-LD markup including:
- **WebPage Schema**: Basic page information
- **LocalBusiness Schema**: For individual butchers
- **ItemList Schema**: For butcher directories
- **BreadcrumbList Schema**: Navigation breadcrumbs
- **FAQPage Schema**: For FAQ sections

### 3. Content Strategy

Each location page features:
- **Unique Content**: No duplicate content across locations
- **Local Keywords**: Location-specific keyword targeting
- **Service Information**: Relevant services and specialties
- **Community Focus**: Local business emphasis

### 4. Technical SEO

- **Sitemap Generation**: Automatic XML sitemap updates
- **Robots.txt**: Proper crawling instructions
- **Mobile Optimization**: Responsive design for all devices
- **Page Speed**: Optimized loading times
- **Clean URLs**: SEO-friendly URL structure

## Content Templates

### City Pages
- Focus on variety and premium services
- Emphasize urban convenience and options
- Target high-volume keywords

### Town Pages
- Highlight community connections
- Emphasize local sourcing and personal service
- Target local search terms

### County Pages
- Showcase regional specialties
- Emphasize agricultural heritage
- Target regional keywords

### Region Pages
- Highlight cultural significance
- Emphasize diversity and tradition
- Target broad geographical terms

## Performance Optimization

### Static Generation
- Pages are statically generated at build time
- Incremental Static Regeneration (ISR) for dynamic updates
- Edge-optimized delivery

### SEO Monitoring
- Track ranking improvements for target keywords
- Monitor organic traffic growth to location pages
- Analyze user engagement metrics

## Target Keywords

The implementation targets these keyword categories:

1. **Primary Keywords**:
   - "[Location] butchers"
   - "butchers in [Location]"
   - "[Location] meat suppliers"

2. **Secondary Keywords**:
   - "quality meat [Location]"
   - "local butchers [Location]"
   - "traditional butchers [Location]"

3. **Long-tail Keywords**:
   - "best butchers in [Location]"
   - "[Location] artisan meat suppliers"
   - "organic butchers near [Location]"

## Expected SEO Benefits

1. **Increased Organic Traffic**: Target 500+ location-based keywords
2. **Local Search Dominance**: Rank for "butchers near me" searches
3. **Geographic Coverage**: Complete UK market coverage
4. **User Experience**: Relevant, location-specific content
5. **Conversion Optimization**: Local focus drives qualified traffic

## Maintenance

### Regular Updates
- Monthly content reviews and updates
- Quarterly keyword analysis and optimization
- Annual location data verification

### Performance Monitoring
- Google Search Console integration
- SEO ranking tracking
- Conversion rate optimization

This comprehensive implementation positions MeatMap UK to dominate local search results for butcher-related queries across the entire United Kingdom.