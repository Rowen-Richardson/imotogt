export interface Vehicle {
  id: number
  make: string
  model: string
  variant: string
  price: string
  image: string
  year: string
  mileage: string
  transmission: string
  fuel: string
  province: string
  city: string
  bodyType: string
  engineCapacity: string
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  sellerAddress: string
  sellerSuburb: string;
  sellerCity: string;
  sellerProvince: string;
  sellerProfilePic: string;
}

export interface VehicleFilters {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: string
  maxYear?: string
  province?: string
  city?: string
  bodyType?: string
  fuel?: string
  transmission?: string
  search?: string
  limit?: number
  offset?: number
}

// SAMPLE DATASET WITH ADDITIONAL PROPERTIES AND LOCATION INFO
export const vehicles: Vehicle[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Corolla",
    variant: "1.8 XR CVT",
    price: "R 389,900",
    year: "2022",
    mileage: "15,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Cape Town",
    province: "Western Cape",
    bodyType: "Sedan",
    fuel: "Petrol",
    engineCapacity: "1.8L",
    transmission: "Automatic",
    sellerName: "James Wilson",
    sellerPhone: "082 123 4567",
    sellerEmail: "james.wilson@example.com",
    sellerAddress: "Rondebosch, Cape Town, Western Cape",
    sellerSuburb: "Rondebosch",
    sellerCity: "Cape Town",
    sellerProvince: "Western Cape",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 2,
    make: "Volkswagen",
    model: "Golf",
    variant: "GTI",
    price: "R 459,900",
    year: "2021",
    mileage: "25,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Johannesburg",
    province: "Gauteng",
    bodyType: "Hatchback",
    fuel: "Petrol",
    engineCapacity: "2.0L",
    transmission: "Automatic",
    sellerName: "Sarah Johnson",
    sellerPhone: "083 234 5678",
    sellerEmail: "sarah.j@example.com",
    sellerAddress: "Sandton, Johannesburg, Gauteng",
    sellerSuburb: "Sandton",
    sellerCity: "Johannesburg",
    sellerProvince: "Gauteng",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 3,
    make: "BMW",
    model: "X5",
    variant: "xDrive30d",
    price: "R 899,900",
    year: "2020",
    mileage: "45,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Durban",
    province: "KwaZulu-Natal",
    bodyType: "SUV",
    fuel: "Diesel",
    engineCapacity: "3.0L",
    transmission: "Automatic",
    sellerName: "Michael Brown",
    sellerPhone: "084 345 6789",
    sellerEmail: "michael.b@example.com",
    sellerAddress: "Umhlanga, Durban, KwaZulu-Natal",
    sellerSuburb: "Umhlanga",
    sellerCity: "Durban",
    sellerProvince: "KwaZulu-Natal",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 4,
    make: "Ford",
    model: "Ranger",
    variant: "2.0 Bi-Turbo Wildtrak",
    price: "R 629,900",
    year: "2021",
    mileage: "35,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Pretoria",
    province: "Gauteng",
    bodyType: "Truck",
    fuel: "Diesel",
    engineCapacity: "2.0L",
    transmission: "Automatic",
    sellerName: "David Smith",
    sellerPhone: "082 456 7890",
    sellerEmail: "david.smith@example.com",
    sellerAddress: "Waterkloof, Pretoria, Gauteng",
    sellerSuburb: "Waterkloof",
    sellerCity: "Pretoria",
    sellerProvince: "Gauteng",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 5,
    make: "Mercedes-Benz",
    model: "C-Class",
    variant: "C200 AMG Line",
    price: "R 759,900",
    year: "2022",
    mileage: "10,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Bloemfontein",
    province: "Free State",
    bodyType: "Sedan",
    fuel: "Petrol",
    engineCapacity: "2.0L",
    transmission: "Automatic",
    sellerName: "Emily Davis",
    sellerPhone: "083 567 8901",
    sellerEmail: "emily.d@example.com",
    sellerAddress: "Langenhoven Park, Bloemfontein, Free State",
    sellerSuburb: "Langenhoven Park",
    sellerCity: "Bloemfontein",
    sellerProvince: "Free State",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 6,
    make: "Honda",
    model: "Civic",
    variant: "1.5T Executive",
    price: "R 429,900",
    year: "2021",
    mileage: "20,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    bodyType: "Sedan",
    fuel: "Petrol",
    engineCapacity: "1.5L",
    transmission: "CVT",
    sellerName: "Robert Taylor",
    sellerPhone: "084 678 9012",
    sellerEmail: "robert.t@example.com",
    sellerAddress: "Summerstrand, Port Elizabeth, Eastern Cape",
    sellerSuburb: "Summerstrand",
    sellerCity: "Port Elizabeth",
    sellerProvince: "Eastern Cape",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 7,
    make: "Audi",
    model: "A3",
    variant: "Sportback 35 TFSI S line",
    price: "R 549,900",
    year: "2022",
    mileage: "5,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Cape Town",
    province: "Western Cape",
    bodyType: "Hatchback",
    fuel: "Petrol",
    engineCapacity: "1.4L",
    transmission: "Automatic",
    sellerName: "Jennifer Wilson",
    sellerPhone: "082 789 0123",
    sellerEmail: "jennifer.w@example.com",
    sellerAddress: "Sea Point, Cape Town, Western Cape",
    sellerSuburb: "Sea Point",
    sellerCity: "Cape Town",
    sellerProvince: "Western Cape",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 8,
    make: "Hyundai",
    model: "Tucson",
    variant: "2.0 Elite",
    price: "R 479,900",
    year: "2021",
    mileage: "30,000",
    image: "/placeholder.svg?height=400&width=600",
    city: "Johannesburg",
    province: "Gauteng",
    bodyType: "SUV",
    fuel: "Petrol",
    engineCapacity: "2.0L",
    transmission: "Automatic",
    sellerName: "Thomas Anderson",
    sellerPhone: "083 890 1234",
    sellerEmail: "thomas.a@example.com",
    sellerAddress: "Sunwood, Boksburg, Gauteng",
    sellerSuburb: "Sunwood",
    sellerCity: "Boksburg",
    sellerProvince: "Gauteng",
    sellerProfilePic: "/placeholder-user.jpg",
  },
  {
    id: 9,
    make: "Toyota",
    model: "AE86",
    variant: "Trueno Apex",
    price: "R 850,000",
    year: "1986",
    mileage: "86,000",
    image: "/placeholder.svg?height=400&width=600&text=Hachi-Roku",
    city: "Franschhoek",
    province: "Western Cape",
    bodyType: "Coupe",
    fuel: "Petrol",
    engineCapacity: "1.6L",
    transmission: "Manual",
    sellerName: "Takumi Fujiwara",
    sellerPhone: "086 864 8686",
    sellerEmail: "tofu.delivery@fujiwara.co.za",
    sellerAddress: "Franschhoek Pass, Franschhoek, Western Cape",
    sellerSuburb: "Franschhoek",
    sellerCity: "Franschhoek",
    sellerProvince: "Western Cape",
    sellerProfilePic: "/placeholder-user.jpg",
  },
]

