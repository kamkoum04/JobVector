"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { fetchJobs, searchJobsWithFilters, setFilters } from "@/store/slices/jobsSlice"
import JobCard from "@/components/job-card"
import JobFilters from "@/components/job-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { jobs, loading, totalElements, filters } = useSelector((state: RootState) => state.jobs)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    dispatch(fetchJobs({ page: 0, size: 12 }))
  }, [dispatch])

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      titre: searchTerm,
      page: 0,
      size: 12,
    }
    dispatch(searchJobsWithFilters(searchFilters))
    setCurrentPage(0)
  }

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))
    const searchFilters = {
      ...filters,
      ...newFilters,
      page: 0,
      size: 12,
    }
    dispatch(searchJobsWithFilters(searchFilters))
    setCurrentPage(0)
  }

  const loadMore = () => {
    const nextPage = currentPage + 1
    const searchFilters = {
      ...filters,
      titre: searchTerm,
      page: nextPage,
      size: 12,
    }
    dispatch(searchJobsWithFilters(searchFilters))
    setCurrentPage(nextPage)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Job</h1>
          <p className="text-gray-600 mb-6">
            Discover {totalElements.toLocaleString()} job opportunities that match your skills
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6">
              Search
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 px-6 lg:hidden">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <JobFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            {jobs.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No jobs found</div>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Load More Button */}
                {jobs.length < totalElements && (
                  <div className="text-center">
                    <Button onClick={loadMore} disabled={loading} variant="outline" size="lg">
                      {loading ? "Loading..." : "Load More Jobs"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
