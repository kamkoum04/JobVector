"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { logout, loadUserFromStorage } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BriefcaseIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  HomeIcon,
} from "@heroicons/react/24/outline"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    dispatch(loadUserFromStorage())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    router.push("/")
  }

  const getDashboardRoute = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "CANDIDATE":
        return "/dashboard/candidate"
      case "EMPLOYER":
        return "/dashboard/employer"
      case "ADMIN":
        return "/dashboard/admin"
      default:
        return "/login"
    }
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase()
  }

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                JobVector
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              JobVector
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                pathname === "/jobs" ? "text-blue-600 font-medium" : ""
              }`}
            >
              Browse Jobs
            </Link>
            {isAuthenticated && user?.role === "EMPLOYER" && (
              <Link
                href="/jobs/create"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  pathname === "/jobs/create" ? "text-blue-600 font-medium" : ""
                }`}
              >
                Post Job
              </Link>
            )}
            <Link
              href="/about"
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                pathname === "/about" ? "text-blue-600 font-medium" : ""
              }`}
            >
              About
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Quick Actions based on role */}
                {user.role === "EMPLOYER" && (
                  <Link href="/jobs/create">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Post Job
                    </Button>
                  </Link>
                )}

                {user.role === "CANDIDATE" && (
                  <Link href="/cv-upload">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Upload CV
                    </Button>
                  </Link>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user.nom, user.prenom)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardRoute()} className="cursor-pointer">
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs" className="cursor-pointer">
                        <BriefcaseIcon className="mr-2 h-4 w-4" />
                        Browse Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Cog6ToothIcon className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
