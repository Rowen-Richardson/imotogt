import { createClient } from "@/utils/supabase/client"
import { handleSupabaseError } from "./error-handler"
import { storageService } from "./storage-service"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types/user"

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData?: Partial<UserProfile>) {
    const supabase = createClient()
    try {
      console.log("Starting sign up process for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName || "",
            last_name: userData?.lastName || "",
          },
        },
      })

      console.log("Sign up response:", { data, error })

      if (error) {
        console.error("Sign up error from Supabase:", error)
        throw new AuthError(handleSupabaseError(error), error.message)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error("Sign up error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError("Failed to create account. Please try again.")
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const supabase = createClient()
    try {
      console.log("Starting sign in process for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in response:", { data, error })

      if (error) {
        console.error("Sign in error from Supabase:", error)
        throw new AuthError(handleSupabaseError(error), error.message)
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error("Sign in error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError("Failed to sign in. Please try again.")
    }
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: "google") {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw new AuthError(handleSupabaseError(error), error.message)

      return data
    } catch (error) {
      console.error("OAuth sign in error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError(`Failed to sign in with ${provider}`)
    }
  },

  /**
   * Sign out - Enhanced with better session cleanup
   */
  async signOut() {
    const supabase = createClient()
    try {
      console.log("Starting sign out process...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Supabase sign out error:", error)
      }
      console.log("Supabase sign out successful")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw new AuthError(handleSupabaseError(error), error.message)
    } catch (error) {
      console.error("Reset password error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError("Failed to reset password")
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw new AuthError(handleSupabaseError(error), error.message)
    } catch (error) {
      console.error("Update password error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError("Failed to update password")
    }
  },

  /**
   * Get current user with robust error handling for invalid sessions.
   */
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        if (error.message !== "Auth session missing!") {
          console.error("Error getting current user:", error.message)
        }
        return null
      }
      return data.user
    } catch (e) {
      console.error("Unexpected error in getCurrentUser:", e)
      return null
    }
  },

  /**
   * Get user profile with fallback creation
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()
    try {
      console.log("Getting user profile for:", userId)

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("User profile not found, attempting to create one")
          const { data: { user } } = await supabase.auth.getUser()
          if (user && user.id === userId) {
            const newProfile = {
              id: userId,
              email: user.email!,
              first_name: user.user_metadata?.first_name || "",
              last_name: user.user_metadata?.last_name || "",
              login_method: "email" as const,
            }
            const { data: createdProfile, error: createError } = await supabase
              .from("users")
              .insert(newProfile)
              .select()
              .single()
            if (createError) {
              console.error("Failed to create user profile:", createError)
              return null
            }
            console.log("Created new user profile:", createdProfile)
            return {
              id: createdProfile.id,
              email: createdProfile.email,
              firstName: createdProfile.first_name || "",
              lastName: createdProfile.last_name || "",
              phone: createdProfile.phone,
              profilePic: createdProfile.profile_pic,
              suburb: createdProfile.suburb,
              city: createdProfile.city,
              province: created.province,
              loginMethod: createdProfile.login_method as "email" | "google",
            }
          }
          return null
        }
        console.error("Get user profile error:", error)
        return null
      }

      if (!data) return null

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        phone: data.phone,
        profilePic: data.profile_pic,
        suburb: data.suburb,
        city: data.city,
        province: data.province,
        loginMethod: data.login_method as "email" | "google",
      }
    } catch (error) {
      console.error("Get user profile error:", error)
      return null
    }
  },

  /**
   * Update user profile with optional profile picture upload
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>, profilePictureFile?: File) {
    const supabase = createClient()
    try {
      let profilePicUrl = updates.profilePic
      if (profilePictureFile) {
        profilePicUrl = await storageService.uploadProfilePicture(profilePictureFile, userId)
        if (!profilePicUrl) {
          throw new AuthError("Failed to upload profile picture. The storage service returned an error.")
        }
      }
      const { error } = await supabase
        .from("users")
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          profile_pic: profilePicUrl,
          suburb: updates.suburb,
          city: updates.city,
          province: updates.province,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      if (error) throw new AuthError(handleSupabaseError(error), error.code)
    } catch (error) {
      console.error("Update profile error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError("Failed to update profile")
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      callback(session?.user ?? null)
    })
    return subscription
  },

  /**
   * Get session with validation
   */
  async getSession() {
    const supabase = createClient()
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Get session error:", error)
        return null
      }
      return session
    } catch (error) {
      console.error("Get session failed:", error)
      return null
    }
  },
}

// Legacy exports for backward compatibility
export const signUp = authService.signUp
export const signIn = authService.signIn
export const signOut = authService.signOut
export const getCurrentUser = authService.getCurrentUser
export const getUserProfile = authService.getUserProfile
export const updateUserProfile = authService.updateProfile
export const resetPassword = authService.resetPassword
export const updatePassword = authService.updatePassword
