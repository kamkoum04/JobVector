import Link from "next/link"
import { MagnifyingGlassIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">JobVector</span>
            </Link>
            <p className="text-gray-300 text-sm">
              AI-powered job matching platform connecting talented professionals with their perfect career opportunities
              in Tunisia and beyond.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>Tunis, Tunisia</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+216 XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>contact@jobvector.tn</span>
              </div>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register?role=candidate" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/cv-upload" className="hover:text-white transition-colors">
                  Upload CV
                </Link>
              </li>
              <li>
                <Link href="/dashboard/candidate" className="hover:text-white transition-colors">
                  My Applications
                </Link>
              </li>
              <li>
                <Link href="/career-advice" className="hover:text-white transition-colors">
                  Career Advice
                </Link>
              </li>
              <li>
                <Link href="/salary-guide" className="hover:text-white transition-colors">
                  Salary Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/register?role=employer" className="hover:text-white transition-colors">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/dashboard/employer" className="hover:text-white transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/candidates" className="hover:text-white transition-colors">
                  Search Candidates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/recruiting-tips" className="hover:text-white transition-colors">
                  Recruiting Tips
                </Link>
              </li>
              <li>
                <Link href="/employer-resources" className="hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} JobVector. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
