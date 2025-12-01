"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { employerApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

interface JobFormData {
  titre: string
  description: string
  localisation: string
  entreprise: string
  typeContrat: string
  salaire: number
  experience: number
  competencesTechniques: string
  competencesTransversales: string
  experienceMinRequise: number
  experienceMaxSouhaitee: number
  niveauEtudeMin: string
  languesRequises: string
  secteurActivite: string
  missionPrincipale: string
  responsabilites: string
  outilsTechnologies: string
  typePoste: string
  modaliteTravail: string
  niveauSeniorite: string
  dateExpiration: string
  motsClesGeneres: string
}

// Define enums based on your backend model
const TYPE_POSTE_OPTIONS = [
  { value: "TECHNIQUE", label: "Technical" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "COMMERCIAL", label: "Sales" },
  { value: "RH", label: "Human Resources" },
  { value: "FINANCE", label: "Finance" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SUPPORT", label: "Support" },
]

const MODALITE_TRAVAIL_OPTIONS = [
  { value: "PRESENTIEL", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRIDE", label: "Hybrid" },
]

const NIVEAU_ETUDE_OPTIONS = [
  { value: "AUCUN", label: "No specific requirement" },
  { value: "BAC", label: "High School" },
  { value: "BAC_PLUS_2", label: "BAC+2" },
  { value: "BAC_PLUS_3", label: "BAC+3" },
  { value: "BAC_PLUS_5", label: "BAC+5" },
  { value: "DOCTORAT", label: "PhD" },
]

const NIVEAU_SENIORITE_OPTIONS = [
  { value: "JUNIOR", label: "Junior" },
  { value: "CONFIRME", label: "Confirmed" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXPERT", label: "Expert" },
  { value: "LEAD", label: "Lead" },
]

const TYPE_CONTRAT_OPTIONS = [
  { value: "CDI", label: "CDI (Permanent)" },
  { value: "CDD", label: "CDD (Fixed-term)" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "STAGE", label: "Internship" },
]

const initialFormData: JobFormData = {
  titre: "",
  description: "",
  localisation: "",
  entreprise: "",
  typeContrat: "CDI",
  salaire: 0,
  experience: 0,
  competencesTechniques: "",
  competencesTransversales: "",
  experienceMinRequise: 0,
  experienceMaxSouhaitee: 0,
  niveauEtudeMin: "BAC_PLUS_3",
  languesRequises: "",
  secteurActivite: "",
  missionPrincipale: "",
  responsabilites: "",
  outilsTechnologies: "",
  typePoste: "TECHNIQUE",
  modaliteTravail: "PRESENTIEL",
  niveauSeniorite: "JUNIOR",
  dateExpiration: "",
  motsClesGeneres: "",
}

export default function CreateJobPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState<JobFormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [softSkillInput, setSoftSkillInput] = useState("")
  const [toolInput, setToolInput] = useState("")
  const [languageInput, setLanguageInput] = useState("")

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "EMPLOYER") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Set default expiration date to 30 days from now
    const defaultExpiration = new Date()
    defaultExpiration.setDate(defaultExpiration.getDate() + 30)
    setFormData((prev) => ({
      ...prev,
      dateExpiration: defaultExpiration.toISOString().split("T")[0],
      entreprise: user?.nom || "",
    }))
  }, [user])

  const handleInputChange = (field: keyof JobFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const addSkill = (type: "technical" | "soft" | "tools" | "languages") => {
    let input = ""
    let field: keyof JobFormData = "competencesTechniques"

    switch (type) {
      case "technical":
        input = skillInput
        field = "competencesTechniques"
        break
      case "soft":
        input = softSkillInput
        field = "competencesTransversales"
        break
      case "tools":
        input = toolInput
        field = "outilsTechnologies"
        break
      case "languages":
        input = languageInput
        field = "languesRequises"
        break
    }

    if (input.trim()) {
      const currentValue = formData[field] as string
      const newValue = currentValue ? `${currentValue}, ${input.trim()}` : input.trim()
      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
      }))

      // Clear input
      switch (type) {
        case "technical":
          setSkillInput("")
          break
        case "soft":
          setSoftSkillInput("")
          break
        case "tools":
          setToolInput("")
          break
        case "languages":
          setLanguageInput("")
          break
      }
    }
  }

  const removeSkill = (type: "technical" | "soft" | "tools" | "languages", skillToRemove: string) => {
    let field: keyof JobFormData = "competencesTechniques"

    switch (type) {
      case "technical":
        field = "competencesTechniques"
        break
      case "soft":
        field = "competencesTransversales"
        break
      case "tools":
        field = "outilsTechnologies"
        break
      case "languages":
        field = "languesRequises"
        break
    }

    const currentValue = formData[field] as string
    const skills = currentValue.split(", ").filter((skill) => skill.trim() !== skillToRemove.trim())
    setFormData((prev) => ({
      ...prev,
      [field]: skills.join(", "),
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.titre && formData.entreprise && formData.localisation && formData.secteurActivite)
      case 2:
        return !!(formData.description && formData.missionPrincipale && formData.responsabilites)
      case 3:
        return !!(formData.competencesTechniques && formData.experienceMinRequise >= 0 && formData.niveauEtudeMin)
      case 4:
        return !!(formData.typeContrat && formData.modaliteTravail && formData.salaire > 0 && formData.dateExpiration)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Generate keywords from title and skills
      const keywords = [
        formData.titre,
        ...formData.competencesTechniques.split(", "),
        formData.secteurActivite,
        formData.typePoste,
      ].join(", ")

      const jobData = {
        ...formData,
        motsClesGeneres: keywords,
      }

      await employerApi.createJob(jobData)
      setSuccess(true)

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard/employer")
      }, 2000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create job posting. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderSkillTags = (skillsString: string, type: "technical" | "soft" | "tools" | "languages") => {
    if (!skillsString) return null

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {skillsString.split(", ").map((skill, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {skill.trim()}
            <button type="button" onClick={() => removeSkill(type, skill)} className="ml-1 hover:text-red-600">
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "EMPLOYER") {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
            <p className="text-gray-600 mb-6">Your job posting has been created and is now live.</p>
            <Button onClick={() => router.push("/dashboard/employer")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a New Job</h1>
          <p className="text-lg text-gray-600">Create a detailed job posting to attract the best candidates</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500 max-w-md mx-auto">
            <span>Basic Info</span>
            <span>Description</span>
            <span>Requirements</span>
            <span>Details</span>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <BriefcaseIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900">Basic Job Information</h2>
                  <p className="text-gray-600">Start with the essential details about your job opening</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </Label>
                    <Input
                      id="titre"
                      type="text"
                      value={formData.titre}
                      onChange={(e) => handleInputChange("titre", e.target.value)}
                      placeholder="e.g. Senior React Developer"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </Label>
                    <Input
                      id="entreprise"
                      type="text"
                      value={formData.entreprise}
                      onChange={(e) => handleInputChange("entreprise", e.target.value)}
                      placeholder="Your company name"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </Label>
                    <Input
                      id="localisation"
                      type="text"
                      value={formData.localisation}
                      onChange={(e) => handleInputChange("localisation", e.target.value)}
                      placeholder="e.g. Tunis, Tunisia"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="secteurActivite" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Sector *
                    </Label>
                    <Input
                      id="secteurActivite"
                      type="text"
                      value={formData.secteurActivite}
                      onChange={(e) => handleInputChange("secteurActivite", e.target.value)}
                      placeholder="e.g. Technology, Finance, Healthcare"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="typePoste" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </Label>
                    <Select value={formData.typePoste} onValueChange={(value) => handleInputChange("typePoste", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_POSTE_OPTIONS.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="niveauSeniorite" className="block text-sm font-medium text-gray-700 mb-2">
                      Seniority Level
                    </Label>
                    <Select
                      value={formData.niveauSeniorite}
                      onValueChange={(value) => handleInputChange("niveauSeniorite", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select seniority level" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEAU_SENIORITE_OPTIONS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Job Description & Responsibilities</h2>
                  <p className="text-gray-600">Describe the role and what the candidate will be doing</p>
                </div>

                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide a comprehensive description of the job role, company culture, and what makes this opportunity exciting..."
                    rows={6}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="missionPrincipale" className="block text-sm font-medium text-gray-700 mb-2">
                    Main Mission *
                  </Label>
                  <Textarea
                    id="missionPrincipale"
                    value={formData.missionPrincipale}
                    onChange={(e) => handleInputChange("missionPrincipale", e.target.value)}
                    placeholder="Describe the primary mission and objectives of this role..."
                    rows={4}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="responsabilites" className="block text-sm font-medium text-gray-700 mb-2">
                    Key Responsibilities *
                  </Label>
                  <Textarea
                    id="responsabilites"
                    value={formData.responsabilites}
                    onChange={(e) => handleInputChange("responsabilites", e.target.value)}
                    placeholder="List the main responsibilities and daily tasks. Use bullet points or numbered lists for clarity..."
                    rows={6}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Requirements & Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Requirements & Skills</h2>
                  <p className="text-gray-600">Define the qualifications and skills needed for this role</p>
                </div>

                {/* Technical Skills */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills *</Label>
                  <p className="text-sm text-gray-500 mb-2">Add at least one technical skill required for this position</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a technical skill (e.g. React, Python, SQL)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("technical"))}
                    />
                    <Button type="button" onClick={() => addSkill("technical")} variant="outline">
                      Add
                    </Button>
                  </div>
                  {renderSkillTags(formData.competencesTechniques, "technical")}
                  {!formData.competencesTechniques && (
                    <p className="text-sm text-red-500 mt-1">Please add at least one technical skill</p>
                  )}
                </div>

                {/* Soft Skills */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={softSkillInput}
                      onChange={(e) => setSoftSkillInput(e.target.value)}
                      placeholder="Add a soft skill (e.g. Leadership, Communication)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("soft"))}
                    />
                    <Button type="button" onClick={() => addSkill("soft")} variant="outline">
                      Add
                    </Button>
                  </div>
                  {renderSkillTags(formData.competencesTransversales, "soft")}
                </div>

                {/* Tools & Technologies */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Tools & Technologies</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      placeholder="Add a tool or technology (e.g. Docker, AWS, Figma)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("tools"))}
                    />
                    <Button type="button" onClick={() => addSkill("tools")} variant="outline">
                      Add
                    </Button>
                  </div>
                  {renderSkillTags(formData.outilsTechnologies, "tools")}
                </div>

                {/* Languages */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Required Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="Add a language requirement (e.g. English - Fluent, French - Intermediate)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("languages"))}
                    />
                    <Button type="button" onClick={() => addSkill("languages")} variant="outline">
                      Add
                    </Button>
                  </div>
                  {renderSkillTags(formData.languesRequises, "languages")}
                </div>

                <Separator />

                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experienceMinRequise" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Experience Required (years) *
                    </Label>
                    <Input
                      id="experienceMinRequise"
                      type="number"
                      min="0"
                      value={formData.experienceMinRequise}
                      onChange={(e) => handleInputChange("experienceMinRequise", Number.parseInt(e.target.value) || 0)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="experienceMaxSouhaitee" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Experience Preferred (years)
                    </Label>
                    <Input
                      id="experienceMaxSouhaitee"
                      type="number"
                      min="0"
                      value={formData.experienceMaxSouhaitee}
                      onChange={(e) =>
                        handleInputChange("experienceMaxSouhaitee", Number.parseInt(e.target.value) || 0)
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="niveauEtudeMin" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Education Level *
                    </Label>
                    <Select
                      value={formData.niveauEtudeMin}
                      onValueChange={(value) => handleInputChange("niveauEtudeMin", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEAU_ETUDE_OPTIONS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Job Details & Terms */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CurrencyDollarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900">Job Details & Terms</h2>
                  <p className="text-gray-600">Finalize the employment terms and conditions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="typeContrat" className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type *
                    </Label>
                    <Select
                      value={formData.typeContrat}
                      onValueChange={(value) => handleInputChange("typeContrat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_CONTRAT_OPTIONS.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="modaliteTravail" className="block text-sm font-medium text-gray-700 mb-2">
                      Work Mode *
                    </Label>
                    <Select
                      value={formData.modaliteTravail}
                      onValueChange={(value) => handleInputChange("modaliteTravail", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODALITE_TRAVAIL_OPTIONS.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="salaire" className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Salary (TND) *
                    </Label>
                    <Input
                      id="salaire"
                      type="number"
                      min="0"
                      value={formData.salaire}
                      onChange={(e) => handleInputChange("salaire", Number.parseInt(e.target.value) || 0)}
                      placeholder="e.g. 3000"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateExpiration" className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline *
                    </Label>
                    <Input
                      id="dateExpiration"
                      type="date"
                      value={formData.dateExpiration}
                      onChange={(e) => handleInputChange("dateExpiration", e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Job Summary Preview */}
                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Posting Preview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{formData.titre || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{formData.entreprise || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{formData.localisation || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary:</span>
                      <span className="font-medium">
                        {formData.salaire ? `${formData.salaire.toLocaleString()} TND/month` : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract:</span>
                      <span className="font-medium">{formData.typeContrat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Work Mode:</span>
                      <span className="font-medium">
                        {MODALITE_TRAVAIL_OPTIONS.find((m) => m.value === formData.modaliteTravail)?.label ||
                          formData.modaliteTravail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">
                        {formData.dateExpiration
                          ? new Date(formData.dateExpiration).toLocaleDateString()
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                Back
              </Button>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(4)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Publishing..." : "Publish Job"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
