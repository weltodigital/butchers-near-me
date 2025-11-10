import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Butchers Near Me',
  description: 'Terms of service for Butchers Near Me - the rules and conditions for using our butcher directory website.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-red-600">Home</Link></li>
            <li>→</li>
            <li className="text-gray-900 font-medium">Terms of Service</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of our website and services. Please read them carefully.
          </p>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              <strong>Effective Date:</strong> November 2024
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using Butchers Near Me (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, you should not use our website.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              Butchers Near Me is a directory service that helps users find local butchers across the UK. Our service includes:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>A searchable directory of butchers by location</li>
              <li>Contact information and details for butcher shops</li>
              <li>Interactive maps showing butcher locations</li>
              <li>User reviews and ratings (where available)</li>
              <li>Links to butcher websites and social media</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily access our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to reverse engineer any software contained on our website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-600 mb-4">
              You agree not to use our service to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Submit false, misleading, or inaccurate information</li>
              <li>Interfere with or disrupt our service or servers</li>
              <li>Use automated systems to scrape or harvest data</li>
              <li>Spam or send unsolicited communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Business Information Accuracy</h2>
            <p className="text-gray-600 mb-6">
              While we strive to provide accurate and up-to-date information about butchers, we cannot guarantee the accuracy, completeness, or timeliness of all information displayed. Business hours, contact details, and services may change without notice. We encourage users to contact businesses directly to verify information before visiting.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Links</h2>
            <p className="text-gray-600 mb-6">
              Our website may contain links to third-party websites, including individual butcher websites, social media pages, and map services. We are not responsible for the content, privacy policies, or practices of these third-party sites. Your use of third-party websites is at your own risk.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              The content on our website, including text, graphics, logos, and software, is owned by us or our licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit permission.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers</h2>
            <p className="text-gray-600 mb-4">
              The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, we exclude:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>All representations and warranties relating to this website and its contents</li>
              <li>All liability for any direct, indirect, or consequential loss or damage</li>
              <li>Responsibility for the accuracy or reliability of business information</li>
              <li>Liability for any loss arising from your use of third-party services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              In no event shall Butchers Near Me be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy</h2>
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our service, to understand our practices.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications to Terms</h2>
            <p className="text-gray-600 mb-6">
              We may revise these terms of service at any time without notice. By using our website, you are agreeing to be bound by the current version of these terms of service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to terminate or restrict your access to our service at any time, without notice, for any reason, including if we believe you have violated these terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-gray-600 mb-2">
                <strong>Email:</strong> <a href="mailto:butchersnearme@weltodigital.com" className="text-red-600 hover:text-red-700">butchersnearme@weltodigital.com</a>
              </p>
              <p className="text-gray-600">
                <strong>Website:</strong> <a href="https://butchersnearme.co.uk" className="text-red-600 hover:text-red-700">butchersnearme.co.uk</a>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}