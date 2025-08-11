"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // Added for user profile picture
import Link from "next/link"
import { Plus, Edit, Eye, Heart, MessageSquare, Car, Package } from "lucide-react"
import { Trash2 } from "lucide-react" // Import the Trash2 icon
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "./ui/header"
import LikedCarsPage from "@/components/liked-cars-page";
import VehicleDetails from "./vehicle-details";
import { vehicles } from "@/lib/data";
import type { Vehicle } from "@/types/vehicle";
import type { UserProfile } from "@/types/user";
import { useLikedCars } from "@/context/LikedCarsContext";

interface DashboardProps {
  user: UserProfile; // Use the imported UserProfile type
  onSignOut: () => void
  onBack: () => void
  onViewDetails?: (vehicle: Vehicle) => void // Add callback for viewing details
  onViewProfileSettings: () => void // Add callback for viewing profile settings
  onViewUploadVehicle: () => void; // Add callback for viewing vehicle upload page
  onUserUpdate: (updatedData: Partial<UserProfile>) => void; // Add onUserUpdate prop
  onEditListedCar?: (vehicle: Vehicle) => void; // Add callback for editing a listed car // Keep this line
  onDeleteListedCar?: (vehicle: Vehicle) => void; // Add callback for deleting a listed car
  listedCars?: Vehicle[]; // Add listed cars prop for the recently listed section
  // Add Header navigation props (onSignOut was already present)
  onLoginClick: () => void;
  onGoHome: () => void;
  onShowAllCars: () => void;
  onGoToSellPage: () => void;
  onNavigateToUpload: () => void;
}

