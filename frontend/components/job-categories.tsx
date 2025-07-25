"use client"

import {
  CodeBracketIcon,
  ChartBarIcon,
  PaintBrushIcon,
  CogIcon,
  MegaphoneIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline"

const categories = [
  {
    name: "Technology",
    icon: CodeBracketIcon,
    count: 245,
    color: "bg-blue-100 text-blue-600",
    description: "Software development, IT, and tech roles",
  },
  {
    name: "Data & Analytics",
    icon: ChartBarIcon,
    count: 89,
    color: "bg-green-100 text-green-600",
    description: "Data science, analytics, and BI roles",
  },
  {
    name: "Design & Creative",
    icon: PaintBrushIcon,
    count: 67,
    color: "bg-purple-100 text-purple-600",
    description: "UX/UI design, graphic design, and creative roles",
  },
  {
    name: "Engineering",
    icon: CogIcon,
    count: 134,
    color: "bg-orange-100 text-orange-600",
    description: "Mechanical, civil, and industrial engineering",
  },
  {
    name: "Marketing & Sales",
    icon: MegaphoneIcon,
    count: 156,
    color: "bg-pink-100 text-pink-600",
    description: "Digital marketing, sales, and business development",
  },
  {
    name: "Human Resources",
    icon: UserGroupIcon,
    count: 78,
    color: "bg-indigo-100 text-indigo-600",
    description: "HR, recruitment, and people operations",
  },
  {
    name: "Finance & Accounting",
    icon: CurrencyDollarIcon,
    count: 92,
    color: "bg-yellow-100 text-yellow-600",
    description: "Finance, accounting, and investment roles",
  },
  {
    name: "Education & Training",
    icon: AcademicCapIcon,
    count: 54,
    color: "bg-red-100 text-red-600",
    description: "Teaching, training, and educational roles",
  },
]

export default function JobCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse Jobs by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Find opportunities in your field of expertise</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.name}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${category.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
