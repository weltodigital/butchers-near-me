import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Butcher Blog - Expert Tips, Recipes & Meat Advice | Butchers Near Me',
  description: 'Discover expert butcher tips, meat preparation guides, recipes, and industry insights from UK&apos;s finest butchers. Learn about quality cuts, cooking techniques, and local meat sourcing.',
  keywords: 'butcher blog, meat tips, butcher advice, meat recipes, cooking guides, butcher techniques, quality meat, local butchers, meat preparation, butcher insights',
  openGraph: {
    title: 'Butcher Blog - Expert Tips & Recipes from UK Butchers',
    description: 'Expert butcher tips, meat preparation guides, and recipes from UK&apos;s finest independent butchers.',
    url: 'https://www.butchersnearme.co.uk/blog',
  },
  twitter: {
    title: 'Butcher Blog - Expert Tips & Recipes',
    description: 'Expert butcher tips, meat guides, and recipes from UK&apos;s finest butchers.',
  },
}

// Sample blog posts data - this would typically come from a CMS or database
const blogPosts = [
  {
    id: 'choosing-perfect-steak',
    title: 'How to Choose the Perfect Steak: A Butcher&apos;s Guide',
    excerpt: 'Learn from professional butchers how to select the best cuts for your perfect steak, including marbling, aging, and preparation tips.',
    image: '/how-to-choose-the-perfect-steak.png',
    date: '2026-01-10',
    readTime: '5 min read'
  }
]


export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The Butcher&apos;s Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert tips, recipes, and insights from UK&apos;s finest independent butchers.
              Discover the art of quality meat selection, preparation techniques, and the stories behind your local butcher shops.
            </p>
          </div>
        </header>


        {/* Featured Post */}
        <section className="mb-16">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Featured</span>
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
                    Last updated {new Date(blogPosts[0].date).toLocaleDateString('en-GB', {
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