export const getVehicles = (filters: VehicleFilters = {}) => {
  let filtered = [...vehicles]

  const parsePrice = (priceStr: string) => {
    return Number(priceStr.replace(/[^0-9]/g, ""))
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (v) =>
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.variant.toLowerCase().includes(searchLower),
    )
  }

  if (filters.make) {
    filtered = filtered.filter((v) => v.make.toLowerCase() === filters.make?.toLowerCase())
  }

  if (filters.model) {
    filtered = filtered.filter((v) => v.model.toLowerCase() === filters.model?.toLowerCase())
  }

  if (filters.minPrice) {
    filtered = filtered.filter((v) => parsePrice(v.price) >= filters.minPrice!)
  }

  if (filters.maxPrice) {
    filtered = filtered.filter((v) => parsePrice(v.price) <= filters.maxPrice!)
  }

  if (filters.minYear) {
    filtered = filtered.filter((v) => Number(v.year) >= Number(filters.minYear!))
  }

  if (filters.maxYear) {
    filtered = filtered.filter((v) => Number(v.year) <= Number(filters.maxYear!))
  }

  if (filters.province) {
    filtered = filtered.filter((v) => v.province === filters.province)
  }

  if (filters.city) {
    filtered = filtered.filter((v) => v.city === filters.city)
  }

  if (filters.bodyType) {
    filtered = filtered.filter((v) => v.bodyType === filters.bodyType)
  }

  if (filters.fuel) {
    filtered = filtered.filter((v) => v.fuel === filters.fuel)
  }

  if (filters.transmission) {
    filtered = filtered.filter((v) => v.transmission === filters.transmission)
  }

  const total = filtered.length

  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  const paginatedVehicles = filtered.slice(offset, offset + limit)

  return { vehicles: paginatedVehicles, total }
}
