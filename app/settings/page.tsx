"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/UserContext"
import ProfileSettings from "@/components/profile-settings"
import type { UserProfile } from "@/types/user"

export default function SettingsPage() {
  const { user, userProfile, loading, updateProfile, signOut } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const handleSave = async (updates: Partial<UserProfile>, profilePictureFile?: File) => {
    await updateProfile(updates, profilePictureFile)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProfileSettings
        user={userProfile}
        onBack={() => router.push("/dashboard")}
        onSave={handleSave}
        onSignOut={signOut}
      />
    </div>
  )
}
