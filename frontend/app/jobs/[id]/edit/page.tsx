"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { employerApi, publicApi } from "@/lib/api"
import { ArrowLeft, Plus, X, Save, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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
}

interface JobEnums {
  typeContrat: string[]
  secteurActivite: string[]
  typePoste: string[]
  modaliteTravail: string[]
  niveauSeniorite: string[]
  niveauEtudeMin: string[]
}

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = Number.parseInt(params.id as string)

  const [formData, setFormData] = useState<JobFormData>({
    titre: "",
    description: "",
    localisation: "",
    entreprise: "",
    typeContrat: "",
    salaire: 0,
    experience: 0,
    competencesTechniques: "",
    competencesTransversales: "",
    experienceMinRequise: 0,
    experienceMaxSouhaitee: 0,
    niveauEtudeMin: "",
    languesRequises: "",
    secteurActivite: "",
    missionPrincipale: "",
    responsabilites: "",
    outilsTechnologies: "",
    typePoste: "",
    modaliteTravail: "",
    niveauSeniorite: "",
    dateExpiration: "",
  })

  const [enums, setEnums] = useState<JobEnums>({
    typeContrat: [],
    secteurActivite: [],
    typePoste: [],
    modaliteTravail: [],
    niveauSeniorite: [],
    niveauEtudeMin: [],
  })

  const [technicalSkills, setTechnicalSkills] = useState<string[]>([])
  const [softSkills, setSoftSkills] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [tools, setTools] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newSoftSkill, setNewSoftSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newTool, setNewTool] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadJobData()
    loadEnums()
  }, [jobId])

  const loadJobData = async () => {
    try {
      const response = await employerApi.getJobById(jobId)
      const job = response.data

      setFormData({
        titre: job.titre || "",
        description: job.description || "",
        localisation: job.localisation || "",
        entreprise: job.entreprise || "",
        typeContrat: job.typeContrat || "",
        salaire: job.salaire || 0,
        experience: job.experience || 0,
        competencesTechniques: job.competencesTechniques || "",
        competencesTransversales: job.competencesTransversales || "",
        experienceMinRequise: job.experienceMinRequise || 0,
        experienceMaxSouhaitee: job.experienceMaxSouhaitee || 0,
        niveauEtudeMin: job.niveauEtudeMin || "",
        languesRequises: job.languesRequises || "",
        secteurActivite: job.secteurActivite || "",
        missionPrincipale: job.missionPrincipale || "",
        responsabilites: job.responsabilites || "",
        outilsTechnologies: job.outilsTechnologies || "",
        typePoste: job.typePoste || "",
        modaliteTravail: job.modaliteTravail || "",
        niveauSeniorite: job.niveauSeniorite || "",
        dateExpiration: job.dateExpiration ? job.dateExpiration.split("T")[0] : "",
      })

      // Parse skills from strings
      if (job.competencesTechniques) {
        setTechnicalSkills(
          job.competencesTechniques
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        )
      }
      if (job.competencesTransversales) {
        setSoftSkills(
          job.competencesTransversales
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        )
      }
      if (job.languesRequises) {
        setLanguages(
          job.languesRequises
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        )
      }
      if (job.outilsTechnologies) {
        setTools(
          job.outilsTechnologies
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        )
      }
    } catch (error) {
      console.error("Error loading job data:", error)
      toast.error("Erreur lors du chargement de l'offre d'emploi")
      router.push("/dashboard/employer")
    }
  }

  const loadEnums = async () => {
    try {
      const response = await publicApi.getJobEnums()
      setEnums(response.data)
    } catch (error) {
      console.error("Error loading enums:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.titre.trim()) newErrors.titre = "Le titre est requis"
    if (!formData.description.trim()) newErrors.description = "La description est requise"
    if (!formData.localisation.trim()) newErrors.localisation = "La localisation est requise"
    if (!formData.entreprise.trim()) newErrors.entreprise = "Le nom de l'entreprise est requis"
    if (!formData.typeContrat) newErrors.typeContrat = "Le type de contrat est requis"
    if (!formData.secteurActivite) newErrors.secteurActivite = "Le secteur d'activité est requis"
    if (!formData.typePoste) newErrors.typePoste = "Le type de poste est requis"
    if (!formData.modaliteTravail) newErrors.modaliteTravail = "La modalité de travail est requise"
    if (!formData.niveauSeniorite) newErrors.niveauSeniorite = "Le niveau de séniorité est requis"
    if (!formData.dateExpiration) newErrors.dateExpiration = "La date d'expiration est requise"
    if (formData.salaire <= 0) newErrors.salaire = "Le salaire doit être supérieur à 0"
    if (formData.experienceMinRequise < 0)
      newErrors.experienceMinRequise = "L'expérience minimum ne peut pas être négative"

    const today = new Date()
    const expirationDate = new Date(formData.dateExpiration)
    if (expirationDate <= today) {
      newErrors.dateExpiration = "La date d'expiration doit être dans le futur"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    setSaving(true)
    try {
      const submitData = {
        ...formData,
        competencesTechniques: technicalSkills.join(", "),
        competencesTransversales: softSkills.join(", "),
        languesRequises: languages.join(", "),
        outilsTechnologies: tools.join(", "),
      }

      await employerApi.updateJob(jobId, submitData)
      toast.success("Offre d'emploi mise à jour avec succès!")
      router.push("/dashboard/employer")
    } catch (error) {
      console.error("Error updating job:", error)
      toast.error("Erreur lors de la mise à jour de l'offre d'emploi")
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (type: "technical" | "soft" | "language" | "tool") => {
    const skillMap = {
      technical: { skills: technicalSkills, setSkills: setTechnicalSkills, newSkill, setNewSkill },
      soft: { skills: softSkills, setSkills: setSoftSkills, newSkill: newSoftSkill, setNewSkill: setNewSoftSkill },
      language: { skills: languages, setSkills: setLanguages, newSkill: newLanguage, setNewSkill: setNewLanguage },
      tool: { skills: tools, setSkills: setTools, newSkill: newTool, setNewSkill: setNewTool },
    }

    const { skills, setSkills, newSkill: currentNewSkill, setNewSkill: setCurrentNewSkill } = skillMap[type]

    if (currentNewSkill.trim() && !skills.includes(currentNewSkill.trim())) {
      setSkills([...skills, currentNewSkill.trim()])
      setCurrentNewSkill("")
    }
  }

  const removeSkill = (type: "technical" | "soft" | "language" | "tool", skillToRemove: string) => {
    const skillMap = {
      technical: { skills: technicalSkills, setSkills: setTechnicalSkills },
      soft: { skills: softSkills, setSkills: setSoftSkills },
      language: { skills: languages, setSkills: setLanguages },
      tool: { skills: tools, setSkills: setTools },
    }

    const { skills, setSkills } = skillMap[type]
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de l'offre d'emploi...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'offre d'emploi</h1>
          <p className="text-gray-600">Mettez à jour les informations de votre offre d'emploi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>Les informations principales de votre offre d'emploi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du poste *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                />
                {errors.titre && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.titre}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entreprise">Entreprise *</Label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                  placeholder="Nom de votre entreprise"
                />
                {errors.entreprise && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.entreprise}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation *</Label>
                <Input
                  id="localisation"
                  value={formData.localisation}
                  onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                  placeholder="Ex: Paris, France"
                />
                {errors.localisation && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.localisation}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaire">Salaire (€/an) *</Label>
                <Input
                  id="salaire"
                  type="number"
                  value={formData.salaire}
                  onChange={(e) => setFormData({ ...formData, salaire: Number.parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 45000"
                />
                {errors.salaire && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.salaire}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du poste *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le poste, les missions principales..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du poste</CardTitle>
            <CardDescription>Spécifiez les caractéristiques du poste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeContrat">Type de contrat *</Label>
                <Select
                  value={formData.typeContrat}
                  onValueChange={(value) => setFormData({ ...formData, typeContrat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.typeContrat.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.typeContrat && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.typeContrat}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secteurActivite">Secteur d'activité *</Label>
                <Select
                  value={formData.secteurActivite}
                  onValueChange={(value) => setFormData({ ...formData, secteurActivite: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.secteurActivite.map((secteur) => (
                      <SelectItem key={secteur} value={secteur}>
                        {secteur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.secteurActivite && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.secteurActivite}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typePoste">Type de poste *</Label>
                <Select
                  value={formData.typePoste}
                  onValueChange={(value) => setFormData({ ...formData, typePoste: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.typePoste.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.typePoste && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.typePoste}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modaliteTravail">Modalité de travail *</Label>
                <Select
                  value={formData.modaliteTravail}
                  onValueChange={(value) => setFormData({ ...formData, modaliteTravail: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une modalité" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.modaliteTravail.map((modalite) => (
                      <SelectItem key={modalite} value={modalite}>
                        {modalite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modaliteTravail && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.modaliteTravail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="niveauSeniorite">Niveau de séniorité *</Label>
                <Select
                  value={formData.niveauSeniorite}
                  onValueChange={(value) => setFormData({ ...formData, niveauSeniorite: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.niveauSeniorite.map((niveau) => (
                      <SelectItem key={niveau} value={niveau}>
                        {niveau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.niveauSeniorite && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.niveauSeniorite}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateExpiration">Date d'expiration *</Label>
                <Input
                  id="dateExpiration"
                  type="date"
                  value={formData.dateExpiration}
                  onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                />
                {errors.dateExpiration && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.dateExpiration}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills and Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Compétences et exigences</CardTitle>
            <CardDescription>Définissez les compétences requises et l'expérience nécessaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technical Skills */}
            <div className="space-y-3">
              <Label>Compétences techniques</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Ajouter une compétence technique"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("technical"))}
                />
                <Button type="button" onClick={() => addSkill("technical")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill("technical", skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-3">
              <Label>Compétences transversales</Label>
              <div className="flex gap-2">
                <Input
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  placeholder="Ajouter une compétence transversale"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("soft"))}
                />
                <Button type="button" onClick={() => addSkill("soft")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill("soft", skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label>Langues requises</Label>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Ajouter une langue"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("language"))}
                />
                <Button type="button" onClick={() => addSkill("language")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <Badge key={language} variant="default" className="flex items-center gap-1">
                    {language}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill("language", language)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tools and Technologies */}
            <div className="space-y-3">
              <Label>Outils et technologies</Label>
              <div className="flex gap-2">
                <Input
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  placeholder="Ajouter un outil ou technologie"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("tool"))}
                />
                <Button type="button" onClick={() => addSkill("tool")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <Badge key={tool} variant="destructive" className="flex items-center gap-1">
                    {tool}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill("tool", tool)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Experience Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceMinRequise">Expérience minimum requise (années)</Label>
                <Input
                  id="experienceMinRequise"
                  type="number"
                  value={formData.experienceMinRequise}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceMinRequise: Number.parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
                {errors.experienceMinRequise && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.experienceMinRequise}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceMaxSouhaitee">Expérience maximum souhaitée (années)</Label>
                <Input
                  id="experienceMaxSouhaitee"
                  type="number"
                  value={formData.experienceMaxSouhaitee}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceMaxSouhaitee: Number.parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niveauEtudeMin">Niveau d'étude minimum</Label>
                <Select
                  value={formData.niveauEtudeMin}
                  onValueChange={(value) => setFormData({ ...formData, niveauEtudeMin: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.niveauEtudeMin.map((niveau) => (
                      <SelectItem key={niveau} value={niveau}>
                        {niveau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations complémentaires</CardTitle>
            <CardDescription>Ajoutez des détails supplémentaires sur le poste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="missionPrincipale">Mission principale</Label>
              <Textarea
                id="missionPrincipale"
                value={formData.missionPrincipale}
                onChange={(e) => setFormData({ ...formData, missionPrincipale: e.target.value })}
                placeholder="Décrivez la mission principale du poste..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsabilites">Responsabilités</Label>
              <Textarea
                id="responsabilites"
                value={formData.responsabilites}
                onChange={(e) => setFormData({ ...formData, responsabilites: e.target.value })}
                placeholder="Listez les principales responsabilités..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mise à jour...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Mettre à jour l'offre
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
