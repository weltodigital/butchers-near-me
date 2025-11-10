export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this page, the Next.js app is working correctly!
        </p>
        <div className="mt-4">
          <a
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}