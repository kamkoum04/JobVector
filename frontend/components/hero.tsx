"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline"

export default function Hero() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (searchTerm.trim()) {
      params.set("keyword", searchTerm.trim())
    }

    if (location && location !== "all") {
      params.set("localisation", location)
    }

    router.push(`/jobs?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Job with <span className="text-yellow-400">AI-Powered</span> Matching
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with top employers in Tunisia and discover opportunities that perfectly match your skills and
            aspirations
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Job Search Input */}
              <div className="md:col-span-5 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Location Select */}
              <div className="md:col-span-4 relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="pl-10 h-12 text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Tunis">Tunis</SelectItem>
                    <SelectItem value="Sfax">Sfax</SelectItem>
                    <SelectItem value="Sousse">Sousse</SelectItem>
                    <SelectItem value="Monastir">Monastir</SelectItem>
                    <SelectItem value="Ariana">Ariana</SelectItem>
                    <SelectItem value="Nabeul">Nabeul</SelectItem>
                    <SelectItem value="Bizerte">Bizerte</SelectItem>
                    <SelectItem value="Gabes">Gabes</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-3">
                <Button
                  onClick={handleSearch}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
                >
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* Quick Search Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-gray-600 text-sm font-medium">Popular searches:</span>
              {["React Developer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag)
                    setTimeout(handleSearch, 100)
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">1000+</div>
            <div className="text-blue-100">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">500+</div>
            <div className="text-blue-100">Companies</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">5000+</div>
            <div className="text-blue-100">Job Seekers</div>
          </div>
        </div>
      </div>
    </section>
  )
}
