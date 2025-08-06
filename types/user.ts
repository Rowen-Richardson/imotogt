export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  profilePic?: string | null
  suburb?: string | null
  city?: string | null
  province?: string | null
  loginMethod: "email" | "google" | "facebook" | "apple"
}



export interface SavedVehicle {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
}
