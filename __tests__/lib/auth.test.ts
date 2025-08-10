import { describe, it, expect, beforeEach, vi } from "vitest"
import { authService, AuthError } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"

// Mock the client creation utility
vi.mock("@/utils/supabase/client")

// Mock the error handler
vi.mock("@/lib/error-handler", () => ({
  handleSupabaseError: vi.fn((error) => error.message),
}))

// Mock the storage service (auth service uses it for profile pics)
vi.mock("@/lib/storage-service", () => ({
    storageService: {
        uploadProfilePicture: vi.fn(),
    }
}))


describe("AuthService", () => {
  let supabase: any;

  beforeEach(() => {
    vi.clearAllMocks()
    supabase = {
        auth: {
          signUp: vi.fn(),
          signInWithPassword: vi.fn(),
          signOut: vi.fn(),
        },
    };
    vi.mocked(createClient).mockReturnValue(supabase)
  })

  describe("signUp", () => {
    it("should successfully sign up a user", async () => {
      const mockUser = { id: "123", email: "test@example.com" }
      const mockSession = { access_token: "token" }

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await authService.signUp("test@example.com", "password123")

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            first_name: "",
            last_name: "",
          },
        },
      })
    })

    it("should throw AuthError on sign up failure", async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email already exists" },
      })

      await expect(authService.signUp("test@example.com", "password123")).rejects.toThrow(AuthError)
    })
  })

  describe("signIn", () => {
    it("should successfully sign in a user", async () => {
      const mockUser = { id: "123", email: "test@example.com" }
      const mockSession = { access_token: "token" }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await authService.signIn("test@example.com", "password123")

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
    })

    it("should throw AuthError on invalid credentials", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid credentials" },
      })

      await expect(authService.signIn("test@example.com", "wrongpassword")).rejects.toThrow(AuthError)
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })
      await expect(authService.signOut()).resolves.not.toThrow()
    })
  })
})
