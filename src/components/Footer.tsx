import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-6">Butchers Near Me</h3>
          <p className="text-slate-400 mb-8 text-lg max-w-2xl mx-auto">
            Connecting you with quality local butchers across the UK. Find traditional craftsmanship, expert service, and premium cuts near you.
          </p>
        </div>

        {/* Counties Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-center mb-4">Find Butchers by County</h4>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link href="/bedfordshire" className="text-slate-400 hover:text-white transition-colors">
              Bedfordshire
            </Link>
            <Link href="/gloucestershire" className="text-slate-400 hover:text-white transition-colors">
              Gloucestershire
            </Link>
            <Link href="/devon" className="text-slate-400 hover:text-white transition-colors">
              Devon
            </Link>
            <Link href="/yorkshire" className="text-slate-400 hover:text-white transition-colors">
              Yorkshire
            </Link>
            <Link href="/kent" className="text-slate-400 hover:text-white transition-colors">
              Kent
            </Link>
            <Link href="/sussex" className="text-slate-400 hover:text-white transition-colors">
              Sussex
            </Link>
            <Link href="/hampshire" className="text-slate-400 hover:text-white transition-colors">
              Hampshire
            </Link>
            <Link href="/essex" className="text-slate-400 hover:text-white transition-colors">
              Essex
            </Link>
          </div>
        </div>

        {/* Legal Links */}
        <div className="text-center border-t border-slate-800 pt-8">
          <div className="flex justify-center gap-8 flex-wrap mb-6">
            <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="mailto:butchersnearme@weltodigital.com" className="text-slate-400 hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
          <div className="text-slate-500">
            <p>&copy; {new Date().getFullYear()} Butchers Near Me. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}