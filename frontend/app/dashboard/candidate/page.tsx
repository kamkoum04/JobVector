"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import type { AppDispatch, RootState } from "@/store"
import { fetchMyApplications } from "@/store/slices/applicationsSlice"
import { candidateApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  StarIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

export default function CandidateDashboard() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { applications, loading } = useSelector((state: RootState) => state.applications)

  const [cvData, setCvData] = useState<any>(null)
  const [loadingCV, setLoadingCV] = useState(true)

  // Redirect if not authenticated or not a candidate
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "CANDIDATE") {
      dispatch(fetchMyApplications())
      checkCVStatus()
    }
  }, [dispatch, isAuthenticated, user])

  const checkCVStatus = async () => {
    try {
      setLoadingCV(true)
      const response = await candidateApi.getMyCV()
      if (response.data && response.data.statusCode === 200) {
        setCvData(response.data)
      }
    } catch (error) {
      console.log("No CV found")
    } finally {
      setLoadingCV(false)
    }
  }

  // Calculate dashboard stats from applications data
  const dashboardStats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter((app) => app.statut === "EN_ATTENTE").length,
    acceptedApplications: applications.filter((app) => app.statut === "ACCEPTEE").length,
    rejectedApplications: applications.filter((app) => app.statut === "REFUSEE").length,
    profileCompleteness: calculateProfileCompleteness(),
  }

  function calculateProfileCompleteness() {
    let completeness = 0
    const totalFields = 4

    // Basic user info (25% each)
    if (user?.nom) completeness += 25
    if (user?.prenom) completeness += 25
    if (user?.email) completeness += 25

    // CV uploaded (25%)
    if (cvData) completeness += 25

    return Math.min(completeness, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTEE":
        return "bg-green-100 text-green-800"
      case "REFUSEE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "Pending"
      case "ACCEPTEE":
        return "Accepted"
      case "REFUSEE":
        return "Rejected"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isAuthenticated || user?.role !== "CANDIDATE") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.prenom}!</h1>
          <p className="text-gray-600">Track your applications and discover new opportunities</p>
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
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.acceptedApplications}</p>
                  <p className="text-sm text-gray-600">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <ChartBarIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.rejectedApplications}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="applications">My Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                  <Link href="/jobs">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Apply to More Jobs
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-4">Start applying to jobs that match your profile</p>
                      <Link href="/jobs">
                        <Button className="bg-blue-600 hover:bg-blue-700">Browse Jobs</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.jobOffreTitre}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {application.jobOffreEntreprise} • {application.jobOffreLocalisation}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Applied {formatDate(application.dateCandidature)}
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(application.statut)}>
                              {getStatusLabel(application.statut)}
                            </Badge>
                          </div>

                          {application.lettreMotivation && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                              <p className="text-sm text-gray-700 line-clamp-2">{application.lettreMotivation}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">Status: {application.statutDescription}</div>
                            <Link href={`/jobs/${application.jobOffreId}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Job
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {applications.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline">View All Applications ({applications.length})</Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

          
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completeness</CardTitle>
                <CardDescription>Complete your profile to get better job matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{dashboardStats.profileCompleteness}%</span>
                  </div>
                  <Progress value={dashboardStats.profileCompleteness} className="h-2" />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Basic Info</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CV Upload</span>
                      <span className={cvData ? "text-green-600" : "text-gray-400"}>{cvData ? "✓" : "○"}</span>
                    </div>
                  </div>

                  {dashboardStats.profileCompleteness < 100 && (
                    <div className="pt-2">
                      {!cvData && (
                        <Link href="/cv-upload">
                          <Button size="sm" variant="outline" className="w-full mb-2 bg-transparent">
                            Upload CV
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Complete Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            

            {/* Application Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-medium">
                      {dashboardStats.totalApplications > 0
                        ? Math.round((dashboardStats.acceptedApplications / dashboardStats.totalApplications) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-medium">
                      {dashboardStats.totalApplications > 0
                        ? Math.round(
                            ((dashboardStats.acceptedApplications + dashboardStats.rejectedApplications) /
                              dashboardStats.totalApplications) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
