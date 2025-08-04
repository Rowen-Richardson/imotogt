import { supabase, handleSupabaseError } from "./supabase"
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

      // Don't try to create profile manually here - let the trigger handle it
      // Just return the user data
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
  async signInWithOAuth(provider: "google" | "facebook" | "apple") {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
    try {
      console.log("Starting sign out process...")

      // Sign out from Supabase auth
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Supabase sign out error:", error)
        // Don't re-throw here, as we want to ensure cleanup happens
      }

      console.log("Supabase sign out successful")

      // Clear any additional local storage items
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("userProfile")
          localStorage.removeItem("supabase.auth.token")
          // Clear any other auth-related items
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("supabase.auth.") || key.startsWith("sb-")) {
              localStorage.removeItem(key)
            }
          })
        } catch (storageError) {
          console.warn("Error clearing localStorage:", storageError)
        }
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Avoid throwing from signOut to prevent cascading failures
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
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
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        // This error indicates the user in the JWT doesn't exist in the DB.
        if (error.message.includes("User from sub claim in JWT does not exist")) {
          console.warn("User from token not found in DB. Forcing sign-out to clear invalid session.")
          await this.signOut()
          return null
        }
        console.error("Error getting current user:", error.message)
        return null
      }

      return data.user
    } catch (e) {
      console.error("Unexpected error in getCurrentUser:", e)
      // Fail-safe sign-out
      await this.signOut()
      return null
    }
  },

  /**
   * Get user profile with fallback creation
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("Getting user profile for:", userId)

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("User profile not found, attempting to create one")

          // Try to get user info from auth to create profile
          const {
            data: { user },
          } = await supabase.auth.getUser()

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
              province: createdProfile.province,
              loginMethod: createdProfile.login_method as "email" | "google" | "facebook" | "apple",
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
        loginMethod: data.login_method as "email" | "google" | "facebook" | "apple",
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
    try {
      let profilePicUrl = updates.profilePic

      // Upload profile picture if provided
      if (profilePictureFile) {
        const { storageService } = await import("./supabase")
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
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      // On any auth event, we re-validate the user.
      const user = await this.getCurrentUser()
      callback(user)
    })
  },

  /**
   * Get session with validation
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Get session error:", error)
        return null
      }

      // Validate session if it exists
      if (session) {
        const user = await this.getCurrentUser()
        if (!user) {
          console.log("Session validation failed, clearing session")
          return null
        }
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
