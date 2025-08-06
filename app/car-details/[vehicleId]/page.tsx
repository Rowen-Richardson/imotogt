// Imports: These are the necessary components and functions from Next.js and your project files.
import { notFound } from "next/navigation";
import { vehicleService } from "@/lib/vehicle-service";
import { ContactCard } from "@/app/components/contact-card";
import VehicleImageGallery from "@/app/components/vehicle-image-gallery";
import VehicleDetails from "@/app/components/vehicle-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/lib/types"; // Import the Vehicle type for type safety

// This setting tells Next.js to render the page dynamically for each request,
// ensuring the data is always fresh.
export const dynamic = "force-dynamic";

// This is the main component for the vehicle details page.
export default async function VehicleDetailsPage({
  params,
}: {
  params: { vehicleId: string };
}) {
  const vehicleId = params.vehicleId;

  // 1. Fetch the vehicle data using the ID from the URL.
  const vehicle: Vehicle | null = await vehicleService.getVehicleById(vehicleId);

  // 2. If no vehicle is found with that ID, display a standard 404 "Not Found" page.
  if (!vehicle) {
    notFound();
  }

  // 3. Render the page with the fetched vehicle data.
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image Gallery and Details */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              {/* Image Gallery Component */}
              <VehicleImageGallery images={vehicle.images} />
            </CardContent>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {vehicle.make} {vehicle.model}
              </CardTitle>
              <CardDescription className="text-lg">
                {vehicle.year} | {vehicle.variant}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              {/* Vehicle Details Component */}
              <VehicleDetails vehicle={vehicle} />
              <Separator className="my-4" />
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{vehicle.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Price and Seller Contact Card */}
        <div className="md:col-span-1">
          <div className="sticky top-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold text-center text-primary">
                  R {vehicle.price.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/*
              The ContactCard component receives all the seller-related data
              that was fetched with the vehicle record. This is the crucial part
              that makes the seller's information appear.
            */}
            <ContactCard
              sellerName={vehicle.seller_name}
              sellerEmail={vehicle.seller_email}
              sellerPhone={vehicle.seller_phone}
              sellerSuburb={vehicle.seller_suburb}
              sellerCity={vehicle.seller_city}
              sellerProvince={vehicle.seller_province}
              sellerProfilePic={vehicle.seller_profile_pic}
            />
          </div>
        </div>
      </div>
    </div>
  );
}