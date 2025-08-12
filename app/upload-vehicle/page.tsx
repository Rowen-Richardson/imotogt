"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/components/UserContext"
import UploadVehicleComponent from "@/components/upload-vehicle"
import { useEffect } from "react"
import { vehicleService } from "@/lib/vehicle-service"
import type { UserProfile } from "@/types/user"

export default function UploadVehiclePage() {
  const router = useRouter()
  const { user, userProfile, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/upload-vehicle")
    }
  }, [user, loading, router])

  const handleVehicleSubmit = async (vehicleData: any) => {
    if (!user || !userProfile) throw new Error("User is not authenticated.")

    try {
      // Map form data to the specific structure required by the vehicle service
      const payload = {
        userId: user.id,
        make: vehicleData.make,
        model: vehicleData.model,
        variant: vehicleData.variant,
        year: parseInt(vehicleData.year, 10),
        price: parseFloat(vehicleData.price),
        mileage: parseInt(vehicleData.mileage, 10),
        transmission: vehicleData.transmission,
        fuel: vehicleData.fuel,
        engineCapacity: vehicleData.engineCapacity,
        bodyType: vehicleData.bodyType,
        description: vehicleData.description,
        city: vehicleData.sellerCity,
        province: vehicleData.sellerProvince,
        images: vehicleData.images,
        // Add missing seller fields
        sellerName: vehicleData.sellerName,
        sellerEmail: vehicleData.sellerEmail,
        sellerPhone: vehicleData.sellerPhone,
        status: "active",
      }

      await vehicleService.createVehicle(payload)
    } catch (err) {
      console.error("Failed to submit vehicle:", err)
      // Re-throw to be caught by the child component
      throw err
    }
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const token = user?.session?.access_token
      if (!token) {
        throw new Error("Unauthorized: No session token available.")
      }
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedProfile),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to update profile.")
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
      throw err
    }
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
        <p className="text-[#3E5641] dark:text-white">Loading...</p>
      </div>
    )
  }

  return (
    <UploadVehicleComponent
      user={userProfile}
      onVehicleSubmit={handleVehicleSubmit}
      onBack={handleBack}
      onSaveProfile={handleSaveProfile}
    />
  )
}
