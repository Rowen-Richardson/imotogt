import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

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
