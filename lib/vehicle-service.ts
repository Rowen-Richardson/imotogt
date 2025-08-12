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
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        users!vehicles_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          suburb,
          city,
          province,
          profile_pic
        )
      `);

    if (error) {
      console.error("Error fetching vehicles:", error)
      return []
    }

    if (data) {
      return data.map(item => {
        const userData = item.users;
        // Extract and transform fields first
        const {
          user_id,
          engine_capacity,
          body_type,
          seller_name,
          seller_email,
          seller_phone,
          seller_profile_pic,
          seller_suburb,
          seller_city,
          seller_province,
          users,
          ...rest
        } = item;
        
        // Create transformed vehicle object
        const vehicle = {
          ...rest, // spread the untransformed fields
          userId: user_id,
          engineCapacity: engine_capacity,
          bodyType: body_type,
          // Map seller info either from joined user data or existing seller fields
          sellerName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : seller_name || '',
          sellerEmail: userData?.email || seller_email || '',
          sellerPhone: userData?.phone || seller_phone || '',
          sellerProfilePic: userData?.profile_pic || seller_profile_pic || '',
          sellerSuburb: userData?.suburb || seller_suburb || '',
          sellerCity: userData?.city || seller_city || '',
          sellerProvince: userData?.province || seller_province || ''
        };
        return vehicle as Vehicle;
      });
    }

    return [];
  },

  /**
   * Fetch a single vehicle by its ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        users!vehicles_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          suburb,
          city,
          province,
          profile_pic
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching vehicle ${id}:`, error)
      return null
    }

    // Transform the response to match our Vehicle interface
    if (data) {
      const userData = data.users;
      const vehicle = {
        ...data,
        userId: data.user_id,
        engineCapacity: data.engine_capacity,
        bodyType: data.body_type,
        // Map seller info either from joined user data or existing seller fields
        sellerName: userData ? `${userData.first_name} ${userData.last_name}`.trim() : data.seller_name,
        sellerEmail: userData?.email || data.seller_email,
        sellerPhone: userData?.phone || data.seller_phone || '',
        sellerProfilePic: userData?.profile_pic || data.seller_profile_pic,
        sellerSuburb: userData?.suburb || data.seller_suburb || '',
        sellerCity: userData?.city || data.seller_city || '',
        sellerProvince: userData?.province || data.seller_province || ''
      };
      delete vehicle.users; // Remove the nested user object
      delete vehicle.user_id; // Clean up snake_case fields
      delete vehicle.seller_name;
      delete vehicle.seller_email;
      delete vehicle.seller_phone;
      delete vehicle.seller_profile_pic;
      delete vehicle.seller_suburb;
      delete vehicle.seller_city;
      delete vehicle.seller_province;
      return vehicle as Vehicle;
    }
    return null;
  },

  /**
   * Fetch vehicles listed by a specific user
   */
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        users!vehicles_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          suburb,
          city,
          province,
          profile_pic
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error(`Error fetching vehicles for user ${userId}:`, error)
      return []
    }

    if (data) {
      return data.map(item => {
        const userData = item.users;
        const {
          user_id,
          engine_capacity,
          body_type,
          seller_name,
          seller_email,
          seller_phone,
          seller_profile_pic,
          seller_suburb,
          seller_city,
          seller_province,
          users,
          ...rest
        } = item;
        
        return {
          ...rest,
          userId: user_id,
          engineCapacity: engine_capacity,
          bodyType: body_type,
          sellerName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : seller_name || '',
          sellerEmail: userData?.email || seller_email || '',
          sellerPhone: userData?.phone || seller_phone || '',
          sellerProfilePic: userData?.profile_pic || seller_profile_pic || '',
          sellerSuburb: userData?.suburb || seller_suburb || '',
          sellerCity: userData?.city || seller_city || '',
          sellerProvince: userData?.province || seller_province || ''
        } as Vehicle;
      });
    }
    return []
  },

  /**
   * Create a new vehicle listing, upload images, and link them.
   */
  async createVehicle(vehicleData: VehiclePayload): Promise<Vehicle> {
    const { userId, images, ...restOfData } = vehicleData
    // 1. Fetch user data to populate seller fields
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !userProfile) {
      console.error("Error fetching user profile:", userError)
      throw new Error("Could not fetch user profile to create vehicle listing.")
    }

    // 2. Insert vehicle data with seller info from the user's profile
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
        condition: vehicleData.condition,
        location: vehicleData.location,
        exterior_color: vehicleData.exteriorColor,
        interior_color: vehicleData.interiorColor,
        // Automatically populate seller info from the user's profile
        seller_name: `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim(),
        seller_email: userProfile.email,
        seller_phone: userProfile.phone,
        seller_suburb: userProfile.suburb,
        seller_city: userProfile.city,
        seller_province: userProfile.province,
        seller_profile_pic: userProfile.profile_pic,
        status: "active",
      })
      .select() // retrieves all columns of the newly created row
      .single()

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
      .select(`
        vehicles (
          *,
          users!vehicles_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            suburb,
            city,
            province,
            profile_pic
          )
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error(`Error fetching saved vehicles for user ${userId}:`, error)
      return []
    }

    if (!data) return [];

    // Transform the nested vehicle data with user info
    return data.map(item => {
      if (!item.vehicles) return null;

      const vehicleData = item.vehicles;
      const userData = vehicleData.users;

      const {
        user_id,
        engine_capacity,
        body_type,
        seller_name,
        seller_email,
        seller_phone,
        seller_profile_pic,
        seller_suburb,
        seller_city,
        seller_province,
        users,
        ...rest
      } = vehicleData;
      
      return {
        ...rest,
        userId: user_id,
        engineCapacity: engine_capacity,
        bodyType: body_type,
        sellerName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : seller_name || '',
        sellerEmail: userData?.email || seller_email || '',
        sellerPhone: userData?.phone || seller_phone || '',
        sellerProfilePic: userData?.profile_pic || seller_profile_pic || '',
        sellerSuburb: userData?.suburb || seller_suburb || '',
        sellerCity: userData?.city || seller_city || '',
        sellerProvince: userData?.province || seller_province || ''
      } as Vehicle;
    }).filter(Boolean);
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