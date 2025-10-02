import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Butchers Near Me',
  description: 'Terms of Service for Butchers Near Me - Learn about the rules and regulations for using our butcher directory service.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-600 mb-4">
            <ol className="flex space-x-2">
              <li><Link href="/" className="hover:text-red-600">Home</Link></li>
              <li className="before:content-['/'] before:mx-2 text-gray-900">Terms of Service</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Butchers Near Me ("we," "us," or "our") regarding your use of the website butchersnearme.co.uk (the "Service").
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Butchers Near Me is a directory service that helps users locate butcher shops across the United Kingdom. Our Service provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Information about butcher shops including contact details, addresses, and descriptions</li>
                <li>Location-based search functionality</li>
                <li>Maps and directions to butcher shops</li>
                <li>General information about butcher services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use</h2>
              <p className="text-gray-700 mb-4">
                You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Use the Service for any unlawful purpose or to solicit unlawful activities</li>
                <li>Violate any local, state, national, or international law or regulation</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to interfere with, compromise, or disrupt the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate or attempt to impersonate the company, employees, or other users</li>
                <li>Collect or harvest any personally identifiable information from the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Accuracy</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate and up-to-date information about butcher shops. However:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Information is provided "as is" and may not always be current or accurate</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of any information</li>
                <li>Business information may change without notice</li>
                <li>We recommend contacting businesses directly to verify current information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Content</h2>
              <p className="text-gray-700 mb-4">
                Our Service may contain links to third-party websites or services that are not owned or controlled by Butchers Near Me. We have no control over and assume no responsibility for:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>The content, privacy policies, or practices of any third-party websites</li>
                <li>The accuracy or reliability of third-party information</li>
                <li>Any transactions or interactions with third-party businesses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by Butchers Near Me and are protected by:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Copyright laws</li>
                <li>Trademark laws</li>
                <li>Other intellectual property laws</li>
              </ul>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, or create derivative works of our content without explicit written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                <li>Warranties regarding the accuracy or reliability of any information obtained through the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the fullest extent permitted by law, Butchers Near Me shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits, revenues, or data</li>
                <li>Any damages arising from your use of or inability to use the Service</li>
                <li>Any damages resulting from third-party content or services</li>
              </ul>
              <p className="text-gray-700">
                Our total liability shall not exceed the amount you paid, if any, for accessing the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold harmless Butchers Near Me and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Breach of these Terms</li>
                <li>Violation of applicable laws</li>
                <li>Fraudulent, abusive, or harmful behavior</li>
              </ul>
              <p className="text-gray-700">
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Butchers Near Me</strong><br />
                  Email: legal@butchersnearme.co.uk<br />
                  Website: <Link href="/" className="text-red-600 hover:underline">butchersnearme.co.uk</Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}