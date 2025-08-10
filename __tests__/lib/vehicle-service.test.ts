import { describe, it, expect, beforeEach, vi } from "vitest"
import { vehicleService, VehicleError } from "@/lib/vehicle-service"

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            single: vi.fn(),
            limit: vi.fn(() => ({
              range: vi.fn(),
            })),
          })),
        })),
        ilike: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        textSearch: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
  storageService: {
    uploadVehicleImagesFromBase64: vi.fn().mockResolvedValue(["http://example.com/image.jpg"]),
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
          count: 1,
        }),
      } as any)

      const result = await vehicleService.getVehicles()

      expect(result.vehicles).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.vehicles[0].make).toBe("Toyota")
    })

    it("should handle errors when fetching vehicles", async () => {
      const { supabase } = await import("@/lib/supabase")
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error", code: "DB_ERROR" },
          count: null,
        }),
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error", code: "DB_ERROR" },
          count: null,
        }),
      } as any)

      await expect(vehicleService.getVehicles()).rejects.toThrow(VehicleError)
    })
  })

  describe("createVehicle", () => {
    it("should create a vehicle successfully", async () => {
      const mockVehicle = {
        id: "123",
        user_id: "user123",
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
      }

      const { supabase } = await import("@/lib/supabase")
      const mockUserProfile = { id: "user123", first_name: "John", last_name: "Doe", email: "john@example.com", phone: "123-456-7890" };
      const mockUpdatedVehicle = { ...mockVehicle, images: ["http://example.com/image.jpg"] };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null }),
          } as any;
        }
        if (table === "vehicles") {
          return {
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
              .mockResolvedValueOnce({ data: mockVehicle, error: null }) // After insert
              .mockResolvedValueOnce({ data: mockUpdatedVehicle, error: null }), // After update
          } as any;
        }
        return {} as any;
      });

      const vehicleData = {
        userId: "user123",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        price: 25000,
        mileage: 50000,
        transmission: "Automatic",
        fuel: "Petrol",
        city: "Cape Town",
        province: "Western Cape",
        sellerName: "John Doe",
        sellerEmail: "john@example.com",
      }

      const result = await vehicleService.createVehicle(vehicleData)

      expect(result.make).toBe("Toyota")
      expect(result.model).toBe("Camry")
    })
  })
})
