import { supabase, storageService } from "./supabase"
import type { Vehicle } from "@/types/vehicle"

type VehiclePayload = Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "images"> & {
  userId: string
  images: string[]
}

export const vehicleService = {
  /**
   * Save a vehicle to the saved_vehicles table for a user
   */

  /**
   * Fetch all saved vehicles for a user
   */
  /**
   * Fetch all vehicles with optional filters
   */
  async getVehicles(filters: any = {}): Promise<Vehicle[]> {
    let queryBuilder = supabase
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
      .eq("is_deleted", false);

 // Apply filters
    const {
 query,
      minPrice,
      maxPrice,
      province,
 bodyType, // This comes as an array from AdvancedFilters
      minYear,
      maxYear,
      minMileage,
      maxMileage,
 fuelType, // This comes as an array from AdvancedFilters
      transmission,
      engineCapacityMin,
      engineCapacityMax,
    } = filters;

    if (query) {
      queryBuilder = queryBuilder.or(
        `make.ilike.%${query}%,model.ilike.%${query}%,variant.ilike.%${query}%`,
      );
    }
 if (minPrice) {
      queryBuilder = queryBuilder.gte("price", parseFloat(minPrice));
    }
 if (maxPrice) {
      queryBuilder = queryBuilder.lte("price", parseFloat(maxPrice));
    }
 if (province && province !== "all") {
      queryBuilder = queryBuilder.eq("province", province);
    }
 if (bodyType && bodyType.length > 0) {
      queryBuilder = queryBuilder.in("body_type", bodyType);
    }
 if (minYear) {
      queryBuilder = queryBuilder.gte("year", parseInt(minYear, 10));
    }
 if (maxYear) {
      queryBuilder = queryBuilder.lte("year", parseInt(maxYear, 10));
    }
 if (minMileage) {
      queryBuilder = queryBuilder.gte("mileage", parseInt(minMileage, 10));
    }
 if (maxMileage) {
      queryBuilder = queryBuilder.lte("mileage", parseInt(maxMileage, 10));
    }
 if (fuelType && fuelType.length > 0) {
 queryBuilder = queryBuilder.in("fuel", fuelType);
    }
 if (transmission && transmission !== "any") {
 queryBuilder = queryBuilder.eq("transmission", transmission);
    }
    // Engine capacity range filter (apply if min or max is different from default, or if both are explicitly set)
    const minEngine = parseFloat(engineCapacityMin) || 1.0;
    const maxEngine = parseFloat(engineCapacityMax) || 8.0;
    if (minEngine > 1.0 || maxEngine < 8.0) {
      queryBuilder = queryBuilder.gte("engine_capacity", minEngine).lte("engine_capacity", maxEngine);
    }

    const { data, error } = await queryBuilder;

    if (error) { // Use error from the executed query
      console.error("Supabase query error:", error);
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
      .eq("user_id", userId)
      .eq("is_deleted", false);

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
        location: `${userProfile.suburb || ""} ${userProfile.city || ""} ${userProfile.province || ""}`.trim(), // Derived location
        // Automatically populate seller info from the user's profile
        status: "active",
      })
      .select() // retrieves all columns of the newly created row
      .single()

    if (createError || !newVehicle) {
      console.error("Error creating vehicle record:", createError?.message || createError);
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
        vehicle:vehicle_id (
          *,
          users:user_id (
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
    return data.map(row => {
      const v = row.vehicle;
      if (!v) return null;
      const userData = v.users;
      return {
        ...v,
        userId: v.user_id,
        engineCapacity: v.engine_capacity,
        bodyType: v.body_type,
        sellerName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : v.seller_name || '',
        sellerEmail: userData?.email || v.seller_email || '',
        sellerPhone: userData?.phone || v.seller_phone || '',
        sellerProfilePic: userData?.profile_pic || v.seller_profile_pic || '',
        sellerSuburb: userData?.suburb || v.seller_suburb || '',
        sellerCity: userData?.city || v.seller_city || '',
        sellerProvince: userData?.province || v.seller_province || ''
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
      console.error("Error saving vehicle:", error);
      alert('Supabase error: ' + JSON.stringify(error));
      return false;
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
    // Soft delete: set is_deleted, deleted_at, and delete_reason
    // Accepts an optional reason argument
    const now = new Date().toISOString();
    // This function signature will need to be updated in the context and dashboard to accept reason
    // For now, use a placeholder reason if not provided
    const reason = (arguments.length > 1 && typeof arguments[1] === 'string') ? arguments[1] : 'other';
    const { error } = await supabase.from("vehicles").update({
      is_deleted: true,
      deleted_at: now,
      delete_reason: reason
    }).eq("id", vehicleId);
    if (error) {
      console.error("Error soft deleting vehicle:", error);
      return false;
    }
    return true;
  },
}