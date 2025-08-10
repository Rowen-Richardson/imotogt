"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { authService } from "@/lib/auth"
import { vehicleService } from "@/lib/vehicle-service"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types/user"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"

interface UserContextType {
  user: (User & { session: Session | null }) | null
  userProfile: UserProfile | null
  loading: boolean
  listedVehicles: Vehicle[]
  savedVehicles: Set<string>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>, profilePictureFile?: File) => Promise<void>
  refreshUser: () => Promise<void>
  toggleSaveVehicle: (vehicle: Vehicle) => Promise<void>
  deleteListedVehicle: (vehicleId: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [listedVehicles, setListedVehicles] = useState<Vehicle[]>([])
  const [savedVehicles, setSavedVehicles] = useState<Set<string>>(new Set())
  const router = useRouter()

  const fetchUserData = useCallback(async (currentUser: User) => {
    try {
      const [profile, userListed, userSaved] = await Promise.all([
        authService.getUserProfile(currentUser.id),
        vehicleService.getVehiclesByUserId(currentUser.id),
        vehicleService.getSavedVehiclesByUserId(currentUser.id),
      ])
      setUserProfile(profile)
      setListedVehicles(userListed)
      setSavedVehicles(new Set(userSaved.map((v) => v.id))) // Convert to Set of IDs
    } catch (error) {
      console.error("UserContext: Error fetching user data:", error)
      // On error, clear out potentially stale data
      setUserProfile(null)
      setListedVehicles([])
      setSavedVehicles(new Set())
    }
  }, [])

  const clearUserData = () => {
    setUser(null)
    setUserProfile(null)
    setListedVehicles([])
    setSavedVehicles(new Set())
  }

  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        await fetchUserData(currentUser)
      } else {
        clearUserData()
      }
    } catch (error) {
      console.error("UserContext: Error refreshing user:", error)
      clearUserData()
    } finally {
      setLoading(false)
    }
  }, [fetchUserData])

  useEffect(() => {
    let mounted = true
    const initializeAuth = async () => {
      await refreshUser()
      const {
        data: { subscription },
      } = authService.onAuthStateChange(async (supabaseUser) => {
        if (!mounted) return
        if (supabaseUser) {
          setUser(supabaseUser)
          await fetchUserData(supabaseUser)
        } else {
          clearUserData()
        }
        setLoading(false)
      })
      return () => {
        subscription?.unsubscribe()
      }
    }
    const cleanupPromise = initializeAuth()
    return () => {
      mounted = false
      cleanupPromise.then((cleanup) => cleanup?.())
    }
  }, [refreshUser, fetchUserData])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: supabaseUser } = await authService.signIn(email, password)
      if (supabaseUser) {
        setUser(supabaseUser)
        await fetchUserData(supabaseUser)
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    setLoading(true)
    try {
      const { user: supabaseUser } = await authService.signUp(email, password, userData)
      if (supabaseUser) {
        setUser(supabaseUser)
        await fetchUserData(supabaseUser)
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      clearUserData()
      router.push("/")
    } catch (error) {
      console.error("UserContext: Error during sign out:", error)
      clearUserData()
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>, profilePictureFile?: File) => {
    if (!user) throw new Error("No user logged in")
    setLoading(true)
    try {
      await authService.updateProfile(user.id, updates, profilePictureFile)
      const updatedProfile = await authService.getUserProfile(user.id)
      setUserProfile(updatedProfile)
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveVehicle = async (vehicle: Vehicle) => {
    if (!user) {
      router.push("/login")
      return
    }
    const isSaved = savedVehicles.has(vehicle.id) // Use .has() for Set
    if (isSaved) {
      setSavedVehicles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(vehicle.id)
        return newSet
      })
      await vehicleService.unsaveVehicle(user.id, vehicle.id)
    } else {
      setSavedVehicles((prev) => new Set(prev).add(vehicle.id)) // Add to Set
      await vehicleService.saveVehicle(user.id, vehicle.id)
    }
  }

  const deleteListedVehicle = async (vehicleId: string) => {
    if (!user) return
    setListedVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
    await vehicleService.deleteVehicle(vehicleId)
  }

  const value: UserContextType = {
    user,
    userProfile,
    loading,
    listedVehicles,
    savedVehicles,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    toggleSaveVehicle,
    deleteListedVehicle,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
