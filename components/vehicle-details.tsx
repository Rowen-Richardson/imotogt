"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import type React from "react"
import Image from "next/image"  // Add this import

import {
  Wifi,
  Car,
  Thermometer,
  Clock,
  ShoppingBag,
  Shield,
  Heart,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Star, // Keep for review tab
  UploadCloud, // For image upload
  Search, // For image zoom overlay
  MapPin, // For location display
} from "lucide-react"
import type { Vehicle } from "@/types/vehicle"
import type { UserProfile } from "@/types/user";
import { useLikedCars } from "@/context/LikedCarsContext";

interface VehicleDetailsProps {
  vehicle: Vehicle // Assumes Vehicle type now has vehicle.images?: string[]
  onBack: () => void
  user?: UserProfile // Changed 'any' to 'UserProfile'
  isEditMode?: boolean; // To enable editing UI
  onUpdateVehicle?: (updatedVehicle: Vehicle) => void; // Callback to save changes
}

export default function VehicleDetails({
  vehicle,
  onBack,
  user,
  isEditMode = false,
  onUpdateVehicle
}: VehicleDetailsProps) {
  // DEBUG: Print the full vehicle object to check seller fields
  console.log('VehicleDetails vehicle:', vehicle);
  // Debug log
  console.log('Vehicle details:', {
    sellerName: vehicle.sellerName,
    sellerEmail: vehicle.sellerEmail,
    sellerPhone: vehicle.sellerPhone,
    sellerSuburb: vehicle.sellerSuburb,
    sellerCity: vehicle.sellerCity,
    sellerProvince: vehicle.sellerProvince
  });
  // Debug log to see what data we're receiving
  console.log('Vehicle Details:', {
    sellerName: vehicle.sellerName,
    sellerEmail: vehicle.sellerEmail,
    sellerPhone: vehicle.sellerPhone,
    sellerSuburb: vehicle.sellerSuburb,
    sellerCity: vehicle.sellerCity,
    sellerProvince: vehicle.sellerProvince,
    userId: vehicle.userId
  });
  const [showContactForm, setShowContactForm] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [imageError, setImageError] = useState(false)

  // States for editable fields
  const [editableData, setEditableData] = useState<Partial<Vehicle>>({ ...vehicle });
  const [editableImages, setEditableImages] = useState<string[]>(
    (vehicle.images && vehicle.images.length > 0 ? [...vehicle.images] : (vehicle.image ? [vehicle.image] : []))
  );
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // Helper function to format raw price string to "R X XXX.XX" for display
  const formatPriceForDisplay = (rawValue: string | number | undefined | null): string => {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
      return "R 0.00"; // Default display for invalid/empty price
    }

    let numericString = String(rawValue).replace(/[^\d.]/g, ''); // Keep only digits and one dot

    if (numericString.startsWith('.')) {
      numericString = '0' + numericString;
    }

    const parts = numericString.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : "";

    if (integerPart === "" && decimalPart !== "") {
        integerPart = "0";
    }

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    if (decimalPart.length === 0) {
      decimalPart = "00";
    } else if (decimalPart.length === 1) {
      decimalPart += "0";
    } else if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2);
    }
    return `R ${formattedInteger || "0"}.${decimalPart}`;
  };

  useEffect(() => {
    // When vehicle or editMode changes, reset editable states
    let initialPrice = vehicle.price;
    // If in edit mode, ensure the price is a raw numeric string for the input field
    if (initialPrice !== undefined && initialPrice !== null) {
        // Convert to string, remove currency symbols, spaces, etc., keep only digits and one dot
        let rawPrice = String(initialPrice).replace(/[^\d.]/g, '');
        const parts = rawPrice.split('.');
        if (parts.length > 1) { // If there's a decimal part
            // Keep the first dot, limit decimal places to 2
            rawPrice = parts[0] + '.' + parts.slice(1).join('').substring(0, 2);
        }
        // Handle cases like "." -> "0." or ".5" -> "0.5"
        if (rawPrice === '.') rawPrice = '0.';
        else if (rawPrice.startsWith('.')) rawPrice = '0' + rawPrice;
        initialPrice = rawPrice; // This is now a clean numeric string or potentially empty
    }

    setEditableData({ ...vehicle, price: initialPrice });
    setEditableImages(
      (vehicle.images && vehicle.images.length > 0 ? [...vehicle.images] : (vehicle.image ? [vehicle.image] : []))
    );
  }, [vehicle, isEditMode]);

  // Check if this vehicle is in the saved cars list

  useEffect(() => {
    setIsZoomed(false)
    setImageError(false)
  }, [selectedImageIndex])

  // Add touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX

    if (Math.abs(deltaX) > 50) { // Minimum swipe distance
      navigateImage(deltaX > 0 ? "prev" : "next")
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleContactClick = () => {
    if (isMobile) {
      window.location.href = `tel:${vehicle.sellerPhone.replace(/\s+/g, "")}`
    } else {
      setShowContactForm(true)
    }
  }

  const sellerAddressDisplay = useMemo(() => {
    const parts = [];
    // Always try to use seller-specific location first
    if (vehicle.sellerSuburb) {
      parts.push(vehicle.sellerSuburb.trim());
    }
    if (vehicle.sellerCity) {
      parts.push(vehicle.sellerCity.trim());
    }
    if (vehicle.sellerProvince) {
      parts.push(vehicle.sellerProvince.trim());
    }
    
    // Only fall back to vehicle location if no seller location is available
    if (parts.length === 0) {
      if (vehicle.city) parts.push(vehicle.city.trim());
      if (vehicle.province) parts.push(vehicle.province.trim());
    }
    
    // Filter out any empty strings and join with commas
    return parts.filter(part => part && part.length > 0).join(", ") || "Location not available";
  }, [vehicle.sellerSuburb, vehicle.sellerCity, vehicle.sellerProvince, vehicle.city, vehicle.province]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Message sent to ${vehicle.sellerEmail}!\n\nFrom: ${email}\nMessage: ${message}`)
    setShowContactForm(false)
    setEmail("")
    setMessage("")
  }

  const { addLikedCar, removeLikedCar, isCarLiked } = useLikedCars();
  const isLiked = isCarLiked(vehicle.id);

  const handleLikeClick = () => {
    if (isLiked) {
      removeLikedCar(vehicle.id);
    } else {
      addLikedCar(vehicle);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | undefined = value;

    if (name === "year" || name === "mileage") {
      processedValue = value === "" ? undefined : parseInt(value.replace(/\D/g, ""), 10);
      if (isNaN(processedValue as number)) processedValue = undefined;
    } else if (name === "price") {
      // Sanitize price input to store a raw numeric string (e.g., "12345.67")
      let rawPrice = String(value).replace(/[^\d.]/g, ''); // Remove non-digits except dot
      const parts = rawPrice.split('.');
      if (parts.length > 1) { // If there's a decimal part
        // Allow only one decimal point, and limit to two decimal places
        rawPrice = parts[0] + '.' + parts.slice(1).join('').substring(0, 2);
      }
      // Ensure it's not just "." or starts with "." like ".50" -> "0.50"
      if (rawPrice === '.') {
        rawPrice = '0.';
      } else if (rawPrice.startsWith('.')) {
        rawPrice = '0' + rawPrice;
      }
      processedValue = rawPrice;
    }
    // For other fields, it's a direct string update

    setEditableData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSaveChanges = () => {
    if (onUpdateVehicle) {
      const finalVehicleData: Vehicle = {
        ...vehicle, // Start with original non-editable/non-present fields
        ...editableData, // Override with edited fields
        images: editableImages,
        image: editableImages.length > 0 ? editableImages[0] : vehicle.image, // Update main image
      };
      onUpdateVehicle(finalVehicleData);
    }
  };

  const allDisplayableImages = useMemo(() => {
    return isEditMode ? editableImages : (
      vehicle.images && vehicle.images.length > 0 ? vehicle.images : (vehicle.image ? [vehicle.image] : [])
    );
  }, [vehicle.images, vehicle.image, isEditMode, editableImages]);

  const handleImageDelete = (indexToDelete: number) => {
    if (!isEditMode) return;
    setEditableImages(prev => prev.filter((_, index) => index !== indexToDelete));
    // If deleting the image currently in modal, close modal or navigate
    if (selectedImageIndex === indexToDelete) {
      closeImageModal();
    } else if (selectedImageIndex !== null && indexToDelete < selectedImageIndex) {
      setSelectedImageIndex(prev => prev !== null ? prev -1 : null);
    }
  };

  // Get images for Gallery 1 (5 images)
  const getGalleryOneImages = () => {
    return allDisplayableImages.slice(0, 5)
  }

  // Get images for Gallery 2 (8 images)
  const getGalleryTwoImages = () => {
    return allDisplayableImages.slice(5, 13)
  }

  // Get images for Gallery 3 (8 images)
  const getGalleryThreeImages = () => {
    return allDisplayableImages.slice(13, 21)
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setIsImageModalOpen(true)
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden"
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    setSelectedImageIndex(null)
    // Restore body scrolling
    document.body.style.overflow = "auto"
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return

    const totalImages = allDisplayableImages.length
    if (direction === "prev") {
      setSelectedImageIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : totalImages - 1) : null))
    } else {
      setSelectedImageIndex((prev) => (prev !== null ? (prev < totalImages - 1 ? prev + 1 : 0) : null))
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isImageModalOpen || selectedImageIndex === null) return

      if (e.key === "Escape") {
        closeImageModal()
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev")
      } else if (e.key === "ArrowRight") {
        navigateImage("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isImageModalOpen, selectedImageIndex, allDisplayableImages.length]) // Added allDisplayableImages.length

  const handleTriggerImageUpload = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click();
    }
  };

  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const currentImageCount = editableImages.length;
      const remainingSlots = 21 - currentImageCount;

      if (remainingSlots <= 0) {
        alert("You have reached the maximum limit of 21 images.");
        return;
      }

      const filesToUpload = filesArray.slice(0, remainingSlots);
      const newImageUrlsPromises = filesToUpload.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImageUrlsPromises).then(newUrls => {
        setEditableImages(prev => [...prev, ...newUrls]);
      });

      if (imageUploadRef.current) imageUploadRef.current.value = ""; // Reset file input
    }
  };

  const galleryOneDisplayImages = getGalleryOneImages()
  const galleryTwoDisplayImages = getGalleryTwoImages()
  const galleryThreeDisplayImages = getGalleryThreeImages()
  return (
    <div className="min-h-screen">
      {/* Header Section with Back Button and Price */}
      <section className="px-6 pt-6 md:pt-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center text-[#FF6700] dark:text-[#FF7D33] hover:underline"
          >
            &larr; {isEditMode ? "Cancel Edit" : "Back to Listings"}
          </button>
          {isEditMode ? (
            <input
              type="text"
              name="price"
              value={editableData.price || ""}
              onChange={handleInputChange}
              className="text-[#FF6700] dark:text-[#FF7D33] text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-[#FF6700]/50 focus:border-[#FF6700] outline-none p-1 text-right w-48"
              placeholder="Enter Price"
            />
          ) : (
            <p className="text-[#FF6700] dark:text-[#FF7D33] text-2xl md:text-3xl font-bold">{formatPriceForDisplay(vehicle.price)}</p>
          )}
        </div>
        {isEditMode && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-7xl mx-auto mt-1">You are in edit mode. Click on fields to edit them.</p>
        )}
      </section>

      {/* Image Gallery */}
      {allDisplayableImages.length === 0 ? (
        <div className="px-6 max-w-7xl mx-auto mt-4 h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No images available for this vehicle.</p>
        </div>
      ) : isEditMode ? (
        <div className="px-6 max-w-7xl mx-auto mt-4">
          <h3 className="text-xl font-semibold mb-2 text-[#3E5641] dark:text-white">Edit Images ({editableImages.length}/21)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-4">
            {editableImages.map((imgSrc, index) => (
              <div key={`edit-img-${index}`} className="relative aspect-square group">
                <img src={imgSrc} alt={`Editable view ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                <button onClick={() => handleImageDelete(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {editableImages.length < 21 && (
              <button onClick={handleTriggerImageUpload} className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <UploadCloud className="w-8 h-8 mb-1" /> <span className="text-xs">Add Image</span>
              </button>
            )}
          </div>
          <input type="file" multiple accept="image/*" ref={imageUploadRef} onChange={handleImageFilesUpload} className="hidden" />
          <p className="text-xs text-gray-500 dark:text-gray-400">You can upload up to 21 images. The first image will be the main display image. Drag and drop to reorder (feature coming soon).</p>
        </div>
      ) : (
        <div className="px-6 max-w-7xl mx-auto mt-4 relative">
          <div className="gallery-container relative flex items-center">
            <div
              className="gallery-scroll flex overflow-x-auto snap-x snap-mandatory w-full"
            >
              {/* Gallery 1 */}
              {galleryOneDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
                  <div className="md:col-span-2 h-full overflow-hidden rounded-lg group relative">
                    <Image // Using Next/Image for optimization
                      src={galleryOneDisplayImages[0]}
                      alt={`${vehicle.make} ${vehicle.model} main view`}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => openImageModal(0)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/80 rounded-full p-2">
                        <Search className="w-6 h-6 text-[#3E5641]" />
                      </div>
                    </div>
                  </div>
                  {galleryOneDisplayImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {galleryOneDisplayImages.slice(1).map((imgSrc, index) => (
                        <div key={`g1-thumb-${index}`} className="aspect-square overflow-hidden rounded-lg group relative h-full">
                          <Image
                            src={imgSrc}
                            alt={`${vehicle.make} ${vehicle.model} view ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openImageModal(index + 1)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/80 rounded-full p-2">
                              <Search className="w-4 h-4 text-[#3E5641]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Gallery 2 */}
              {galleryTwoDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-2 sm:grid-cols-4 gap-4 h-[400px]">
                  {galleryTwoDisplayImages.map((imgSrc, index) => (
                    <div key={`g2-img-${index}`} className="w-full h-full overflow-hidden rounded-lg group relative">
                      <Image
                        src={imgSrc}
                        alt={`${vehicle.make} ${vehicle.model} additional view ${index + 5}`}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openImageModal(index + 5)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/80 rounded-full p-2">
                          <Search className="w-4 h-4 text-[#3E5641]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Gallery 3 */}
              {galleryThreeDisplayImages.length > 0 && (
                <section className="gallery-section flex-shrink-0 w-full snap-center grid grid-cols-2 sm:grid-cols-4 gap-4 h-[400px]">
                  {galleryThreeDisplayImages.map((imgSrc, index) => (
                    <div key={`g3-img-${index}`} className="w-full h-full overflow-hidden rounded-lg group relative">
                      <Image
                        src={imgSrc}
                        alt={`${vehicle.make} ${vehicle.model} additional view ${index + 13}`}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openImageModal(index + 13)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/80 rounded-full p-2">
                          <Search className="w-4 h-4 text-[#3E5641]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImageIndex !== null && !isEditMode && ( // Disable modal in edit mode for simplicity
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image view"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-50"
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={() => navigateImage("prev")}
              className="text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => navigateImage("next")}
              className="text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-50"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Image Container */}
          <div className="relative max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center">
            {imageError ? (
              <div className="text-white text-center p-4">
                <p>Failed to load image</p>
                <button
                  onClick={() => setImageError(false)}
                  className="mt-2 text-sm text-[#FF6700] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className={`relative w-full h-full transition-transform duration-300 ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}>
                <Image
                  src={allDisplayableImages[selectedImageIndex]}
                  alt={`${vehicle.make} ${vehicle.model} enlarged view`}
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  priority
                  onError={() => setImageError(true)}
                  onDoubleClick={() => setIsZoomed(!isZoomed)}
                />
              </div>
            )}

            {/* Image Position Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {allDisplayableImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Title and Details */}
      <div className="px-6 max-w-7xl mx-auto mt-4">
        <div className="flex justify-between items-center mb-2">
          {isEditMode ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input type="number" name="year" placeholder="Year" value={editableData.year || ""} onChange={handleInputChange} className="form-input-edit text-xl font-bold" />
              <input type="text" name="make" placeholder="Make" value={editableData.make || ""} onChange={handleInputChange} className="form-input-edit text-xl font-bold" />
              <input type="text" name="model" placeholder="Model" value={editableData.model || ""} onChange={handleInputChange} className="form-input-edit text-xl font-bold" />
              <input type="text" name="variant" placeholder="Variant (Optional)" value={editableData.variant || ""} onChange={handleInputChange} className="form-input-edit text-xl" />
            </div>
          ) : (
            <h2 className="text-2xl md:text-3xl font-bold text-[#3E5641] dark:text-white">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
            </h2>
          )}
          <div className="flex gap-4 items-center">
            {isEditMode && (
                <button
                    onClick={handleSaveChanges}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Save Changes
                </button>
            )}
            {!isEditMode && ( // Only show sponsored and save if not in edit mode
            <>
            <div className="bg-[#9FA791]/20 dark:bg-[#4A4D45]/40 px-3 py-1.5 rounded-full text-sm text-[#3E5641] dark:text-white">
              Sponsored
            </div>
            <button
              onClick={handleLikeClick}
              className="text-[#3E5641] dark:text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 hover:bg-[#FFF8E0] dark:hover:bg-[#2A352A] cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "text-purple-600 fill-purple-600" : "text-[#FF6700] dark:text-[#FF7D33]"}`}
              />
              <span>{isLiked ? "Saved" : "Save"}</span>
            </button>
            </>
            )}
          </div>
        </div>

        {isEditMode ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <input type="number" name="mileage" placeholder="Mileage (km)" value={editableData.mileage || ""} onChange={handleInputChange} className="form-input-edit-sm" />
            <input type="text" name="transmission" placeholder="Transmission" value={editableData.transmission || ""} onChange={handleInputChange} className="form-input-edit-sm" />
            <input type="text" name="fuel" placeholder="Fuel Type" value={editableData.fuel || ""} onChange={handleInputChange} className="form-input-edit-sm" />
            <input type="text" name="engineCapacity" placeholder="Engine (e.g., 2.0L)" value={editableData.engineCapacity || ""} onChange={handleInputChange} className="form-input-edit-sm" />
          </div>
        ) : (
          <p className="text-[#6F7F69] dark:text-gray-300 mb-2">
            Mileage: {vehicle.mileage} km | Transmission: {vehicle.transmission} | Fuel: {vehicle.fuel} | Engine:{" "}
            {vehicle.engineCapacity}
          </p>
        )}
      </div>
      
      {/* Tabs Section */}
      <div className="border-b border-[#9FA791]/20 dark:border-[#4A4D45]/20 mt-4">
        <div className="px-6 max-w-7xl mx-auto flex space-x-8">
          <button
            className={`py-3 font-medium ${activeTab === "details" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`py-3 font-medium filter blur-sm ${activeTab === "report" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("report")}
          >
            Vehicle Report
          </button>
          <button
            className={`py-3 font-medium filter blur-sm ${activeTab === "insurance" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("insurance")}
          >
            Insurance Quote
          </button>
          <button
            className={`py-3 font-medium filter blur-sm ${activeTab === "review" ? "border-b-2 border-[#FF6700] dark:border-[#FF7D33] text-[#3E5641] dark:text-white" : "text-[#6F7F69] dark:text-gray-400 hover:text-[#3E5641] dark:hover:text-white"}`}
            onClick={() => setActiveTab("review")}
          >
            Vehicle Review
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "details" && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white">Description</h2>
                {isEditMode ? (
                  <textarea
                    name="description"
                    value={editableData.description || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[150px] text-[#3E5641] dark:text-white bg-white dark:bg-[#2A352A] focus:ring-2 focus:ring-[#FF6700] dark:focus:ring-[#FF7D33]"
                    placeholder="Enter vehicle description..."
                  />
                ) : (
                  vehicle.description ? (
                    <p className="text-[#6F7F69] dark:text-gray-300 mb-6 whitespace-pre-wrap">{vehicle.description}</p>
                  ) : (
                    <p className="text-[#6F7F69] dark:text-gray-300 mb-6">
                      No specific description provided by the seller. General details: {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}, {vehicle.mileage} km, {vehicle.transmission}, {vehicle.fuel} engine. Located in {vehicle.city || 'N/A'}, {vehicle.province || 'N/A'}.
                    </p>
                  )
                )}

                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-[#3E5641] dark:text-white">Technical Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isEditMode ? (
                      <>
                        <EditableField label="Make" name="make" value={editableData.make} onChange={handleInputChange} />
                        <EditableField label="Model" name="model" value={editableData.model} onChange={handleInputChange} />
                        <EditableField label="Variant" name="variant" value={editableData.variant} onChange={handleInputChange} placeholder="Optional" />
                        <EditableField label="Year" name="year" type="number" value={editableData.year} onChange={handleInputChange} />
                        <EditableField label="Mileage (km)" name="mileage" type="number" value={editableData.mileage} onChange={handleInputChange} />
                        <EditableField label="Transmission" name="transmission" value={editableData.transmission} onChange={handleInputChange} />
                        <EditableField label="Fuel Type" name="fuel" value={editableData.fuel} onChange={handleInputChange} />
                        <EditableField label="Engine Capacity" name="engineCapacity" value={editableData.engineCapacity} onChange={handleInputChange} />
                        <EditableField label="Body Type" name="bodyType" value={editableData.bodyType} onChange={handleInputChange} />
                        <EditableField label="City" name="city" value={editableData.city} onChange={handleInputChange} />
                        <EditableField label="Province" name="province" value={editableData.province} onChange={handleInputChange} />
                      </>
                    ) : (
                      <>
                        <div><p className="detail-label">Make</p><p className="detail-value">{vehicle.make}</p></div>
                        <div><p className="detail-label">Model</p><p className="detail-value">{vehicle.model} {vehicle.variant}</p></div>
                        <div><p className="detail-label">Year</p><p className="detail-value">{vehicle.year}</p></div>
                        <div><p className="detail-label">Mileage</p><p className="detail-value">{vehicle.mileage} km</p></div>
                        <div><p className="detail-label">Transmission</p><p className="detail-value">{vehicle.transmission}</p></div>
                        <div><p className="detail-label">Fuel</p><p className="detail-value">{vehicle.fuel}</p></div>
                        <div><p className="detail-label">Engine</p><p className="detail-value">{vehicle.engineCapacity}</p></div>
                        <div><p className="detail-label">Body Type</p><p className="detail-value">{vehicle.bodyType}</p></div>
                        <div><p className="detail-label">City</p><p className="detail-value">{vehicle.city}</p></div>
                        <div><p className="detail-label">Province</p><p className="detail-value">{vehicle.province}</p></div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "report" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white filter blur-sm">Vehicle Report</h2>
                <div className="relative h-[400px] w-full rounded-lg">
                  <div className="h-full w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center filter blur-sm">
                    <div className="text-center">
                      <Car className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                      <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">
                        Comprehensive vehicle history report
                      </p>
                      <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">
                        Including accident history, service records, and ownership details
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <p className="text-white text-2xl font-semibold">Coming Soon</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "insurance" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white filter blur-sm">Insurance Quote</h2>
                <div className="relative h-[400px] w-full rounded-lg">
                  <div className="h-full w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center filter blur-sm">
                    <div className="text-center">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                      <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">
                        Get instant insurance quotes
                      </p>
                      <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">
                        Compare rates from multiple providers
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <p className="text-white text-2xl font-semibold">Coming Soon</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "review" && (
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 text-[#3E5641] dark:text-white filter blur-sm">Vehicle Review</h2>
                <div className="relative h-[400px] w-full rounded-lg">
                  <div className="h-full w-full bg-[#f5f5f5] dark:bg-[#2A352A] rounded-lg flex items-center justify-center filter blur-sm">
                    <div className="text-center">
                      <Star className="w-16 h-16 mx-auto mb-4 text-[#9FA791] dark:text-[#4A4D45]" />
                      <p className="text-lg font-medium text-[#6F7F69] dark:text-gray-400">Expert vehicle reviews</p>
                      <p className="text-sm text-[#9FA791] dark:text-[#4A4D45] mt-2">Detailed analysis and ratings</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <p className="text-white text-2xl font-semibold">Coming Soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Seller Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#3E5641]/80 dark:bg-[#1F2B20]/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{isEditMode ? "Edit Seller Information" : "Contact Seller"}</h3>
                {vehicle.sellerProfilePic && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6700]/20">
                    <Image
                      src={vehicle.sellerProfilePic || '/placeholder-user.jpg'}
                      alt={vehicle.sellerName || 'Seller'}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-5">
                  <div className="border-b border-white/10 pb-4">
                      <p className="text-gray-300 text-sm mb-2">Seller</p>
                      <div className="flex items-center space-x-2">
                          <p className="text-white text-lg font-medium">
                            {vehicle.sellerName}
                          </p>
                          {/* Show 'You' badge only if logged in user is the seller, but always show seller name */}
                          {user && user.id === vehicle.userId && (
                            <span className="bg-[#FF6700]/20 text-[#FF6700] text-xs px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                      </div>
                  </div>
                  <div className="border-b border-white/10 pb-4">
                      <p className="text-gray-300 text-sm mb-2">Contact Information</p>
                      <div className="space-y-2">
                        {vehicle.sellerPhone && (
                          <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 text-[#FF6700]" />
                              <a href={`tel:${vehicle.sellerPhone.replace(/\s+/g, '')}`} 
                                className="text-white hover:text-[#FF6700] transition-colors">
                                  {vehicle.sellerPhone}
                              </a>
                          </div>
                        )}
                        {vehicle.sellerEmail && (
                          <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-[#FF6700]" />
                              <a href={`mailto:${vehicle.sellerEmail}`} 
                                className="text-white hover:text-[#FF6700] transition-colors break-all">
                                  {vehicle.sellerEmail}
                              </a>
                          </div>
                        )}
                      </div>
                  </div>
                  <div>
                      <p className="text-gray-300 text-sm mb-2">Location</p>
                      <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-[#FF6700] flex-shrink-0" />
                          <p className="text-white">
                            {sellerAddressDisplay}
                          </p>
                      </div>
                  </div>
                  {!isEditMode && user?.id !== vehicle.userId && (
                      <button
                          onClick={handleContactClick}
                          className="w-full mt-4 bg-[#FF6700] hover:bg-[#FF7D33] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                          Contact Seller
                      </button>
                  )}
              </div>
            </div>

            {/* Location Map */}
            <div className="mt-6 rounded-xl overflow-hidden h-[150px] w-full shadow-lg">
              <iframe
                title="Seller Location"
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  sellerAddressDisplay || `${vehicle.city}, ${vehicle.province}`,
                )}&output=embed&hl=en`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for editable fields to reduce repetition
const EditableField = ({ label, name, value, onChange, type = "text", placeholder, textWhite = false, isTextarea = false }: {
  label: string;
  name: keyof Vehicle;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  textWhite?: boolean;
  isTextarea?: boolean;
}) => (
  <div>
    <label htmlFor={name} className={`block text-sm font-medium ${textWhite ? 'text-gray-300' : 'text-[#6F7F69] dark:text-gray-300'} mb-1 text-white`}>{label}</label>
    {isTextarea ? (
      <textarea id={name} name={name} value={value || ""} onChange={onChange} placeholder={placeholder || label} className={`form-input-edit w-full min-h-[80px] ${textWhite ? 'bg-[#576B55] dark:bg-[#2A352A] text-white placeholder-gray-400' : ''}`} />
    ) : (
      <input type={type} id={name} name={name} value={value || ""} onChange={onChange} placeholder={placeholder || label} className={`form-input-edit w-full ${textWhite ? 'bg-[#576B55] dark:bg-[#2A352A] text-white placeholder-gray-400' : ''}`} />
    )}
  </div>
);
