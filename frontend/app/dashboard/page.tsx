"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Redirect based on user role
    switch (user?.role) {
      case "ADMIN":
        router.push("/dashboard/admin")
        break
      case "EMPLOYER":
        router.push("/dashboard/employer")
        break
      case "CANDIDATE":
        router.push("/dashboard/candidate")
        break
      default:
        router.push("/")
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
