"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { candidateApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"

interface Job {
  id: number
  titre: string
  description: string
  localisation: string
  datePublication: string
  statut: string
  competencesTechniques: string
  competencesTransversales: string
  outilsTechnologies: string
  experienceMinRequise: number
  niveauEtudeMin: string
  languesRequises: string
  secteurActivite: string
  missionPrincipale: string
  responsabilites: string
  typePoste: string
  modaliteTravail: string
  entreprise: string
  typeContrat: string
  salaire: number
  experience: number
  employeurId: number
  employeurNom: string
  employeurPrenom: string
  employeurEmail: string
}

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      router.push("/login?redirect=/jobs")
      return
    }

    try {
      setFavoriteLoading(true)
      await candidateApi.addToFavorites(job.id)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setFavoriteLoading(false)
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
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardContent className="p-6">
        <Link href={`/jobs/${job.id}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {job.titre}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{job.entreprise}</span>
                </div>
              </div>

              {/* Favorite Button */}
              {isAuthenticated && user?.role === "CANDIDATE" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className="text-gray-400 hover:text-red-500"
                >
                  {isFavorite ? <HeartSolidIcon className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                </Button>
              )}
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{job.localisation}</span>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                <span>{job.salaire.toLocaleString()} TND</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>{job.typeContrat}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(job.datePublication)}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getWorkModeColor(job.modaliteTravail)}>{getWorkModeLabel(job.modaliteTravail)}</Badge>
              {job.typePoste && <Badge variant="secondary">{job.typePoste.replace("_", " ")}</Badge>}
              <Badge variant="outline">{job.experienceMinRequise}+ years exp</Badge>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">{truncateText(job.description, 150)}</p>

            {/* Skills Preview */}
            {job.competencesTechniques && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Key Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {job.competencesTechniques
                    .split(", ")
                    .slice(0, 4)
                    .map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  {job.competencesTechniques.split(", ").length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.competencesTechniques.split(", ").length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                by {job.employeurPrenom} {job.employeurNom}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="group-hover:bg-blue-50 group-hover:text-blue-600 bg-transparent"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
