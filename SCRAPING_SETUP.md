# 🥩 MeatMap UK - Live Data Scraping Setup

This guide will help you set up live butcher data scraping using Firecrawl to populate your MeatMap UK database with real, up-to-date information.

## 🚀 Quick Start

### 1. Get Firecrawl API Key

1. **Sign up at Firecrawl**
   - Go to [firecrawl.dev](https://firecrawl.dev)
   - Create an account
   - Get your API key from the dashboard

2. **Add to Environment**
   ```bash
   # Add to .env.local
   FIRECRAWL_API_KEY=your_api_key_here
   ```

### 2. Test Scraping

```bash
npm run test:scraping
```

This will test your Firecrawl connection with a simple website.

### 3. Run Scraping

```bash
# Scrape from multiple sources and locations
npm run scrape:butchers

# Or scrape specific websites
npm run scrape:specific
```

## 📊 What Gets Scraped

### Sources
- **Yell.com** - UK business directory
- **Google Search** - Search results for butchers
- **Thomson Local** - Local business directory
- **Google Maps** - Maps listings

### Data Extracted
- Business name
- Full address with postcode
- Phone number
- Website URL
- Customer ratings
- Business descriptions
- Specialties (dry-aged, organic, etc.)

### Locations
- London, Manchester, Birmingham
- Edinburgh, Liverpool, Bristol
- Leeds, Glasgow, Newcastle, Sheffield

## 🛠️ Scraping Scripts

### `npm run test:scraping`
- Tests Firecrawl API connection
- Scrapes a simple test page
- Verifies everything is working

### `npm run scrape:butchers`
- Comprehensive scraping across multiple sources
- 10 major UK cities
- Expected: 500-2000 butchers
- Duration: 10-20 minutes

### `npm run scrape:specific`
- Targeted scraping of specific websites
- Higher quality data
- Faster execution
- Good for testing

## 💰 Cost Estimation

Firecrawl pricing (approximate):
- **Test scraping**: $0.01-0.05
- **Full scraping**: $5-20 (depending on data volume)
- **Per request**: ~$0.01

## 🔧 Configuration

### Customize Scraping Targets

Edit `src/lib/scraper.js` to modify:
- Sources to scrape
- Locations to target
- Data extraction rules
- Rate limiting

### Customize Data Processing

Edit the parsing functions to:
- Extract additional fields
- Clean data differently
- Add custom validation
- Handle specific website formats

## 📈 Expected Results

After successful scraping, you should have:
- **500-2000 real butchers** across the UK
- **Complete contact information** (phone, address, website)
- **Customer ratings** and reviews
- **Business specialties** and descriptions
- **Geolocation data** for mapping

## 🚨 Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check your `.env.local` file
   - Ensure `FIRECRAWL_API_KEY` is set correctly

2. **"Scraping failed"**
   - Check your Firecrawl account has credits
   - Verify your internet connection
   - Some websites may block scraping

3. **"No data found"**
   - Websites may have changed their structure
   - Update selectors in `scraper.js`
   - Try different sources

4. **"Database errors"**
   - Ensure Supabase database is set up
   - Check your database schema is correct
   - Verify environment variables

### Getting Help

1. **Check Firecrawl logs** in your dashboard
2. **Run test scripts** to isolate issues
3. **Check Supabase logs** for database errors
4. **Verify environment variables** are correct

## 🎯 Next Steps

After successful scraping:

1. **Test the API**
   ```bash
   curl http://localhost:3000/api/butchers
   ```

2. **Check the app**
   - Visit http://localhost:3000
   - See real butcher data

3. **Add more data**
   - Run scraping regularly
   - Add new locations
   - Update existing data

4. **Enhance features**
   - Add search functionality
   - Implement filtering
   - Add map integration

## 📁 Files Created

- `src/lib/scraper.js` - Main scraping library
- `scripts/scrape-butchers.js` - Comprehensive scraping
- `scripts/scrape-specific-sites.js` - Targeted scraping
- `scripts/test-scraping.js` - Test script
- `SCRAPING_SETUP.md` - This guide

## 🔄 Regular Updates

To keep data fresh, run scraping regularly:

```bash
# Weekly update
npm run scrape:butchers

# Or add to cron job
0 2 * * 0 cd /path/to/project && npm run scrape:butchers
```

Your MeatMap UK will now have live, real butcher data! 🎉
