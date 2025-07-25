"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface JobFiltersProps {
  filters: {
    keyword: string
    titre: string
    localisation: string
    secteurActivite: string
    typePoste: string
    modaliteTravail: string
  }
  onFilterChange: (filters: any) => void
}

const TYPE_POSTE_OPTIONS = [
  { value: "TECHNIQUE", label: "Technical" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "COMMERCIAL", label: "Sales" },
  { value: "MARKETING", label: "Marketing" },
  { value: "RH", label: "Human Resources" },
  { value: "FINANCE", label: "Finance" },
  { value: "SUPPORT", label: "Support" },
]

const MODALITE_TRAVAIL_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRIDE", label: "Hybrid" },
  { value: "PRESENTIEL", label: "On-site" },
]

export default function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: string, value: any) => {
    // Handle "All" selections by setting to empty string
    if (value === "ALL_TYPES" || value === "ALL_MODES") {
      value = ""
    }

    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      keyword: "",
      titre: "",
      localisation: "",
      secteurActivite: "",
      typePoste: "",
      modaliteTravail: "",
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== "" && value !== null && value !== undefined,
  )

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
            Location
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="City, region, or remote"
            value={localFilters.localisation}
            onChange={(e) => handleFilterChange("localisation", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Job Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Job Type</Label>
          <Select
            value={localFilters.typePoste || "ALL_TYPES"}
            onValueChange={(value) => handleFilterChange("typePoste", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">All Types</SelectItem>
              {TYPE_POSTE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Work Mode */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Work Mode</Label>
          <Select
            value={localFilters.modaliteTravail || "ALL_MODES"}
            onValueChange={(value) => handleFilterChange("modaliteTravail", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select work mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_MODES">All Modes</SelectItem>
              {MODALITE_TRAVAIL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industry Sector */}
        <div>
          <Label htmlFor="sector" className="text-sm font-medium text-gray-700 mb-2 block">
            Industry Sector
          </Label>
          <Input
            id="sector"
            type="text"
            placeholder="Technology, Finance, Healthcare..."
            value={localFilters.secteurActivite}
            onChange={(e) => handleFilterChange("secteurActivite", e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
