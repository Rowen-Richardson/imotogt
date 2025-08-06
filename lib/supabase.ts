import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Default client for client-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Handle Supabase errors and return user-friendly messages
 */
export function handleSupabaseError(error: any): string {
  if (!error) return "An unknown error occurred"

  // Auth errors
  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid email or password"
  }
  if (error.message?.includes("Email not confirmed")) {
    return "Please check your email and click the confirmation link"
  }
  if (error.message?.includes("User already registered")) {
    return "An account with this email already exists"
  }
  if (error.message?.includes("Password should be at least")) {
    return "Password must be at least 6 characters long"
  }
  if (error.message?.includes("JWT") || error.message?.includes("does not exist")) {
    return "Session expired. Please sign in again."
  }
  if (error.message?.includes("Database error saving new user")) {
    return "Account created but profile setup failed. Please try signing in."
  }

  // Database errors
  if (error.code === "PGRST116") {
    return "Record not found"
  }
  if (error.code === "23505") {
    return "This record already exists"
  }

  // Storage errors
  if (error.message?.includes("The resource was not found") || error.message?.includes("Bucket not found")) {
    return "File not found or bucket misconfigured."
  }
  if (error.message?.includes("The object exceeded the maximum allowed size")) {
    return "File is too large"
  }
  if (error.message?.includes("violates row-level security policy")) {
    return "Permission denied. You may need to re-authenticate to perform this action."
  }

  // Return original message
  return error.message || "An unexpected error occurred"
}

/**
 * Storage service for handling file uploads
 */
export const storageService = {
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { data, error } = await supabase.storage.from("profile-picture").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Profile picture upload error:", error)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-picture").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Profile picture upload error:", error)
      return null
    }
  },

  /**
   * Upload vehicle images from File objects
   */
  async uploadVehicleImages(files: File[], vehicleId: string, userId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split(".").pop()
      const fileName = `${index}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${vehicleId}/${fileName}`

      const { data, error } = await supabase.storage.from("vehicle-storage").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Vehicle image upload error:", error)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("vehicle-storage").getPublicUrl(filePath)

      return publicUrl
    })

    const results = await Promise.all(uploadPromises)
    return results.filter((url): url is string => url !== null)
  },

  /**
   * Upload vehicle images from base64 strings
   */
  async uploadVehicleImagesFromBase64(base64Images: string[], vehicleId: string, userId: string): Promise<string[]> {
    const uploadPromises = base64Images.map(async (base64, index) => {
      try {
        const mimeType = base64.substring("data:".length, base64.indexOf(";base64"))
        const fileExt = mimeType.split("/")[1]
        const buffer = Buffer.from(base64.split(",")[1], "base64")
        const fileName = `${index}-${Date.now()}.${fileExt}`
        const filePath = `${userId}/${vehicleId}/${fileName}`

        const { data, error } = await supabase.storage.from("vehicle-storage").upload(filePath, buffer, {
          contentType: mimeType,
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          console.error(`Vehicle image upload error for index ${index}:`, error)
          return null
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("vehicle-storage").getPublicUrl(filePath)

        return publicUrl
      } catch (e) {
        console.error(`Error processing base64 image at index ${index}:`, e)
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    return results.filter((url): url is string => url !== null)
  },

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, fileName: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([fileName])

      if (error) {
        console.error("File deletion error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("File deletion error:", error)
      return false
    }
  },
}

/**
 * Create a Supabase client for server-side usage (API routes, server components)
 */
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
