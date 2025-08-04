"use client"

import type React from "react"

import Image from "next/image"
import { Heart } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"
import { cn } from "@/lib/utils"

interface VehicleCardProps {
  vehicle: Vehicle
  onViewDetails: () => void
  isSaved: boolean
  onToggleSave: () => void
  isLoggedIn: boolean
}

const formatPriceForDisplay = (rawValue: string | number | undefined | null): string => {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
    return "R 0.00"
  }
  let numericString = String(rawValue).replace(/[^\d.]/g, "")
  if (numericString.startsWith(".")) {
    numericString = "0" + numericString
  }
  const parts = numericString.split(".")
  let integerPart = parts[0]
  let decimalPart = parts.length > 1 ? parts[1] : ""
  if (integerPart === "" && decimalPart !== "") {
    integerPart = "0"
  }
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  if (decimalPart.length === 0) {
    decimalPart = "00"
  } else if (decimalPart.length === 1) {
    decimalPart += "0"
  } else if (decimalPart.length > 2) {
    decimalPart = decimalPart.substring(0, 2)
  }
  return `R ${formattedInteger || "0"}.${decimalPart}`
}

export default function VehicleCard({ vehicle, onViewDetails, isSaved, onToggleSave, isLoggedIn }: VehicleCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoggedIn) {
      onToggleSave()
    } else {
      // Optionally, redirect to login or show a message
      alert("Please log in to save vehicles.")
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col overflow-hidden group"
      onClick={onViewDetails}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={(vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.image) || "/placeholder.svg"}
          alt={`${vehicle.make} ${vehicle.model}`}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {isLoggedIn && (
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-orange-500 transition-colors"
            aria-label="Save vehicle"
          >
            <Heart className={cn("w-5 h-5", isSaved ? "fill-current text-orange-500" : "text-white")} />
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{vehicle.variant}</p>}
        <p className="text-xl font-semibold text-orange-500 my-2">{formatPriceForDisplay(vehicle.price)}</p>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <p>
            {vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : "N/A"} &bull; {vehicle.transmission}
          </p>
          <p>
            {vehicle.city}, {vehicle.province}
          </p>
        </div>
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center font-semibold text-orange-500 hover:text-orange-600">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
