export interface Vehicle {
  id: string
  userId: string
  make: string
  model: string
  variant?: string
  year: number
  price: number
  mileage: number
  fuel: string
  engineCapacity: string
  bodyType: string
  description?: string
  images: string[]
  image?: string // For main image display
  city?: string
  province?: string
  transmission: string
  sellerName: string
  sellerEmail: string
  sellerPhone: string
  sellerSuburb?: string
  sellerCity?: string
  sellerProvince?: string
  sellerProfilePic?: string
  status: string
  createdAt: string
  updatedAt: string
}
