"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { employerApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BriefcaseIcon,
  UserGroupIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface Job {
  id: number
  titre: string
  entreprise: string
  localisation: string
  salaire: number
  typeContrat: string
  modaliteTravail: string
  datePublication: string
  dateExpiration: string
  statut: string
  nombreCandidatures: number
}

interface Application {
  id: number
  candidatNom: string
  candidatPrenom: string
  candidatEmail: string
  jobOffreTitre: string
  statut: "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "PRESELECTIONNE" | "VUE" | "RETIREE" | "ENTRETIEN"
  dateCandidature: string
  scoreGlobal?: number
  lettreMotivation?: string
}

export default function EmployerDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobApplications, setJobApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<
    "ACCEPTE" | "REFUSE" | "EN_ATTENTE" | "PRESELECTIONNE" | "VUE" | "ENTRETIEN"
  >("EN_ATTENTE")
  const [comment, setComment] = useState("")

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "EMPLOYER") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "EMPLOYER") {
      fetchJobs()
    }
  }, [isAuthenticated, user])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await employerApi.getMyJobs({ page: 0, size: 20 })
      console.log("Jobs response:", response.data)

      if (response.data && response.data.jobOffers) {
        setJobs(response.data.jobOffers)
      } else if (response.data && Array.isArray(response.data)) {
        setJobs(response.data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Error loading jobs")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobApplications = async (jobId: number) => {
    try {
      setApplicationsLoading(true)
      const response = await employerApi.getJobApplications(jobId, { page: 0, size: 50 })
      console.log("Applications response:", response.data)

      if (response.data && response.data.applications) {
        setJobApplications(response.data.applications)
      } else if (response.data && Array.isArray(response.data)) {
        setJobApplications(response.data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Error loading applications")
    } finally {
      setApplicationsLoading(false)
    }
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    fetchJobApplications(job.id)
  }

  const handleStatusUpdate = async () => {
    if (!selectedApplication) return

    try {
      const updateData = {
        statut: newStatus,
        commentaireEmployeur: comment,
        commentairePublic: comment,
      }

      console.log("Updating application status:", updateData)

      await employerApi.updateApplicationStatus(selectedApplication.id, updateData)

      // Update local state
      setJobApplications(
        jobApplications.map((app) => (app.id === selectedApplication.id ? { ...app, statut: newStatus } : app)),
      )

      setStatusUpdateDialog(false)
      setSelectedApplication(null)
      setComment("")
      toast.success("Application status updated successfully!")
    } catch (error: any) {
      console.error("Error updating application status:", error)
      toast.error(error.response?.data?.message || "Error updating application status")
    }
  }

  const handleDownloadCV = async (applicationId: number) => {
    try {
      const response = await employerApi.downloadApplicationCV(applicationId)
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cv-application-${applicationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("CV downloaded successfully!")
    } catch (error: any) {
      console.error("Error downloading CV:", error)
      toast.error("Error downloading CV")
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      await employerApi.deleteJob(jobId)
      setJobs(jobs.filter((j) => j.id !== jobId))
      if (selectedJob?.id === jobId) {
        setSelectedJob(null)
        setJobApplications([])
      }
      toast.success("Job deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting job:", error)
      toast.error("Error deleting job")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTE":
        return "bg-green-100 text-green-800"
      case "REFUSE":
        return "bg-red-100 text-red-800"
      case "PRESELECTIONNE":
        return "bg-blue-100 text-blue-800"
      case "VUE":
        return "bg-gray-100 text-gray-800"
      case "ENTRETIEN":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "Pending"
      case "ACCEPTE":
        return "Accepted"
      case "REFUSE":
        return "Rejected"
      case "PRESELECTIONNE":
        return "Pre-selected"
      case "VUE":
        return "Viewed"
      case "ENTRETIEN":
        return "Interview"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isAuthenticated || user?.role !== "EMPLOYER") {
    return null
  }

  // Calculate dashboard stats from existing data
  const dashboardStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => job.statut === "ACTIVE").length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.nombreCandidatures || 0), 0),
    pendingApplications: jobApplications.filter((app) => app.statut === "EN_ATTENTE").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and review applications</p>
          </div>
          <Link href="/jobs/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalJobs}</p>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <BriefcaseIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeJobs}</p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalApplications}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3 mr-4">
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingApplications}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Job Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Posts Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first job posting to start receiving applications</p>
                    <Link href="/jobs/create">
                      <Button className="bg-blue-600 hover:bg-blue-700">Post Your First Job</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedJob?.id === job.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleJobSelect(job)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">{job.titre}</h3>
                          <Badge variant="outline" className="text-xs">
                            {job.nombreCandidatures || 0} apps
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {job.localisation}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDate(job.datePublication)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex space-x-1">
                            <Link href={`/jobs/${job.id}`}>
                              <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/jobs/${job.id}/edit`}>
                              <Button variant="outline" size="sm" className="text-xs h-7 bg-transparent">
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteJob(job.id)
                            }}
                            className="text-red-600 hover:text-red-700 bg-transparent text-xs h-7"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications for Selected Job */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedJob ? `Applications for "${selectedJob.titre}"` : "Select a job to view applications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedJob ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a job from the list to view its applications</p>
                  </div>
                ) : applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : jobApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600">Applications for this job will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {application.candidatPrenom} {application.candidatNom}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(application.dateCandidature)}
                              </div>
                              {application.scoreGlobal && (
                                <div className="flex items-center">
                                  <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                                  {Math.round(application.scoreGlobal * 100)}% match
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(application.statut)}>
                            {getStatusLabel(application.statut)}
                          </Badge>
                        </div>

                        {application.lettreMotivation && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700 line-clamp-3">{application.lettreMotivation}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">{application.candidatEmail}</div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownloadCV(application.id)}>
                              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                              Download CV
                            </Button>
                            <Dialog
                              open={statusUpdateDialog && selectedApplication?.id === application.id}
                              onOpenChange={setStatusUpdateDialog}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(application)
                                    setNewStatus(application.statut)
                                  }}
                                >
                                  Update Status
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Application Status</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="EN_ATTENTE">Pending</SelectItem>
                                        <SelectItem value="VUE">Viewed</SelectItem>
                                        <SelectItem value="PRESELECTIONNE">Pre-selected</SelectItem>
                                        <SelectItem value="ENTRETIEN">Interview</SelectItem>
                                        <SelectItem value="ACCEPTE">Accept</SelectItem>
                                        <SelectItem value="REFUSE">Reject</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Comment (Optional)
                                    </label>
                                    <Textarea
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                      placeholder="Add a comment for the candidate..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex space-x-3">
                                    <Button onClick={handleStatusUpdate} className="flex-1">
                                      Update Status
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setStatusUpdateDialog(false)
                                        setSelectedApplication(null)
                                      }}
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
