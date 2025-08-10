"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import VehicleDetails from "@/components/vehicle-details"
import { useUser } from "@/components/UserContext"
import { vehicleService } from "@/lib/vehicle-service"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"

export default function VehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, signOut, savedVehicles, toggleSaveVehicle } = useUser()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      const fetchVehicle = async () => {
        try {
          setLoading(true)
          const fetchedVehicle = await vehicleService.getVehicleById(params.id)
          setVehicle(fetchedVehicle)
        } catch (e) {
          setError("An error occurred while fetching vehicle details.")
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      fetchVehicle()
    }
  }, [params.id])

  const handleSignOut = async () => {
    await signOut()
    router.push("/home")
  }

  const navigationHandlers = {
    onLoginClick: () => router.push("/login"),
    onDashboardClick: () => router.push("/dashboard"),
    onGoHome: () => router.push("/home"),
    onShowAllCars: () => router.push("/results"),
    onGoToSellPage: () => router.push("/upload-vehicle"),
    onSignOut: handleSignOut,
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header user={user} {...navigationHandlers} />
      <main className="pt-24 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-16">
            <p>Loading vehicle details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-red-600">Error</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
          </div>
        ) : vehicle ? (
          <VehicleDetails
            vehicle={vehicle}
            onBack={() => router.back()}
            user={user}
            isSaved={savedVehicles.has(vehicle.id)}
            onToggleSave={() => toggleSaveVehicle(vehicle)}
          />
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Not Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              The vehicle you are looking for does not exist or has been removed.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
