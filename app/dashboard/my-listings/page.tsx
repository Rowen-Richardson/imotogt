"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/components/UserContext"
import { vehicleService } from "@/lib/vehicle-service"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"

export default function MyListingsPage() {
  const router = useRouter()
  const { user, userProfile, signOut } = useUser()
  const [listedVehicles, setListedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchListedVehicles = async () => {
        setLoading(true)
        const vehicles = await vehicleService.getVehiclesByUserId(user.id)
        setListedVehicles(vehicles)
        setLoading(false)
      }
      fetchListedVehicles()
    } else {
      // If user is not loaded yet, or not logged in, redirect.
      // The UserProvider should handle this, but as a fallback:
      router.push("/login")
    }
  }, [user, router])

  const handleStatusChange = async (vehicleId: string, newStatus: "active" | "sold" | "inactive") => {
    const originalVehicles = [...listedVehicles];
    // Optimistically update the UI
    setListedVehicles(prevVehicles =>
      prevVehicles.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v)
    );

    try {
      const updatedVehicle = await vehicleService.updateVehicleStatus(vehicleId, newStatus)
      if (!updatedVehicle) {
        // Revert UI on failure
        alert("Failed to update status. Please try again.")
        setListedVehicles(originalVehicles);
      }
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
      alert("An error occurred while updating status.")
      setListedVehicles(originalVehicles);
    }
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={userProfile} {...navigationHandlers} />
      <main className="pt-24 max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Listings</h1>

        {loading ? (
          <p>Loading your listings...</p>
        ) : listedVehicles.length > 0 ? (
          <div className="space-y-4">
            {listedVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="flex items-center p-4">
                <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative mr-4">
                  <Image
                    src={vehicle.images?.[0] || "/placeholder.svg"}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/vehicle/${vehicle.id}`}>
                    <h3 className="font-semibold hover:underline">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{vehicle.price}</p>
                  <p className={`text-sm font-medium ${vehicle.status === 'sold' ? 'text-red-500' : 'text-green-500'}`}>
                    Status: {vehicle.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={vehicle.status}
                    onValueChange={(value: "active" | "sold" | "inactive") => handleStatusChange(vehicle.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href={`/vehicle/${vehicle.id}`}>
                    <Button variant="outline">View/Edit</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">You have no active listings.</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Ready to sell? List your vehicle today.
            </p>
            <Button className="mt-4" onClick={() => router.push('/upload-vehicle')}>List a Vehicle</Button>
          </div>
        )}
      </main>
    </div>
  )
}
