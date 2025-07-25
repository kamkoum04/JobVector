import { Suspense } from "react"
import Hero from "@/components/hero"
import FeaturedJobs from "@/components/featured-jobs"
import JobCategories from "@/components/job-categories"
import Statistics from "@/components/statistics"
import CompanyLogos from "@/components/company-logos"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
        <FeaturedJobs />
      </Suspense>
      <JobCategories />
      <Statistics />
      <CompanyLogos />
    </div>
  )
}
