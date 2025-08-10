"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import VehicleDetails from "@/components/vehicle-details"
import { useUser } from "@/components/UserContext"
import { vehicleService } from "@/lib/vehicle-service"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function VehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, userProfile, signOut, savedVehicles, toggleSaveVehicle } = useUser()
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

  const handleDelete = async () => {
    if (!vehicle) return;
    if (window.confirm("Are you sure you want to delete this listing?")) {
      const success = await vehicleService.deleteVehicle(vehicle.id);
      if (success) {
        alert("Vehicle deleted successfully.");
        router.push("/dashboard");
      } else {
        alert("Failed to delete vehicle.");
      }
    }
  };

  const handleMarkAsSold = async () => {
    if (!vehicle) return;
    const success = await vehicleService.updateVehicleStatus(vehicle.id, "sold");
    if (success) {
      alert("Vehicle marked as sold.");
      setVehicle(prev => prev ? { ...prev, status: 'sold' } : null);
    } else {
      alert("Failed to update vehicle status.");
    }
  };

  const navigationHandlers = {
    onLoginClick: () => router.push("/login"),
    onDashboardClick: () => router.push("/dashboard"),
    onGoHome: () => router.push("/home"),
    onShowAllCars: () => router.push("/results"),
    onGoToSellPage: () => router.push("/upload-vehicle"),
    onSignOut: handleSignOut,
  }

  const isOwner = user && vehicle && user.id === vehicle.userId

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header user={userProfile} {...navigationHandlers} />
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
          <div>
            {isOwner && (
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" onClick={() => alert("Edit page not implemented yet.")}>Edit</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                {vehicle.status === 'active' && (
                  <Button onClick={handleMarkAsSold}>Mark as Sold</Button>
                )}
              </div>
            )}
            <VehicleDetails
              vehicle={vehicle}
              onBack={() => router.back()}
              user={userProfile}
              isSaved={savedVehicles.has(vehicle.id)}
              onToggleSave={() => toggleSaveVehicle(vehicle)}
            />
          </div>
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
