"use client"

import type React from "react"

import type { Vehicle } from "@/types/vehicle";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLikedCars } from "@/context/LikedCarsContext";

// Helper function to format raw price string to "R X XXX.XX" for display
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

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails: () => void;
}

export function VehicleCard({ vehicle, onViewDetails }: VehicleCardProps) {
  const { likedCars, addLikedCar, removeLikedCar, isCarLiked } = useLikedCars();
  const isLiked = isCarLiked(vehicle.id);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeLikedCar(vehicle.id);
    } else {
      addLikedCar(vehicle);
    }
  };

  return (
    <div
      className="bg-white dark:bg-[#2A352A] border border-[#9FA791]/20 dark:border-[#4A4D45]/20 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col overflow-hidden group"
      onClick={onViewDetails}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={(vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : vehicle.image) || "/placeholder.svg"}
          alt={`${vehicle.make} ${vehicle.model} ${vehicle.variant || ""}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors"
          aria-label={isLiked ? "Unlike vehicle" : "Like vehicle"}
        >
          <Heart className={cn("w-5 h-5", isLiked ? "fill-red-500 text-red-500" : "fill-transparent")} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-[#3E5641] dark:text-white">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant || ""}
        </h3>
        <p className="text-[#FF6700] dark:text-[#FF7D33] font-bold text-lg mb-3">
          {formatPriceForDisplay(vehicle.price)}
        </p>
        <div className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-300 mb-4">
          {vehicle.mileage} km &bull; {vehicle.transmission} &bull; {vehicle.fuel}
        </div>
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-[#9FA791]/10 dark:border-[#4A4D45]/20">
          <span className="text-sm opacity-70 text-[#6F7F69] dark:text-gray-400">
            {vehicle.city}, {vehicle.province}
          </span>
          <button className="bg-[#FF6700] dark:bg-[#FF7D33] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#FF6700]/90 dark:hover:bg-[#FF7D33]/90 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
