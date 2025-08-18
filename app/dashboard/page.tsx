"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/components/UserContext"
import { useEffect } from "react"
import Dashboard from "@/components/dashboard"
import type { Vehicle } from "@/lib/data"

export default function DashboardPage() {
  const router = useRouter()
  const { user, userProfile, loading, signOut, listedVehicles, savedVehicles, toggleSaveVehicle, deleteListedVehicle } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleViewDetails = (vehicle: Vehicle) => {
    router.push(`/vehicle-details/${vehicle.id}`)
  }

  const handleEditListedCar = (vehicle: Vehicle) => {
    router.push(`/vehicle/${vehicle.id}/edit`)
  }

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we fetch your details.</p>
        </div>
      </div>
    )
  }

  return (
    <Dashboard
      user={userProfile}
      onSignOut={signOut}
      onBack={() => router.push("/home")}
      onViewProfileSettings={() => router.push("/settings")}
      onViewUploadVehicle={() => router.push("/upload-vehicle")}
      listedCars={listedVehicles}
      savedCars={savedVehicles}
      onViewDetails={handleViewDetails}
      onEditListedCar={handleEditListedCar}
      onDeleteListedCar={deleteListedVehicle}
      onSaveCar={toggleSaveVehicle}
      onLoginClick={() => router.push("/login")}
      onGoHome={() => router.push("/home")}
      onShowAllCars={() => router.push("/home")} // Consider changing to /results page
      onGoToSellPage={() => router.push("/upload-vehicle")}
      onNavigateToUpload={() => router.push("/upload-vehicle")}
    />
  )
}
