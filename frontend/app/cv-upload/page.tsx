"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { candidateApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface CVData {
  id: number
  fichierPath: string
  texteExtrait: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  linkedinUrl: string
  competencesTechniques: string
  competencesTransversales: string
  experienceAnnees: number
  niveauEtude: string
  langues: string
  formations: string
  certifications: string
  projets: string
  pointsForts: string
  resumeProfessionnel: string
  dateCreation: string
  dateModification: string
  embeddingGenerated: boolean
  embeddingSize: number
  motsClesGeneres: string
}

export default function CVUploadPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [existingCV, setExistingCV] = useState<CVData | null>(null)
  const [loadingCV, setLoadingCV] = useState(true)
  const [processingJobId, setProcessingJobId] = useState<number | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>("")

  // Redirect if not authenticated or not a candidate
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "CANDIDATE") {
      checkExistingCV()
    }
  }, [isAuthenticated, user])

  const checkExistingCV = async () => {
    try {
      setLoadingCV(true)
      const response = await candidateApi.getMyCV()
      console.log("CV Response:", response.data)

      if (response.data && response.data.id) {
        setExistingCV(response.data)
      }
    } catch (error) {
      console.log("No existing CV found")
    } finally {
      setLoadingCV(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    setError(null)

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, or DOCX file")
      return
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(10)
      setProcessingStatus("Uploading CV file...")

      const response = await candidateApi.uploadCV(file)
      
      setUploadProgress(20)
      
      if (response.data && response.data.jobId) {
        const jobId = response.data.jobId
        setProcessingJobId(jobId)
        setProcessingStatus(response.data.statusDetails || "Processing started...")
        
        toast.success("CV uploaded! Processing in background...")
        
        // Start polling for job status
        pollJobStatus(jobId)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to upload CV. Please try again.")
      toast.error("Failed to upload CV")
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const pollJobStatus = async (jobId: number) => {
    const maxPolls = 360 // Poll for up to 12 minutes (360 * 2 seconds)
    let pollCount = 0

    const pollInterval = setInterval(async () => {
      try {
        pollCount++
        const response = await candidateApi.getCVJobStatus(jobId)
        const jobData = response.data

        setProcessingStatus(jobData.statusDetails || "Processing...")
        
        // Update progress based on status
        if (jobData.status === "PENDING") {
          setUploadProgress(25)
        } else if (jobData.status === "PROCESSING") {
          // Gradually increase progress during processing
          setUploadProgress((prev) => Math.min(prev + 2, 90))
        } else if (jobData.status === "COMPLETED") {
          setUploadProgress(100)
          clearInterval(pollInterval)
          
          // Job completed successfully
          setSuccess(true)
          toast.success("CV processed successfully!")
          
          // Wait a moment then refresh CV data
          setTimeout(() => {
            checkExistingCV()
            setSuccess(false)
            setFile(null)
            setUploadProgress(0)
            setUploading(false)
            setProcessingJobId(null)
            setProcessingStatus("")
          }, 2000)
        } else if (jobData.status === "FAILED") {
          clearInterval(pollInterval)
          setError(jobData.errorMessage || "CV processing failed")
          toast.error("CV processing failed")
          setUploading(false)
          setUploadProgress(0)
          setProcessingJobId(null)
          setProcessingStatus("")
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setError("Processing is taking longer than expected. Please check back later.")
          toast.warning("Processing is taking longer than expected")
          setUploading(false)
        }
      } catch (error) {
        console.error("Error polling job status:", error)
      }
    }, 2000) // Poll every 2 seconds
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const handleUpdateCV = () => {
    const fileInput = document.getElementById("cv-file-input") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleDeleteCV = async () => {
    if (!confirm("Are you sure you want to delete your CV?")) return

    try {
      await candidateApi.deleteCV()
      toast.success("CV deleted successfully!")
      setExistingCV(null)
    } catch (error) {
      toast.error("Error deleting CV")
    }
  }

  if (!isAuthenticated || user?.role !== "CANDIDATE") {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Uploaded Successfully!</h2>
            <p className="text-gray-600 mb-6">Your CV has been processed and analyzed by our AI system.</p>
            <div className="animate-pulse">
              <p className="text-sm text-blue-600">Processing CV data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">CV Management</h1>
          <p className="text-lg text-gray-600">
            Upload your CV to get AI-powered job recommendations and apply for positions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  {existingCV ? "Update Your CV" : "Upload Your CV"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {existingCV && !loadingCV && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      You have a CV uploaded and processed. Upload a new one to replace it.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : file
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-4">
                      <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex justify-center space-x-3">
                        <Button onClick={handleUpload} disabled={uploading} className="bg-green-600 hover:bg-green-700">
                          {uploading ? "Uploading..." : "Upload CV"}
                        </Button>
                        <Button onClick={removeFile} variant="outline" disabled={uploading}>
                          Remove File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {dragActive ? "Drop your CV here" : "Drag and drop your CV here"}
                        </p>
                        <p className="text-gray-600">or click to browse files</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload">
                        <Button onClick={handleUpdateCV}  type="button" variant="outline" className="cursor-pointer bg-transparent">
                          Choose File
                        </Button>
                        
                      </label>
                      <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-blue-700">{processingStatus}</span>
                      <span className="text-blue-600">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-600 text-center">
                      {uploadProgress < 30
                        ? "Uploading file..."
                        : uploadProgress < 90
                          ? "AI is analyzing your CV... This may take up to 10 minutes."
                          : "Finalizing..."}
                    </p>
                  </div>
                )}

                {/* Hidden file input for updates */}
                <input
                  id="cv-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>

          {/* CV Information Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your CV Information</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCV ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : existingCV ? (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Personal Information</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <p>
                          <strong>Name:</strong> {existingCV.nom} {existingCV.prenom}
                        </p>
                        <p>
                          <strong>Email:</strong> {existingCV.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {existingCV.telephone}
                        </p>
                        <p>
                          <strong>Address:</strong> {existingCV.adresse}
                        </p>
                        {existingCV.linkedinUrl && (
                          <p>
                            <strong>LinkedIn:</strong> {existingCV.linkedinUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Professional Summary */}
                    {existingCV.resumeProfessionnel && (
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BriefcaseIcon className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Professional Summary</h3>
                        </div>
                        <p className="text-sm text-gray-700">{existingCV.resumeProfessionnel}</p>
                      </div>
                    )}

                    {/* Experience & Education */}
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Experience & Education</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <p>
                          <strong>Experience:</strong> {existingCV.experienceAnnees} years
                        </p>
                        <p>
                          <strong>Education Level:</strong> {existingCV.niveauEtude}
                        </p>
                        <p>
                          <strong>Languages:</strong> {existingCV.langues}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <StarIcon className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-gray-900">Skills</h3>
                      </div>
                      <div className="space-y-3">
                        {existingCV.competencesTechniques && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Technical Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {existingCV.competencesTechniques
                                .split(", ")
                                .slice(0, 6)
                                .map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill.trim()}
                                  </Badge>
                                ))}
                              {existingCV.competencesTechniques.split(", ").length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{existingCV.competencesTechniques.split(", ").length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {existingCV.competencesTransversales && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Soft Skills:</p>
                            <p className="text-sm text-gray-600">{existingCV.competencesTransversales}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-3">
                      {existingCV.formations && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Education:</p>
                          <p className="text-sm text-gray-600">{existingCV.formations}</p>
                        </div>
                      )}

                      {existingCV.certifications && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Certifications:</p>
                          <p className="text-sm text-gray-600">{existingCV.certifications}</p>
                        </div>
                      )}

                      {existingCV.projets && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Projects:</p>
                          <p className="text-sm text-gray-600">{existingCV.projets}</p>
                        </div>
                      )}
                    </div>

                    {/* AI Processing Status */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">AI Processing Complete</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Embedding generated • {existingCV.embeddingSize} dimensions • Keywords extracted
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                
                      <Button
                        variant="outline"
                        onClick={handleDeleteCV}
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete CV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No CV uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-2">Upload your CV to see extracted information here</p>
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
