import { supabase, storageService } from "./supabase"
import type { Vehicle } from "@/types/vehicle"

type VehiclePayload = Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "images"> & {
  userId: string
  images: string[]
}

export const vehicleService = {
  /**
   * Fetch all vehicles with optional filters
   */
  async getVehicles(filters: any = {}): Promise<Vehicle[]> {
    const { data, error } = await supabase.from("vehicles").select("*")

    if (error) {
      console.error("Error fetching vehicles:", error)
      return []
    }

    return data as Vehicle[]
  },

  /**
   * Fetch a single vehicle by its ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching vehicle ${id}:`, error)
      return null
    }

    return data as Vehicle
  },

  /**
   * Fetch vehicles listed by a specific user
   */
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase.from("vehicles").select("*").eq("user_id", userId)

    if (error) {
      console.error(`Error fetching vehicles for user ${userId}:`, error)
      return []
    }
    return data as Vehicle[]
  },

  /**
   * Create a new vehicle listing, upload images, and link them.
   */
  async createVehicle(vehicleData: VehiclePayload): Promise<Vehicle> {
    const { userId, images, ...restOfData } = vehicleData;

    // 1. Insert vehicle data without images to get an ID
    const { data: newVehicle, error: createError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: vehicleData.make,
        model: vehicleData.model,
        variant: vehicleData.variant,
        year: vehicleData.year,
        price: vehicleData.price,
        mileage: vehicleData.mileage,
        transmission: vehicleData.transmission,
        fuel: vehicleData.fuel,
        engine_capacity: vehicleData.engineCapacity,
        body_type: vehicleData.bodyType,
        description: vehicleData.description,
        city: vehicleData.city,
        province: vehicleData.province,
        seller_name: vehicleData.sellerName,
        seller_email: vehicleData.sellerEmail,
        seller_phone: vehicleData.sellerPhone,
        seller_suburb: vehicleData.sellerSuburb,
        seller_city: vehicleData.sellerCity,
        seller_province: vehicleData.sellerProvince,
        status: 'active',
      })
      .select()
      .single();

    if (createError || !newVehicle) {
      console.error("Error creating vehicle record:", createError);
      throw new Error("Failed to create vehicle listing in database.");
    }

    // 2. Upload images using the new vehicle ID
    const imageUrls = await storageService.uploadVehicleImagesFromBase64(images, newVehicle.id, userId)

    if (imageUrls.length === 0) {
      console.warn(`No images were uploaded for vehicle ${newVehicle.id}`)
    }

    // 3. Update the vehicle record with the image URLs
    const { data: updatedVehicle, error: updateError } = await supabase
      .from("vehicles")
      .update({ images: imageUrls })
      .eq("id", newVehicle.id)
      .select()
      .single()

    if (updateError || !updatedVehicle) {
      console.error("Error updating vehicle with image URLs:", updateError)
      // Consider cleanup logic here, e.g., deleting the vehicle record or uploaded files
      throw new Error("Failed to link images to the vehicle listing.")
    }

    return updatedVehicle as Vehicle
  },

  /**
   * Fetch vehicles saved by a specific user
   */
  async getSavedVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from("saved_vehicles")
      .select(
        `
        vehicles (*)
      `,
      )
      .eq("user_id", userId)

    if (error) {
      console.error(`Error fetching saved vehicles for user ${userId}:`, error)
      return []
    }

    // The result is an array of objects like { vehicles: Vehicle }, so we map it
    return data.map((item: any) => item.vehicles).filter(Boolean) as Vehicle[]
  },

  /**
   * Save a vehicle for a user
   */
  async saveVehicle(userId: string, vehicleId: string): Promise<boolean> {
    const { error } = await supabase.from("saved_vehicles").insert({
      user_id: userId,
      vehicle_id: vehicleId,
    })

    if (error) {
      console.error("Error saving vehicle:", error)
      return false
    }
    return true
  },

  /**
   * Unsave a vehicle for a user
   */
  async unsaveVehicle(userId: string, vehicleId: string): Promise<boolean> {
    const { error } = await supabase.from("saved_vehicles").delete().match({ user_id: userId, vehicle_id: vehicleId })

    if (error) {
      console.error("Error unsaving vehicle:", error)
      return false
    }
    return true
  },

  /**
   * Delete a vehicle listing
   */
  async deleteVehicle(vehicleId: string): Promise<boolean> {
    const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId)

    if (error) {
      console.error("Error deleting vehicle:", error)
      return false
    }
    return true
  },
}