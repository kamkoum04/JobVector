"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { adminApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN"
  enabled: boolean
  cin: number
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

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
      const [usersResponse, jobsResponse] = await Promise.all([
        adminApi.getUsers({ page: 0, size: 50 }),
        adminApi.getJobs({ page: 0, size: 50 }),
      ])

      setUsers(usersResponse.data.utilisateursList || [])
      setJobs(jobsResponse.data.jobOffers || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard stats from existing data
  const dashboardStats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.enabled).length,
    totalCandidates: users.filter((user) => user.role === "CANDIDATE").length,
    totalEmployers: users.filter((user) => user.role === "EMPLOYER").length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => job.statut === "ACTIVE").length,
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
          <p className="text-gray-600">Manage users, jobs, and monitor platform activity</p>
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
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : dashboardStats.totalCandidates}</p>
                  <p className="text-sm text-gray-600">Candidates</p>
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
                  <p className="text-2xl font-bold text-gray-900">{loading ? "..." : dashboardStats.totalEmployers}</p>
                  <p className="text-sm text-gray-600">Employers</p>
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
              placeholder="Search users or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
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
                            <Badge className={user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {user.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Job Management</h2>
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
                            {job.entreprise} • {job.localisation} • {job.salaire?.toLocaleString()} TND
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              Posted by: {job.employeurPrenom} {job.employeurNom}
                            </span>
                            <span>Date: {formatDate(job.datePublication)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              job.statut === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {job.statut}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
