import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Butcher Blog - Expert Tips, Recipes & Meat Advice | Butchers Near Me',
  description: 'Discover expert butcher tips, meat preparation guides, recipes, and industry insights from UK\'s finest butchers. Learn about quality cuts, cooking techniques, and local meat sourcing.',
  keywords: 'butcher blog, meat tips, butcher advice, meat recipes, cooking guides, butcher techniques, quality meat, local butchers, meat preparation, butcher insights',
  openGraph: {
    title: 'Butcher Blog - Expert Tips & Recipes from UK Butchers',
    description: 'Expert butcher tips, meat preparation guides, and recipes from UK\'s finest independent butchers.',
    url: 'https://www.butchersnearme.co.uk/blog',
  },
  twitter: {
    title: 'Butcher Blog - Expert Tips & Recipes',
    description: 'Expert butcher tips, meat guides, and recipes from UK\'s finest butchers.',
  },
}

// Sample blog posts data - this would typically come from a CMS or database
const blogPosts = [
  {
    id: 'choosing-perfect-steak',
    title: 'How to Choose the Perfect Steak: A Butcher\'s Guide',
    excerpt: 'Learn from professional butchers how to select the best cuts for your perfect steak, including marbling, aging, and preparation tips.',
    image: '/blog/steak-selection.jpg',
    date: '2024-01-15',
    category: 'Meat Selection',
    readTime: '5 min read',
    author: 'Expert Butchers'
  },
  {
    id: 'supporting-local-butchers',
    title: 'Why Supporting Local Butchers Matters More Than Ever',
    excerpt: 'Discover the benefits of choosing independent butchers over supermarkets, from quality and sustainability to community support.',
    image: '/blog/local-butcher.jpg',
    date: '2024-01-12',
    category: 'Industry Insights',
    readTime: '7 min read',
    author: 'Butcher Community'
  },
  {
    id: 'meat-storage-guide',
    title: 'The Complete Guide to Storing Meat Safely',
    excerpt: 'Essential tips from professional butchers on proper meat storage, freezing techniques, and maintaining freshness at home.',
    image: '/blog/meat-storage.jpg',
    date: '2024-01-10',
    category: 'Food Safety',
    readTime: '6 min read',
    author: 'Food Safety Expert'
  },
  {
    id: 'seasonal-meat-guide',
    title: 'Seasonal Meat Guide: Best Cuts for Every Time of Year',
    excerpt: 'Explore which meats are at their best throughout the year and how seasonal eating can improve flavor and support local farms.',
    image: '/blog/seasonal-meat.jpg',
    date: '2024-01-08',
    category: 'Seasonal Guide',
    readTime: '8 min read',
    author: 'Seasonal Expert'
  },
  {
    id: 'butcher-techniques-home',
    title: 'Professional Butcher Techniques You Can Use at Home',
    excerpt: 'Learn basic butchering skills and knife techniques that professional butchers use, adapted for your home kitchen.',
    image: '/blog/butcher-techniques.jpg',
    date: '2024-01-05',
    category: 'Techniques',
    readTime: '10 min read',
    author: 'Master Butcher'
  },
  {
    id: 'understanding-meat-grades',
    title: 'Understanding Meat Grades and Quality Standards',
    excerpt: 'Decode meat grading systems and quality indicators to make informed choices when buying from your local butcher.',
    image: '/blog/meat-grades.jpg',
    date: '2024-01-03',
    category: 'Education',
    readTime: '6 min read',
    author: 'Quality Expert'
  }
]

const categories = [
  'All Posts',
  'Meat Selection',
  'Techniques',
  'Food Safety',
  'Seasonal Guide',
  'Industry Insights',
  'Education'
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The Butcher's Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert tips, recipes, and insights from UK's finest independent butchers.
              Discover the art of quality meat selection, preparation techniques, and the stories behind your local butcher shops.
            </p>
          </div>
        </header>

        {/* Category Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full transition-colors ${
                  category === 'All Posts'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600'
                } border border-gray-200`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        <section className="mb-16">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto bg-slate-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  [Featured Article Image]
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Featured</span>
                  <span>{blogPosts[0].category}</span>
                  <span>•</span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    By {blogPosts[0].author} • {new Date(blogPosts[0].date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].id}`}
                    className="btn btn-primary"
                  >
                    Read Article
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="card hover-lift overflow-hidden">
                <div className="relative h-48 bg-slate-200">
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    [Article Image]
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{new Date(post.date).toLocaleDateString('en-GB')}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="card-title text-lg mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      By {post.author}
                    </span>
                    <Link
                      href={`/blog/${post.id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="text-center mb-16">
          <div className="card p-12 max-w-2xl mx-auto">
            <h2 className="card-title text-3xl mb-6">
              Stay Updated with Butcher Tips
            </h2>
            <p className="card-description text-lg mb-8">
              Get the latest articles, recipes, and expert advice delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button className="btn btn-primary px-6">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="card p-12">
            <h2 className="card-title text-4xl mb-6">
              Find Your Local Butcher
            </h2>
            <p className="card-description text-lg mb-8 max-w-2xl mx-auto">
              Ready to put this advice into practice? Find quality butchers near you and experience
              the difference of expertly prepared, locally sourced meat.
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link href="/locations" className="btn btn-primary text-lg px-8 py-4">
                Browse All Locations
              </Link>
              <Link href="/" className="btn btn-outline text-lg px-8 py-4">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}