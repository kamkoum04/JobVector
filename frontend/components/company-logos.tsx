"use client"

import Image from "next/image"

const companies = [
  { name: "TechCorp", logo: "/placeholder.svg?height=60&width=120" },
  { name: "DataFlow Inc", logo: "/placeholder.svg?height=60&width=120" },
  { name: "StartupX", logo: "/placeholder.svg?height=60&width=120" },
  { name: "DesignStudio", logo: "/placeholder.svg?height=60&width=120" },
  { name: "CloudTech", logo: "/placeholder.svg?height=60&width=120" },
  { name: "WebSolutions", logo: "/placeholder.svg?height=60&width=120" },
  { name: "InnovateLab", logo: "/placeholder.svg?height=60&width=120" },
  { name: "FinanceHub", logo: "/placeholder.svg?height=60&width=120" },
]

export default function CompanyLogos() {
  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Companies</h2>
          <p className="text-lg text-gray-600">
            Join the companies that are already finding great talent through JobVector
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={company.logo || "/placeholder.svg"}
                alt={`${company.name} logo`}
                width={120}
                height={60}
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Want to post jobs and find great candidates?</p>
          <div className="space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Post a Job
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
