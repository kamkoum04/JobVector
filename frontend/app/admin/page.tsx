"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { adminApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN"
  active: boolean
  dateInscription: string
}

interface Job {
  id: number
  titre: string
  entreprise: string
  localisation: string
  salaire: number
  statut: string
  datePublication: string
  employeurNom: string
  employeurPrenom: string
}

interface Application {
  id: number
  candidatNom: string
  candidatPrenom: string
  candidatEmail: string
  jobOffreTitre: string
  statut: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE"
  dateCandidature: string
  employeurNom: string
  employeurPrenom: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobModerationDialog, setJobModerationDialog] = useState(false)
  const [moderationAction, setModerationAction] = useState<"approve" | "reject">("approve")
  const [moderationComment, setModerationComment] = useState("")

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [usersResponse, jobsResponse, applicationsResponse] = await Promise.all([
        adminApi.getUsers({ page: 0, size: 20 }),
        adminApi.getJobsForModeration({ page: 0, size: 20 }),
        adminApi.getAllApplications({ page: 0, size: 20 }),
      ])

      setUsers(usersResponse.data.users || [])
      setJobs(jobsResponse.data.jobs || [])
      setApplications(applicationsResponse.data.applications || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard stats from existing data
  const dashboardStats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.active).length,
    totalCandidates: users.filter((user) => user.role === "CANDIDATE").length,
    totalEmployers: users.filter((user) => user.role === "EMPLOYER").length,
    totalJobs: jobs.length,
    pendingJobs: jobs.filter((job) => job.statut === "PENDING").length,
    approvedJobs: jobs.filter((job) => job.statut === "APPROVED").length,
    rejectedJobs: jobs.filter((job) => job.statut === "REJECTED").length,
    totalApplications: applications.length,
    pendingApplications: applications.filter((app) => app.statut === "EN_ATTENTE").length,
    acceptedApplications: applications.filter((app) => app.statut === "ACCEPTEE").length,
    rejectedApplications: applications.filter((app) => app.statut === "REFUSEE").length,
  }

  const handleUserStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, { active: !currentStatus })
      setUsers(users.map((user) => (user.id === userId ? { ...user, active: !currentStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await adminApi.deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleJobModeration = async () => {
    if (!selectedJob) return

    try {
      if (moderationAction === "approve") {
        await adminApi.approveJob(selectedJob.id, {
          approved: true,
          comments: moderationComment,
        })
      } else {
        await adminApi.rejectJob(selectedJob.id, {
          reason: moderationComment,
        })
      }

      // Update local state
      setJobs(
        jobs.map((job) =>
          job.id === selectedJob.id
            ? { ...job, statut: moderationAction === "approve" ? "APPROVED" : "REJECTED" }
            : job,
        ),
      )

      setJobModerationDialog(false)
      setSelectedJob(null)
      setModerationComment("")
    } catch (error) {
      console.error("Error moderating job:", error)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      await adminApi.deleteJob(jobId)
      setJobs(jobs.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error("Error deleting job:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
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
      case "PENDING":
        return "Pending"
      case "APPROVED":
        return "Approved"
      case "REJECTED":
        return "Rejected"
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

  const filteredUsers = users.filter(
    (user) =>
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredJobs = jobs.filter(
    (job) =>
      job.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.localisation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, moderate content, and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : dashboardStats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
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
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : dashboardStats.totalJobs}</p>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : dashboardStats.totalApplications}
                  </p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3 mr-4">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : dashboardStats.pendingJobs}</p>
                  <p className="text-sm text-gray-600">Pending Moderation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users, jobs, or applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="jobs">Job Moderation</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
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
                ) : filteredUsers.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-600">Try adjusting your search criteria</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {user.prenom} {user.nom}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {user.role}
                                </Badge>
                                <span>Joined {formatDate(user.dateInscription)}</span>
                              </div>
                            </div>
                            <Badge className={user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {user.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserStatusToggle(user.id, user.active)}
                              className={
                                user.active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                              }
                            >
                              {user.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Job Moderation</h2>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
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
                ) : filteredJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                      <p className="text-gray-600">Try adjusting your search criteria</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.titre}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {job.entreprise} • {job.localisation} • {job.salaire.toLocaleString()} TND
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>
                                  Posted by: {job.employeurPrenom} {job.employeurNom}
                                </span>
                                <span>Date: {formatDate(job.datePublication)}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(job.statut)}>{getStatusLabel(job.statut)}</Badge>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {job.statut === "PENDING" && (
                              <Dialog open={jobModerationDialog} onOpenChange={setJobModerationDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedJob(job)
                                      setModerationAction("approve")
                                    }}
                                  >
                                    Moderate
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Moderate Job Posting</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                      <Select
                                        value={moderationAction}
                                        onValueChange={(value: any) => setModerationAction(value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="approve">Approve</SelectItem>
                                          <SelectItem value="reject">Reject</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {moderationAction === "approve" ? "Comments (Optional)" : "Rejection Reason"}
                                      </label>
                                      <Textarea
                                        value={moderationComment}
                                        onChange={(e) => setModerationComment(e.target.value)}
                                        placeholder={
                                          moderationAction === "approve"
                                            ? "Add any comments..."
                                            : "Please provide a reason for rejection..."
                                        }
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex space-x-3">
                                      <Button onClick={handleJobModeration} className="flex-1">
                                        {moderationAction === "approve" ? "Approve" : "Reject"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setJobModerationDialog(false)}
                                        className="flex-1"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Application Overview</h2>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
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
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                      <p className="text-gray-600">Applications will appear here as they are submitted</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 10).map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {application.candidatPrenom} {application.candidatNom}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">Applied for: {application.jobOffreTitre}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>
                                  Employer: {application.employeurPrenom} {application.employeurNom}
                                </span>
                                <span>Date: {formatDate(application.dateCandidature)}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(application.statut)}>
                              {getStatusLabel(application.statut)}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-500">{application.candidatEmail}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-medium text-green-600">{dashboardStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Candidates</span>
                    <span className="font-medium">{dashboardStats.totalCandidates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Employers</span>
                    <span className="font-medium">{dashboardStats.totalEmployers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved Jobs</span>
                    <span className="font-medium text-green-600">{dashboardStats.approvedJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Jobs</span>
                    <span className="font-medium text-yellow-600">{dashboardStats.pendingJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Job approved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">New user registered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Job rejected</span>
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
