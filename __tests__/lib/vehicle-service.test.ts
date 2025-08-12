import { describe, it, expect, beforeEach, vi } from "vitest"
import { vehicleService } from "@/lib/vehicle-service"
import { storageService } from "@/lib/supabase"

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
  storageService: {
    uploadVehicleImagesFromBase64: vi.fn(),
  },
}))

describe("VehicleService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getVehicles", () => {
    it("should fetch vehicles successfully", async () => {
      const mockVehicles = [
        {
          id: "123",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          price: 25000,
          mileage: 50000,
          transmission: "Automatic",
          fuel: "Petrol",
          city: "Cape Town",
          province: "Western Cape",
          seller_name: "John Doe",
          seller_email: "john@example.com",
          status: "active",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      ]

      const { supabase } = await import("@/lib/supabase")
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockVehicles,
          error: null,
          count: 1,
        }),
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockVehicles,
          error: null,
        }),
      } as any)

      const result = await vehicleService.getVehicles()

      expect(result).toHaveLength(1)
      expect(result[0].make).toBe("Toyota")
    })

    it("should handle errors when fetching vehicles", async () => {
      const { supabase } = await import("@/lib/supabase")
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      } as any)

      const result = await vehicleService.getVehicles()
      expect(result).toEqual([])
    })
  })

  describe("createVehicle", () => {
    it("should create a vehicle successfully", async () => {
      const { supabase } = await import("@/lib/supabase")
      const fromMock = vi.mocked(supabase.from)

      const mockUserProfile = { id: "user123", first_name: "John", last_name: "Doe", email: "john@example.com", phone: "1234567890", suburb: "Suburb", city: "City", province: "Province", profile_pic: "pic_url" }
      const mockNewVehicle = { id: "veh456", make: "Toyota" }
      const mockUpdatedVehicle = { ...mockNewVehicle, images: ["image_url"] }

      // Mock chain for each `from` call
      fromMock
        // 1. users select
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null }),
        } as any)
        // 2. vehicles insert
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockNewVehicle, error: null }),
        } as any)
        // 3. vehicles update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockUpdatedVehicle, error: null }),
        } as any)

      vi.mocked(storageService.uploadVehicleImagesFromBase64).mockResolvedValue(["image_url"])

      const vehicleData = {
        userId: "user123",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        price: 25000,
        mileage: 50000,
        transmission: "Automatic",
        fuel: "Petrol",
        engineCapacity: "2.0L",
        bodyType: "Sedan",
        description: "A great car",
        images: ["base64_image_data"],
      } as any

      const result = await vehicleService.createVehicle(vehicleData)

      expect(result).toEqual(mockUpdatedVehicle)
      expect(fromMock).toHaveBeenCalledWith("users")
      expect(fromMock).toHaveBeenCalledWith("vehicles")
      expect(fromMock).toHaveBeenCalledTimes(3) // users, vehicles (insert), vehicles (update)
      expect(storageService.uploadVehicleImagesFromBase64).toHaveBeenCalledWith(
        vehicleData.images,
        mockNewVehicle.id,
        vehicleData.userId,
      )
    })
  })
})
