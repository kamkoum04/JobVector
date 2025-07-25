"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, register, clearError } from "@/store/slices/authSlice"
import type { AppDispatch, RootState } from "@/store"
import { Eye, EyeOff, Mail, Lock, User, CreditCard, Building } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    cin: "",
    role: "CANDIDATE" as "CANDIDATE" | "EMPLOYER",
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
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
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError())
  }, [dispatch])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      return
    }

    try {
      const result = await dispatch(login(loginData))
      if (login.fulfilled.match(result)) {
        // Login successful, useEffect will handle redirect
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerData.password !== registerData.confirmPassword) {
      return
    }

    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.nom ||
      !registerData.prenom ||
      !registerData.cin
    ) {
      return
    }

    try {
      const result = await dispatch(
        register({
          email: registerData.email,
          password: registerData.password,
          nom: registerData.nom,
          prenom: registerData.prenom,
          cin: registerData.cin,
          role: registerData.role,
        }),
      )

      if (register.fulfilled.match(result)) {
        // Registration successful, now login
        dispatch(
          login({
            email: registerData.email,
            password: registerData.password,
          }),
        )
      }
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">JobVector</h2>
          <p className="mt-2 text-sm text-gray-600">Your gateway to career opportunities</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Join JobVector to find your next opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-prenom">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-prenom"
                          type="text"
                          value={registerData.prenom}
                          onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                          className="pl-10"
                          placeholder="First name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-nom">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-nom"
                          type="text"
                          value={registerData.nom}
                          onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                          className="pl-10"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-cin">CIN</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-cin"
                        type="text"
                        value={registerData.cin}
                        onChange={(e) => setRegisterData({ ...registerData, cin: e.target.value })}
                        className="pl-10"
                        placeholder="Enter your CIN"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Account Type</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="CANDIDATE"
                          checked={registerData.role === "CANDIDATE"}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, role: e.target.value as "CANDIDATE" | "EMPLOYER" })
                          }
                          className="text-blue-600"
                        />
                        <User className="h-4 w-4" />
                        <span>Job Seeker</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value="EMPLOYER"
                          checked={registerData.role === "EMPLOYER"}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, role: e.target.value as "CANDIDATE" | "EMPLOYER" })
                          }
                          className="text-blue-600"
                        />
                        <Building className="h-4 w-4" />
                        <span>Employer</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  {registerData.password !== registerData.confirmPassword && registerData.confirmPassword && (
                    <Alert variant="destructive">
                      <AlertDescription>Passwords do not match</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || registerData.password !== registerData.confirmPassword}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
