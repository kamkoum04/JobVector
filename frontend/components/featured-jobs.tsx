"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { publicJobApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPinIcon, CurrencyDollarIcon, ClockIcon, CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

interface Job {
  id: number
  titre: string
  description: string
  localisation: string
  datePublication: string
  competencesTechniques: string
  entreprise: string
  typeContrat: string
  salaire: number
  modaliteTravail: string
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true)
      const response = await publicJobApi.getAllJobs({ page: 0, size: 6 })
      setJobs(response.data.jobOffers || [])
    } catch (error) {
      console.error("Error fetching featured jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWorkModeLabel = (mode: string) => {
    switch (mode) {
      case "REMOTE":
        return "Remote"
      case "HYBRIDE":
        return "Hybrid"
      case "PRESENTIEL":
        return "On-site"
      default:
        return mode
    }
  }

  const getWorkModeColor = (mode: string) => {
    switch (mode) {
      case "REMOTE":
        return "bg-green-100 text-green-800"
      case "HYBRIDE":
        return "bg-blue-100 text-blue-800"
      case "PRESENTIEL":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const truncateDescription = (description: string, maxLength = 120) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + "..."
  }

  const getSkills = (skillsString: string) => {
    if (!skillsString) return []
    return skillsString.split(", ").slice(0, 3) // Show only first 3 skills
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Job Opportunities</h2>
            <p className="text-lg text-gray-600">Discover the latest job openings from top companies in Tunisia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16" />
                      <div className="h-6 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Job Opportunities</h2>
          <p className="text-lg text-gray-600">Discover the latest job openings from top companies in Tunisia</p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No jobs available at the moment</div>
            <p className="text-gray-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{job.titre}</h3>
                        <p className="text-gray-600 font-medium mb-1">{job.entreprise}</p>
                      </div>
                      <Badge className={getWorkModeColor(job.modaliteTravail)}>
                        {getWorkModeLabel(job.modaliteTravail)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{job.localisation}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        <span>{job.salaire.toLocaleString()} TND/month</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{job.typeContrat}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{truncateDescription(job.description)}</p>

                    {job.competencesTechniques && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getSkills(job.competencesTechniques).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                        {job.competencesTechniques.split(", ").length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.competencesTechniques.split(", ").length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>Posted {formatDate(job.datePublication)}</span>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          View Details
                          <ArrowRightIcon className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="bg-transparent">
                  View All Jobs
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
