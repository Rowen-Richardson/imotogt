"use client"

import { useRouter } from "next/navigation"
import LoginPage from "@/components/login-page"
import type { UserProfile } from "@/types/user"

export default function LoginPageRoute() {
  const router = useRouter()

  const handleLoginSuccess = (userData: UserProfile) => {
    // The UserProvider listening to onAuthStateChange will handle setting user data.
    // We just need to navigate.
    router.push("/dashboard")
  }

  const handleSignUpSuccess = (userData: UserProfile) => {
    // Redirect to dashboard with a flag to show verification prompt
    router.push("/dashboard?signup=true")
  }

  const handleCancel = () => {
    router.push("/home")
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onSignUpSuccess={handleSignUpSuccess}
      onCancel={handleCancel}
      loginContext="default"
    />
  )
}
