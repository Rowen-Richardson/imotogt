"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/ui/header"
import { authService, AuthError } from "@/lib/auth"
import type { UserProfile } from "@/types/user"

interface LoginPageProps {
  onLoginSuccess?: (userProfile: UserProfile) => void
  onSignUpSuccess?: (userProfile: UserProfile) => void
  onCancel?: () => void
  loginContext?: "default" | "checkout" | "sell"
}

export default function LoginPage({
  onLoginSuccess,
  onSignUpSuccess,
  onCancel,
  loginContext = "default",
}: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { user } = await authService.signUp(email, password, { firstName, lastName })
      if (user) {
        const profile = await authService.getUserProfile(user.id)
        if (profile) {
          if (onSignUpSuccess) {
            onSignUpSuccess(profile)
          } else if (onLoginSuccess) {
            onLoginSuccess(profile) // Fallback for existing implementations
          }
        }
      }
    } catch (e) {
      if (e instanceof AuthError) {
        setError(e.message)
      } else {
        setError("An unexpected error occurred during sign up.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { user } = await authService.signIn(email, password)
      if (user && onLoginSuccess) {
        const profile = await authService.getUserProfile(user.id)
        if (profile) {
          onLoginSuccess(profile)
        } else {
          // This case might happen if the profile creation trigger failed.
          // We can still proceed, the profile will be created on first access.
          onLoginSuccess({ id: user.id, email: user.email!, firstName: "", lastName: "", loginMethod: "email" })
        }
      }
    } catch (e) {
      if (e instanceof AuthError) {
        setError(e.message)
      } else {
        setError("An unexpected error occurred during sign in.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "facebook" | "apple") => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.signInWithOAuth(provider)
      // The user will be redirected by Supabase, and the UserProvider will handle the session.
    } catch (e) {
      if (e instanceof AuthError) {
        setError(e.message)
      } else {
        setError(`An unexpected error occurred with ${provider} sign in.`)
      }
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  return (
    <>

      <Header user={null} transparent={false} />
      <main className="flex-1 flex items-center justify-center px-4 pt-20 md:pt-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#3E5641] dark:text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-[#6F7F69] dark:text-gray-400 mt-2">
              {isSignUp ? "Join the community to buy and sell cars." : "Sign in to manage your listings."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#2A352A] p-8 rounded-3xl shadow-lg border border-[#9FA791]/20 dark:border-[#4A4D45]/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="firstName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required={isSignUp}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required={isSignUp}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-[#3E5641] dark:text-gray-300">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#FF6700] text-white hover:bg-[#FF6700]/90 dark:bg-[#FF7D33] dark:hover:bg-[#FF7D33]/90"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                {isSignUp ? <UserPlus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#2A352A] text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" onClick={() => handleOAuthSignIn("google")} disabled={isLoading}>
                  <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
                  <span className="ml-2">Sign in with Google</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[#FF6700] dark:text-[#FF7D33] hover:underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
            {!isSignUp && (
              <button
                onClick={() => router.push("/auth/reset-password")}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline ml-4"
              >
                Forgot Password?
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