export default function Dashboard({ user, onSignOut, onBack, listedCars = [], onViewDetails, onViewProfileSettings, onViewUploadVehicle, onEditListedCar, onDeleteListedCar, onLoginClick, onGoHome, onShowAllCars, onGoToSellPage }: DashboardProps) {
  // --- State and hooks ---
  const router = useRouter();
  const { likedCars } = useLikedCars();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (likedCars.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCarIndex((current) => (current + 1) % likedCars.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [likedCars.length]);

  // Handle viewing vehicle details
  const handleViewDetails = (vehicle: Vehicle) => {
    if (onViewDetails) {
      onViewDetails(vehicle);
    } else {
      setSelectedVehicle(vehicle);
    }
  };

  // Debug: Log user prop to verify updates
  console.log('[Dashboard] user:', user);

  // User metrics derived from props or other state
  const totalListings = listedCars.length;
  const maxFreeListings = 5; // Assuming 5 is the limit for the free plan
  const freeListingsRemaining = Math.max(0, maxFreeListings - totalListings);
  const userMetrics = {
    listingViews: 243, // Placeholder
    saves: 18, // Placeholder
    contacts: 7, // Placeholder
  };

  // --- Top-level conditional returns ---
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-xl">User not logged in.</div>;
  }
  if (selectedVehicle) {
    return (
      <VehicleDetails
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
        user={user}
      />
    );
  }
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Header Section */}
      <Header
        user={user}
        onLoginClick={() => { /* Optionally handle login click in dashboard */ }}
        onDashboardClick={onBack} // This correctly goes back to the main dashboard view state
        onGoHome={onGoHome} // Use the prop passed from CarMarketplace
        onShowAllCars={onShowAllCars} // Use the prop passed from CarMarketplace
        onGoToSellPage={onViewUploadVehicle}
        onSignOut={onSignOut}
        transparent={false}
      />

      {/* Main Content Area: Fills remaining space */}
      <main className="flex-1 px-6 pb-6 overflow-auto pt-20">
        <h1 className="text-4xl font-bold mb-6">
          Welcome, {user.firstName}
        </h1>

        {/* Center container for the entire grid */}
        <div className="w-full mx-auto h-full">
          {/* Outer grid: 12 columns, spans full height */}
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* LEFT COLUMN (9 of 12): uses 2-row structure */}
            <div className="col-span-9 grid grid-rows-[1fr_1fr] gap-4 h-full">
              {/* ROW 1: Profile, Progress, Vehicle Uploads */}
              <div className="grid grid-cols-3 gap-4">
                {/* Profile Card */}
                {/* Changed from Link to div with onClick to handle view state in parent */}
                <div
                  className="col-span-1 block min-w-0"
                  onClick={onViewProfileSettings}
                >
                  <Card className="rounded-3xl overflow-hidden w-full h-full transition-transform hover:scale-105 cursor-pointer">
                    <div className="relative w-full h-full">
                      {user.profilePic ? (
                        <Image
                          src={user.profilePic}
                          alt={`${user.firstName}'s profile`}
                          layout="fill"
                          objectFit="cover"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2E933C] flex items-center justify-center text-white">
                          <div className="text-center">
                            <div className="text-5xl font-bold mb-2">{user.firstName?.[0]?.toUpperCase() || "U"}</div>
                            <div className="text-sm">{user.firstName}</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                        <h3 className="text-2xl font-bold">{user.firstName}</h3>
                        <div className="mt-2">
                          <span className="inline-block border border-white/50 rounded-full px-4 py-1 text-sm">
                            UPDATE PROFILE
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Progress Card - Enhanced metrics display */}
                <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-[#3E5641]">Listing Metrics</h3>
                      <div className="bg-[#FF6700]/10 p-1.5 rounded-full">
                        <Eye className="w-5 h-5 text-[#FF6700]" />
                      </div>
                    </div>
                    <div className="mb-4 flex items-end gap-2 filter blur-sm">
                      <div className="text-3xl font-bold text-[#3E5641]">{totalListings}</div>
                      <div className="text-lg font-medium text-[#6F7F69] pb-0.5">Total Views</div> {/* Changed to reflect the metric shown */}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#FF6700]" />
                          <span className="font-medium text-[#3E5641]">Total Views</span>
                        </div>
                        <span className="text-lg font-bold text-[#3E5641]">{userMetrics.listingViews}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF6700] rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="text-xs text-gray-500">Last 30 days</span>
                        </div>
                        <div className="mt-auto">
                          <div className="text-xl font-bold text-[#3E5641]">{userMetrics.saves}</div>
                          <div className="text-xs text-[#6F7F69]">Saved by users</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">Last 30 days</span>
                        </div>
                        <div className="mt-auto">
                          <div className="text-xl font-bold text-[#3E5641]">{userMetrics.contacts}</div>
                          <div className="text-xs text-[#6F7F69]">Buyer inquiries</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Vehicle Uploads Card - Transformed from Time Tracker */}
                {/* Added onClick handler to navigate to the upload page */}
                <Card className="rounded-3xl p-5 w-full h-full flex flex-col justify-between bg-gradient-to-br from-[#FF6700] to-[#FF9248] text-white cursor-pointer hover:shadow-lg transition-all" onClick={onViewUploadVehicle}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Vehicle Uploads</h3>
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center items-center my-4">
                    <div className="bg-white/20 rounded-full p-4 mb-3">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">List a New Vehicle</p>
                      <p className="text-sm opacity-80">Quick and easy process</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ROW 2: Subscription (3 columns) and Featured Car (6 columns) */}
              <div className="grid grid-cols-9 gap-4">
                {/* Subscription Card - Repurposed from Pension */}
                <Card className="col-span-3 rounded-3xl w-full h-full flex flex-col">
                  <div className="p-5 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Subscription</h3>
                      <Package className="h-5 w-5 text-[#FF6700]" />
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Free Plan</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Vehicle Listings</span>
                        <span className="font-medium">{totalListings}/{maxFreeListings} Used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-[#FF6700] h-2 rounded-full"
                          style={{ width: `${(totalListings / maxFreeListings) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {freeListingsRemaining} free listings remaining
                      </p>
                    </div>

                    <div className="border border-dashed border-gray-300 rounded-xl p-4">
                      <h4 className="font-medium mb-2">Premium Plans</h4>
                      <p className="text-sm text-gray-500 mb-3">Unlock unlimited listings and premium features</p>
                      <Button variant="outline" className="w-full text-[#FF6700] border-[#FF6700] hover:bg-[#FFF8E0]">
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Featured Car Card - Replaces Calendar */}
                <Card className="col-span-6 rounded-3xl overflow-hidden w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
                  <img
                    src={
                      likedCars.length > 0
                        ? (likedCars[currentCarIndex]?.images && likedCars[currentCarIndex].images.length > 0
                          ? likedCars[currentCarIndex].images[0]
                          : likedCars[currentCarIndex]?.image) || "/placeholder.svg?height=400&width=600"
                        : "/placeholder.svg?height=400&width=600&text=No+Saved+Cars"
                    }
                    alt={
                      likedCars.length > 0
                        ? `${likedCars[currentCarIndex]?.make} ${likedCars[currentCarIndex]?.model}`
                        : "No saved cars"
                    }
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="relative z-20 h-full flex flex-col justify-between p-6">
                    <div className="flex justify-between">
                      <span
                        onClick={() => router.push('/liked-cars-page')}
                        className="bg-[#FF6700] text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-[#FF7D33] transition-colors"
                      >
                        View Saved Cars
                      </span>
                      {likedCars.length > 0 && (
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {likedCars.length} saved cars
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      {likedCars.length > 0 ? (
                        <>
                          <div
                            className="text-white cursor-pointer"
                            onClick={() => handleViewDetails(likedCars[currentCarIndex])}
                          >
                            <h3 className="text-2xl font-bold mb-1">
                              {likedCars[currentCarIndex]?.year} {likedCars[currentCarIndex]?.make}{" "}
                              {likedCars[currentCarIndex]?.model}
                            </h3>
                            <p className="text-white/80 mb-2">
                              {likedCars[currentCarIndex]?.variant} • {likedCars[currentCarIndex]?.mileage} km
                            </p>
                            <p className="text-xl font-bold text-[#FF6700]">{likedCars[currentCarIndex]?.price}</p>
                          </div>
                          <Button
                            className="bg-white text-[#3E5641] hover:bg-white/90"
                            onClick={() => {
                              // Open contact form or modal
                              if (likedCars[currentCarIndex]) {
                                window.open(
                                  `mailto:${likedCars[currentCarIndex].sellerEmail}?subject=Inquiry about your ${likedCars[currentCarIndex].year} ${likedCars[currentCarIndex].make} ${likedCars[currentCarIndex].model}&body=Hello ${likedCars[currentCarIndex].sellerName},%0D%0A%0D%0AI am interested in your ${likedCars[currentCarIndex].year} ${likedCars[currentCarIndex].make} ${likedCars[currentCarIndex].model} listed for ${likedCars[currentCarIndex].price}.%0D%0A%0D%0APlease contact me with more information.%0D%0A%0D%0AThank you.`,
                                )
                              }
                            }}
                          >
                            Contact Seller
                          </Button>
                        </>
                      ) : (
                        <div className="text-white text-center w-full">
                          <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <h3 className="text-xl font-bold mb-1">No Saved Cars</h3>
                          <p className="text-white/80 mb-4">Save cars you're interested in to see them here</p>
                          <Button className="bg-white text-[#3E5641] hover:bg-white/90" onClick={onShowAllCars}>
                            Browse Cars
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Carousel indicators */}
                    {likedCars.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {likedCars.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentCarIndex === index ? "bg-white w-4" : "bg-white/40"
                            }`}
                            onClick={() => setCurrentCarIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN (3 of 12): Recently Listed Cars */}
            <div className="col-span-3 h-full">
              <Card className="rounded-3xl w-full h-full flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Recently Listed Cars</h3>
                  <Button variant="ghost" size="sm" className="text-[#FF6700]">
                    View All
                  </Button>
                </div>

                <div className="flex-grow overflow-auto p-3">
                  {listedCars.length > 0 ? (
                    listedCars.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center gap-3 p-3 mb-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(vehicle)} // Add click handler to view details
                      >
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={vehicle.image || "/placeholder.svg"}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">{vehicle.price}</div>
                        </div>
                        <div className="flex items-center ml-2"> {/* Group buttons */}
                          {/* Edit button */}
                          {onEditListedCar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); onEditListedCar(vehicle); }}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {/* Delete button */}
                          {onDeleteListedCar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); onDeleteListedCar(vehicle); }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No cars listed yet.</p>
                      <p className="text-sm">List your first car below!</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full" onClick={onViewUploadVehicle}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Listing
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
    );
}
