# MeatMap UK Database Setup

This guide will help you set up the Supabase database for your MeatMap UK butcher directory.

## 🚀 Quick Setup

### Option 1: Manual Setup (Recommended)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your account
   - Open your MeatMap UK project

2. **Navigate to SQL Editor**
   - In the left sidebar, click "SQL Editor"
   - Click "New query"

3. **Copy and Execute Schema**
   - Open the file `supabase-schema.sql` in this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `butchers`
     - `reviews`
     - `specialties`
     - `butcher_specialties`

### Option 2: Automated Setup

Run the setup script:
```bash
npm run setup:db
```

Then choose option 2 for automated setup.

## 🧪 Test Your Database

After setting up the database, test the connection:

```bash
npm run test:db
```

This will verify that:
- Tables are created correctly
- Sample data is loaded
- API connections work
- Search functionality is working

## 📊 Database Schema

### Tables Created

#### `butchers`
- **Primary table** for butcher shop information
- Includes location, contact details, ratings, and specialties
- Supports full-text search and geolocation

#### `reviews`
- **Customer reviews** for butcher shops
- Links to butchers table via foreign key
- Includes rating, comments, and verification status

#### `specialties`
- **Lookup table** for butcher specialties
- Pre-populated with common specialties like "Dry-aged Beef", "Organic", etc.

#### `butcher_specialties`
- **Junction table** linking butchers to their specialties
- Many-to-many relationship

### Sample Data

The schema includes sample data for:
- 5 butcher shops across the UK
- 7 customer reviews
- 15 common specialties

## 🔧 Environment Variables

Make sure your `.env.local` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🚨 Troubleshooting

### Common Issues

1. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in Supabase
   - Check that you're using the correct project

2. **Permission denied errors**
   - Verify your environment variables are correct
   - Check that your Supabase project is active

3. **No data showing up**
   - Run the test script: `npm run test:db`
   - Check the Supabase Table Editor for data

### Getting Help

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Run `npm run test:db` to diagnose problems
3. Verify your environment variables are correct

## 🎯 Next Steps

After successful database setup:

1. **Test the API** - Run `npm run test:db`
2. **Build the frontend** - Start using the database in your components
3. **Add more data** - Use the Supabase dashboard to add more butchers
4. **Configure search** - Set up full-text search functionality

## 📁 Files Created

- `supabase-schema.sql` - Complete database schema
- `src/lib/supabase.js` - Database client and helper functions
- `scripts/setup-db.js` - Database setup script
- `scripts/test-db.js` - Database testing script

Your MeatMap UK database is now ready! 🎉
