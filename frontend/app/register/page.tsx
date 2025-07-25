"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import type { AppDispatch, RootState } from "@/store"
import { register, clearError } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, UserIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    cin: "",
    role: (searchParams.get("role") as "CANDIDATE" | "EMPLOYER") || "CANDIDATE",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    // Calculate password strength
    const password = formData.password
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as "CANDIDATE" | "EMPLOYER",
    })
  }

  const validateStep1 = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      passwordStrength >= 3
    )
  }

  const validateStep2 = () => {
    return formData.nom && formData.prenom && formData.cin && acceptTerms
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    try {
      await dispatch(
        register({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          cin: formData.cin,
          role: formData.role,
        }),
      ).unwrap()

      // Registration successful, redirect to login
      router.push("/login?message=Registration successful. Please sign in.")
    } catch (error) {
      // Error is handled by the slice
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <MagnifyingGlassIcon className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold text-gray-900">JobVector</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Account Details</span>
              <span>Personal Info</span>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Role Selection */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">I want to join as</Label>
                  <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="CANDIDATE" id="candidate" />
                      <Label htmlFor="candidate" className="flex items-center cursor-pointer">
                        <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <div className="font-medium">Job Seeker</div>
                          <div className="text-sm text-gray-500">Looking for opportunities</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="EMPLOYER" id="employer" />
                      <Label htmlFor="employer" className="flex items-center cursor-pointer">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-600" />
                        <div>
                          <div className="font-medium">Employer</div>
                          <div className="text-sm text-gray-500">Hiring talent</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep1()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.prenom}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* CIN */}
                <div>
                  <Label htmlFor="cin" className="block text-sm font-medium text-gray-700">
                    National ID (CIN)
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="cin"
                      name="cin"
                      type="text"
                      required
                      value={formData.cin}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your CIN"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={checked => setAcceptTerms(checked === true)}
                />
                <Label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !validateStep2()}
                    className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
