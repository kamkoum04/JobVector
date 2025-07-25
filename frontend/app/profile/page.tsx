"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { userApi, candidateApi, employerApi, authApi } from "@/lib/api"
import { User, FileText, Shield, Trash2, Upload, AlertCircle, CheckCircle, Save } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { toast } from "sonner"

interface UserProfile {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  cin: number
  enabled: boolean
}

interface CVData {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  adresse?: string
  competencesTechniques?: string
  competencesTransversales?: string
  experienceAnnees?: number
  niveauEtude?: string
  formations?: string
  resumeProfessionnel?: string
}

interface CandidateProfile {
  telephone?: string
  adresse?: string
  dateNaissance?: string
  competences?: string
  experience?: string
  formation?: string
}

interface EmployerProfile {
  entreprise?: string
  secteurActivite?: string
  taille?: string
  siteWeb?: string
  description?: string
  adresse?: string
  telephone?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({})
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile>({})
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileCompletion, setProfileCompletion] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadProfileData()
  }, [isAuthenticated, router])

  useEffect(() => {
    calculateProfileCompletion()
  }, [userProfile, candidateProfile, employerProfile, cvData])

  const loadProfileData = async () => {
    try {
      setLoading(true)

      // Load basic user profile
      const userRes = await userApi.getProfile()
      console.log("User profile response:", userRes.data)

      if (userRes.data && userRes.data.statusCode === 200) {
        setUserProfile(userRes.data.utilisateurs)
      } else if (userRes.data && userRes.data.utilisateurs) {
        // Handle case where response structure might be different
        setUserProfile(userRes.data.utilisateurs)
      }

      // Load role-specific data
      if (user?.role === "CANDIDATE") {
        try {
          // Try to get candidate profile
          const candidateRes = await candidateApi.getProfile()
          if (candidateRes.data) {
            setCandidateProfile(candidateRes.data)
          }
        } catch (error) {
          console.log("No candidate profile found, using defaults")
        }

        try {
          // Try to get CV data
          const cvRes = await candidateApi.getMyCV()
          console.log("CV response:", cvRes.data)
          if (cvRes.data) {
            setCvData(cvRes.data)
          }
        } catch (error) {
          console.log("No CV found")
        }
      } else if (user?.role === "EMPLOYER") {
        try {
          const employerRes = await employerApi.getProfile()
          if (employerRes.data) {
            setEmployerProfile(employerRes.data)
          }
        } catch (error) {
          console.log("No employer profile found, using defaults")
        }
      }
    } catch (error: any) {
      console.error("Error loading profile data:", error)
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        router.push("/login")
      } else {
        toast.error("Error loading profile data")
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompletion = () => {
    if (!userProfile) return

    let totalFields = 3 // nom, prenom, email
    let completedFields = 0

    if (userProfile.nom) completedFields++
    if (userProfile.prenom) completedFields++
    if (userProfile.email) completedFields++

    if (user?.role === "CANDIDATE") {
      totalFields += 6 // telephone, adresse, dateNaissance, competences, experience, formation
      if (candidateProfile.telephone) completedFields++
      if (candidateProfile.adresse) completedFields++
      if (candidateProfile.dateNaissance) completedFields++
      if (candidateProfile.competences) completedFields++
      if (candidateProfile.experience) completedFields++
      if (candidateProfile.formation) completedFields++

      totalFields += 1 // CV
      if (cvData) completedFields++
    } else if (user?.role === "EMPLOYER") {
      totalFields += 7 // entreprise, secteurActivite, taille, siteWeb, description, adresse, telephone
      if (employerProfile.entreprise) completedFields++
      if (employerProfile.secteurActivite) completedFields++
      if (employerProfile.taille) completedFields++
      if (employerProfile.siteWeb) completedFields++
      if (employerProfile.description) completedFields++
      if (employerProfile.adresse) completedFields++
      if (employerProfile.telephone) completedFields++
    }

    setProfileCompletion(Math.round((completedFields / totalFields) * 100))
  }

  const handleUpdateProfile = async () => {
    if (!userProfile) return

    try {
      setSaving(true)

      // Create the update data object matching backend expectations
      const updateData = {
        nom: userProfile.nom,
        prenom: userProfile.prenom,
        email: userProfile.email,
        cin: userProfile.cin,
        role: userProfile.role,
      }

      console.log("Updating profile with data:", updateData)
      const response = await userApi.updateProfile(updateData)
      console.log("Update response:", response.data)

      if (response.data && (response.data.statusCode === 200 || response.data.utilisateurs)) {
        toast.success("Profile updated successfully!")
        // Update local state with response data
        if (response.data.utilisateurs) {
          setUserProfile(response.data.utilisateurs)
        }
      } else {
        throw new Error(response.data?.message || "Update failed")
      }

      // Update role-specific profile if needed
      if (user?.role === "CANDIDATE" && Object.keys(candidateProfile).length > 0) {
        try {
          await candidateApi.updateProfile(candidateProfile)
        } catch (error) {
          console.log("Candidate profile update not available")
        }
      } else if (user?.role === "EMPLOYER" && Object.keys(employerProfile).length > 0) {
        try {
          await employerApi.updateProfile(employerProfile)
        } catch (error) {
          console.log("Employer profile update not available")
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.response?.data?.message || "Error updating profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB")
      return
    }

    if (!file.type.includes("pdf")) {
      toast.error("Only PDF files are accepted")
      return
    }

    try {
      setUploading(true)
      const response = await candidateApi.uploadCV(file)
      console.log("CV upload response:", response.data)

      toast.success("CV uploaded successfully!")

      // Reload profile data to get updated CV info
      setTimeout(() => {
        loadProfileData()
      }, 1000)
    } catch (error: any) {
      console.error("Error uploading CV:", error)
      toast.error(error.response?.data?.message || "Error uploading CV")
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Password changed successfully!")
      setShowPasswordDialog(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.response?.data?.message || "Error changing password")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount()
      toast.success("Account deleted successfully!")
      localStorage.clear()
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast.error(error.response?.data?.message || "Error deleting account")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Profile Not Found</h1>
          <p className="text-gray-600 mt-2">Unable to load profile data. Please try logging in again.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and settings</p>
        </div>
        <Badge variant={profileCompletion === 100 ? "default" : "secondary"}>
          Profile {profileCompletion}% complete
        </Badge>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>A complete profile improves your chances of being found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          {user?.role === "CANDIDATE" && <TabsTrigger value="documents">Documents</TabsTrigger>}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">First Name</Label>
                  <Input
                    id="prenom"
                    value={userProfile?.prenom || ""}
                    onChange={(e) => setUserProfile((prev) => (prev ? { ...prev, prenom: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Last Name</Label>
                  <Input
                    id="nom"
                    value={userProfile?.nom || ""}
                    onChange={(e) => setUserProfile((prev) => (prev ? { ...prev, nom: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile?.email || ""}
                    onChange={(e) => setUserProfile((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={userProfile?.role || ""} disabled />
                </div>
              </div>

              {user?.role === "CANDIDATE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Phone</Label>
                    <Input
                      id="telephone"
                      value={candidateProfile.telephone || ""}
                      onChange={(e) => setCandidateProfile((prev) => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date of Birth</Label>
                    <Input
                      id="dateNaissance"
                      type="date"
                      value={candidateProfile.dateNaissance || ""}
                      onChange={(e) => setCandidateProfile((prev) => ({ ...prev, dateNaissance: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="adresse">Address</Label>
                    <Input
                      id="adresse"
                      value={candidateProfile.adresse || ""}
                      onChange={(e) => setCandidateProfile((prev) => ({ ...prev, adresse: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {user?.role === "EMPLOYER" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Company Name</Label>
                    <Input
                      id="entreprise"
                      value={employerProfile.entreprise || ""}
                      onChange={(e) => setEmployerProfile((prev) => ({ ...prev, entreprise: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secteurActivite">Industry</Label>
                    <Input
                      id="secteurActivite"
                      value={employerProfile.secteurActivite || ""}
                      onChange={(e) => setEmployerProfile((prev) => ({ ...prev, secteurActivite: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Phone</Label>
                    <Input
                      id="telephone"
                      value={employerProfile.telephone || ""}
                      onChange={(e) => setEmployerProfile((prev) => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Address</Label>
                    <Input
                      id="adresse"
                      value={employerProfile.adresse || ""}
                      onChange={(e) => setEmployerProfile((prev) => ({ ...prev, adresse: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleUpdateProfile} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab (Candidates only) */}
        {user?.role === "CANDIDATE" && (
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management
                </CardTitle>
                <CardDescription>Upload and manage your CV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cvData ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">CV Information</h3>
                          <p className="text-sm text-gray-600">
                            {cvData.nom} {cvData.prenom} • {cvData.experienceAnnees || 0} years experience
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Email:</strong> {cvData.email || "N/A"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {cvData.telephone || "N/A"}
                        </p>
                        <p>
                          <strong>Address:</strong> {cvData.adresse || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Education:</strong> {cvData.niveauEtude || "N/A"}
                        </p>
                        <p>
                          <strong>Experience:</strong> {cvData.experienceAnnees || 0} years
                        </p>
                      </div>
                    </div>

                    {cvData.competencesTechniques && (
                      <div className="mt-4">
                        <p className="text-sm">
                          <strong>Technical Skills:</strong> {cvData.competencesTechniques}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCVUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <Button disabled={uploading} variant="outline">
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Update CV
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No CV uploaded</h3>
                    <p className="text-gray-600 mb-4">Upload your CV to apply for job offers</p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleCVUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button disabled={uploading}>
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CV
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Accepted formats: PDF (max 5MB)</p>
                  </div>
                )}

                {!cvData && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      A CV is required to apply for job offers. Upload your CV to complete your profile.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600">Last modified: some time ago</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and choose a new password</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordChange}>Change Password</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div>
                    <h3 className="font-medium text-red-600">Danger Zone</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account and all your data</p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          This action is irreversible. All your data will be permanently deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Are you absolutely sure you want to delete your account? This action cannot be undone.
                        </AlertDescription>
                      </Alert>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          Yes, delete my account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
