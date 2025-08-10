import { describe, it, expect, beforeEach, vi } from "vitest"
import { vehicleService, VehicleError } from "@/lib/vehicle-service"
import { createClient } from "@/utils/supabase/client"
import { storageService } from "@/lib/storage-service"

// Mock the client creation utility
vi.mock("@/utils/supabase/client")

// Mock the storage service
vi.mock("@/lib/storage-service", () => ({
  storageService: {
    uploadVehicleImagesFromBase64: vi.fn(),
  },
}))


describe("VehicleService", () => {
    let supabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        supabase = {
            from: vi.fn(),
        };
        vi.mocked(createClient).mockReturnValue(supabase);
    });

  describe("getVehicles", () => {
    it("should fetch vehicles successfully", async () => {
      const mockVehicles = [{ id: "123", make: "Toyota" }]
      const fromStub = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({
            data: mockVehicles,
            error: null,
            count: 1,
        })
      }
      // Since getVehicles can have conditional `or`, we mock the final call
      supabase.from.mockReturnValue(fromStub);
      // If no filter, the await is on select()
      fromStub.select.mockResolvedValue({ data: mockVehicles, error: null, count: 1 });


      const result = await vehicleService.getVehicles()

      expect(supabase.from).toHaveBeenCalledWith("vehicles")
      expect(fromStub.select).toHaveBeenCalled()
      expect(result.vehicles).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.vehicles[0].make).toBe("Toyota")
    })

    it("should handle errors when fetching vehicles", async () => {
        const fromStub = {
            select: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error", code: "DB_ERROR" },
                count: null,
            })
        };
        supabase.from.mockReturnValue(fromStub);

      await expect(vehicleService.getVehicles()).rejects.toThrow(VehicleError)
    })
  })

  describe("createVehicle", () => {
    it("should create a vehicle successfully", async () => {
      const mockVehicleData = { userId: "user123", make: "Toyota", model: "Camry", images: [] }
      const mockUserProfile = { id: "user123", first_name: "John", last_name: "Doe", email: "john@example.com" }
      const mockNewVehicle = { id: "v123", ...mockVehicleData }
      const mockUpdatedVehicle = { ...mockNewVehicle, images: ["http://example.com/image.jpg"] }

      // Mock for user profile fetch
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockNewVehicle, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedVehicle, error: null });

      supabase.from.mockImplementation((table: string) => {
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
                single: singleMock,
            } as any;
        }
        return {} as any;
      });

      vi.mocked(storageService.uploadVehicleImagesFromBase64).mockResolvedValue(["http://example.com/image.jpg"])

      const result = await vehicleService.createVehicle(mockVehicleData as any)

      expect(supabase.from).toHaveBeenCalledWith("users")
      expect(supabase.from).toHaveBeenCalledWith("vehicles")
      expect(storageService.uploadVehicleImagesFromBase64).toHaveBeenCalled()
      expect(result.images).toContain("http://example.com/image.jpg")
      expect(result.make).toBe("Toyota")
    })
  })
})
