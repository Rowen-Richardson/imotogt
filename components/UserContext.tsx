"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { authService } from "@/lib/auth"
import { vehicleService } from "@/lib/vehicle-service"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types/user"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"

interface UserContextType {
  user: User | null
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
      setSavedVehicles(new Set(userSaved.map((v) => v.id)))
    } catch (error) {
      console.error("UserContext: Error fetching user data:", error)
      clearUserData()
    }
  }, [])

  const clearUserData = () => {
    setUser(null)
    setUserProfile(null)
    setListedVehicles([])
    setSavedVehicles(new Set())
  }

  useEffect(() => {
    setLoading(true);
    const subscription = authService.onAuthStateChange(async (event, session) => {
      const supabaseUser = session?.user ?? null;
      setUser(supabaseUser);
      if (supabaseUser) {
        await fetchUserData(supabaseUser);
      } else {
        clearUserData();
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);


  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    // onAuthStateChange will handle the user update
  }

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    await authService.signUp(email, password, userData)
    // onAuthStateChange will handle the user update
  }

  const signOut = async () => {
    await authService.signOut()
    clearUserData()
    router.push("/")
  }

  const updateProfile = async (updates: Partial<UserProfile>, profilePictureFile?: File) => {
    if (!user) throw new Error("No user logged in")
    await authService.updateProfile(user.id, updates, profilePictureFile)
    const updatedProfile = await authService.getUserProfile(user.id)
    setUserProfile(updatedProfile)
  }

  const refreshUser = useCallback(async () => {
    // This function can be used to manually trigger a refresh if needed
    setLoading(true);
    const session = await authService.getSession();
    const supabaseUser = session?.user ?? null;
    setUser(supabaseUser);
    if (supabaseUser) {
      await fetchUserData(supabaseUser);
    } else {
      clearUserData();
    }
    setLoading(false);
  }, [fetchUserData]);

  const toggleSaveVehicle = async (vehicle: Vehicle) => {
    if (!user) {
      router.push("/login")
      return
    }
    const isSaved = savedVehicles.has(vehicle.id)
    if (isSaved) {
      setSavedVehicles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(vehicle.id)
        return newSet
      })
      await vehicleService.unsaveVehicle(user.id, vehicle.id)
    } else {
      setSavedVehicles((prev) => new Set(prev).add(vehicle.id))
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
