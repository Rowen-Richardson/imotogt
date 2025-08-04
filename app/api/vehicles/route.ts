import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { vehicleService } from "@/lib/vehicle-service"
import type { Database } from "@/types/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      make: searchParams.get("make") || undefined,
      model: searchParams.get("model") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minYear: searchParams.get("minYear") || undefined, // Keep as string
      maxYear: searchParams.get("maxYear") || undefined, // Keep as string
      province: searchParams.get("province") || undefined,
      city: searchParams.get("city") || undefined,
      bodyType: searchParams.get("bodyType") || undefined,
      fuel: searchParams.get("fuel") || undefined,
      transmission: searchParams.get("transmission") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
    }

    const result = await vehicleService.getVehicles(filters)

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("API vehicles GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicles", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    })

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vehicleData = await request.json()

    // Validate required fields
    const requiredFields = ["make", "model", "year", "price", "mileage", "transmission", "fuel", "images"]
    for (const field of requiredFields) {
      if (!vehicleData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    if (!Array.isArray(vehicleData.images) || vehicleData.images.length === 0) {
      return NextResponse.json({ error: "At least one image is required." }, { status: 400 })
    }

    // Sanitize and convert data types
    const priceAsNumber = Number.parseFloat(vehicleData.price)
    if (isNaN(priceAsNumber)) {
      return NextResponse.json({ error: "Invalid price format." }, { status: 400 })
    }

    const vehiclePayload = {
      ...vehicleData,
      price: priceAsNumber,
      year: Number.parseInt(vehicleData.year, 10),
      mileage: Number.parseInt(vehicleData.mileage, 10),
      userId: session.user.id,
    }

    const newVehicle = await vehicleService.createVehicle(vehiclePayload)

    return NextResponse.json(newVehicle, { status: 201 })
  } catch (error) {
    console.error("API vehicles POST error:", error)
    return NextResponse.json(
      { error: "Failed to create vehicle listing", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
