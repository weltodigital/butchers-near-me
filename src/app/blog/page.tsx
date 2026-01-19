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
    id: 'how-to-choose-good-local-butcher',
    title: 'How to Choose a Good Local Butcher',
    excerpt: 'Discover what to look for when choosing a quality local butcher, from shop cleanliness and meat quality to customer service and expertise.',
    image: '/how-to-choose-a-good-local-butchers.png',
    date: '2026-01-12',
    readTime: '6 min read'
  },
  {
    id: 'choosing-perfect-steak',
    title: 'How to Choose the Perfect Steak',
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


        {/* Latest Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="card hover-lift overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="card-content">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>Last updated {new Date(post.date).toLocaleDateString('en-GB')}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="card-title text-xl mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/blog/${post.id}`}
                      className="btn btn-primary"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
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