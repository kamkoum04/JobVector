"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { fetchJobById } from "@/store/slices/jobsSlice"
import { candidateApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { currentJob, loading } = useSelector((state: RootState) => state.jobs)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const [motivationLetter, setMotivationLetter] = useState("")
  const [applying, setApplying] = useState(false)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchJobById(Number(params.id)))
    }
  }, [dispatch, params.id])

  // Check if user has already applied
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isAuthenticated || !params.id || user?.role !== "CANDIDATE") return
      
      try {
        const response = await candidateApi.getMyApplications()
        
        // Handle different response structures
        let applications = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            applications = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            applications = response.data.content
          } else if (response.data.data && Array.isArray(response.data.data)) {
            applications = response.data.data
          }
        }
        
        const hasAppliedToJob = applications.some((app: any) => 
          app.jobOffreId === Number(params.id) || app.jobId === Number(params.id)
        )
        setHasApplied(hasAppliedToJob)
      } catch (error) {
        console.error("Error checking application status:", error)
        // Don't show error to user for this check
      }
    }

    checkApplicationStatus()
  }, [isAuthenticated, params.id, user?.role])

  const handleApply = async () => {
    if (!currentJob) return

    if (hasApplied) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this job.",
        variant: "default",
      })
      return
    }

    try {
      setApplying(true)
      await candidateApi.applyForJob(currentJob.id, { 
        lettreMotivation: motivationLetter 
      })

      setHasApplied(true)
      setShowApplicationDialog(false)
      setMotivationLetter("")
      
      toast({
        title: "Application Submitted! 🎉",
        description: "Your application has been submitted successfully. The employer will review it soon.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error applying for job:", error)
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || ""
        if (errorMessage.includes("already applied") || errorMessage.includes("déjà postulé")) {
          setHasApplied(true)
          toast({
            title: "Already Applied",
            description: "You have already applied to this job.",
            variant: "default",
          })
        } else {
          toast({
            title: "Application Failed",
            description: errorMessage || "Failed to submit application. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Application Failed",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setApplying(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${currentJob?.titre} at ${currentJob?.entreprise}`,
      text: `Check out this job opportunity: ${currentJob?.titre} at ${currentJob?.entreprise}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied!",
          description: "Job link has been copied to your clipboard.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Share Failed",
        description: "Unable to share the job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFavoriteToggle = async () => {
    if (!currentJob || !isAuthenticated || user?.role !== "CANDIDATE") return

    try {
      setFavoriteLoading(true)
      await candidateApi.addToFavorites(currentJob.id)
      setIsFavorite(!isFavorite)
      
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: isFavorite 
          ? "Job removed from your favorites list." 
          : "Job added to your favorites list.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
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
    return new Date(dateString).toLocaleDateString()
  }

  const renderApplicationButton = () => {
    if (!isAuthenticated) {
      return (
        <Button
          onClick={() => router.push("/register?role=candidate")}
          size="lg"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          Register to Apply
        </Button>
      )
    }

    if (user?.role !== "CANDIDATE") {
      return null
    }

    if (hasApplied) {
      return (
        <Button
          size="lg"
          disabled
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 cursor-not-allowed"
        >
          <span className="mr-2">✅</span>
          Applied
        </Button>
      )
    }

    return (
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            Apply Now
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {currentJob?.titre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivation Letter (Optional)</label>
              <Textarea
                value={motivationLetter}
                onChange={(e) => setMotivationLetter(e.target.value)}
                placeholder="Tell the employer why you're interested in this position..."
                rows={4}
                className="w-full"
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleApply} 
                disabled={applying} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {applying ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowApplicationDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/jobs")}>Browse All Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentJob.titre}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">{currentJob.entreprise}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{currentJob.localisation}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    <span>{currentJob.salaire.toLocaleString()} TND/month</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{currentJob.typeContrat}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Posted {formatDate(currentJob.datePublication)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className={getWorkModeColor(currentJob.modaliteTravail)}>
                    {getWorkModeLabel(currentJob.modaliteTravail)}
                  </Badge>
                  {currentJob.typePoste && <Badge variant="secondary">{currentJob.typePoste.replace("_", " ")}</Badge>}
                  <Badge variant="outline">{currentJob.experienceMinRequise}+ years experience</Badge>
                </div>
              </div>

              <div className="lg:ml-8 mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
                {isAuthenticated && user?.role === "CANDIDATE" && (
                  <Button
                    variant="outline"
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className="flex items-center bg-transparent"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-4 w-4 mr-2 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4 mr-2" />
                    )}
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="flex items-center bg-transparent"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {renderApplicationButton()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{currentJob.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Mission & Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Mission & Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentJob.missionPrincipale && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Main Mission</h3>
                    <p className="text-gray-600">{currentJob.missionPrincipale}</p>
                  </div>
                )}
                {currentJob.responsabilites && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Key Responsibilities</h3>
                    <p className="text-gray-600 whitespace-pre-line">{currentJob.responsabilites}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentJob.competencesTechniques && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.competencesTechniques.split(", ").map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentJob.competencesTransversales && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.competencesTransversales.split(", ").map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-600">Minimum {currentJob.experienceMinRequise} years of experience</p>
                </div>

                {currentJob.niveauEtudeMin && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                    <p className="text-gray-600">{currentJob.niveauEtudeMin.replace("_", " ").replace("PLUS", "+")}</p>
                  </div>
                )}

                {currentJob.languesRequises && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
                    <p className="text-gray-600">{currentJob.languesRequises}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tools & Technologies */}
            {currentJob.outilsTechnologies && (
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentJob.outilsTechnologies.split(", ").map((tool, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                        {tool.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-medium">{currentJob.entreprise}</span>
                </div>
                {currentJob.secteurActivite && (
                  <div className="text-sm text-gray-600">Industry: {currentJob.secteurActivite}</div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Contact: {currentJob.employeurPrenom} {currentJob.employeurNom}
                  </div>
                  <div className="text-sm text-gray-500">{currentJob.employeurEmail}</div>
                </div>
              </CardContent>
            </Card>

            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type:</span>
                  <span className="font-medium">{currentJob.typePoste?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Mode:</span>
                  <span className="font-medium">{getWorkModeLabel(currentJob.modaliteTravail)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-medium">{currentJob.typeContrat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium">{currentJob.salaire.toLocaleString()} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{currentJob.experienceMinRequise}+ years</span>
                </div>
              </CardContent>
            </Card>

            {/* Apply Again */}
            <Card>
              <CardContent className="p-4">{renderApplicationButton()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
