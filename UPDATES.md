# Website Updates Log

This document tracks all updates made to the car marketplace website. It serves as a comprehensive reference for future development and maintenance.

**Guiding Principles:**

- **Preserve Integrity:** The primary goal is to preserve the existing structure and functionality of the website. Any changes must be implemented without disrupting the core user experience or breaking existing features.
- **Targeted Changes:** Modifications should only be made when necessary or when they directly pertain to a specific feature implementation, bug fix, or design update. Avoid broad, sweeping changes that could introduce unintended side effects.

---

## Feature Implementations

### 1. Advanced Search Form
- **Description:** Implemented a detailed search form on the homepage to allow users to filter vehicles based on multiple criteria.
- **Components Affected:** `app/home/page.tsx`, `components/car-marketplace.tsx`.
- **Details:**
  - Added fields for make/model, price range, location, body type, year range, mileage range, fuel type, engine capacity, and transmission.
  - Implemented filtering logic to display vehicles that match the selected criteria.

### 2. User Authentication and Verification Flow
- **Description:** Enhanced the user sign-up process with automatic redirection and an account verification prompt to improve security and user experience.
- **Components Affected:** `app/login/page.tsx`, `components/login-page.tsx`, `components/dashboard.tsx`, `components/upload-vehicle.tsx`, `components/ui/header.tsx`.
- **Details:**
  - Users are automatically redirected to the dashboard after successful sign-up.
  - A pop-up on the dashboard prompts users to verify their email address.
  - Vehicle upload functionality is disabled for users with unverified accounts to ensure platform security.

---

## Design Changes

### 1. Vehicle Card Component
- **Description:** Created a new `VehicleCard` component to standardize the display of vehicle listings across the application.
- **Components Affected:** `components/ui/vehicle-card.tsx`, `components/car-marketplace.tsx`.
- **Details:**
  - The card displays key vehicle information: image, make, model, year, price, mileage, transmission, and location.
  - This component is now used in the featured vehicles section and on the search results page.


### 2. Header Design Reversion
**Description:** Reverted the website header to a previous, stable design to restore its original look and feel.
**Components Affected:** `components/ui/header.tsx`.
**Details:**
  - The `header.tsx` file was replaced with the code from the previous version.
  - All original functionalities and styles of the header were restored without affecting other parts of the site.

### 3. Header Height and Border Slimming
- **Description:** Reduced the header's border and overall height to make it narrower and slimmer, improving the visual appearance and user experience.
- **Components Affected:** `components/ui/header.tsx`.
- **Details:**
  - Adjusted the header's padding and border to achieve a slimmer look.
  - The header now occupies less vertical space, making the navigation area more compact and modern.

---

## Feature Implementations

### User Vehicle Listing and Management
- **Description:** Implemented functionality for users to list, view, edit, and delete their vehicles from the dashboard, and change vehicle status.
- **Components Affected:** `app/upload-vehicle/page.tsx`, `lib/vehicle-service.ts`, `app/dashboard/page.tsx`, `components/upload-vehicle.tsx`, `components/dashboard.tsx`, `components/my-listing-card.tsx`.
- **Details:**
  - Resolved database insert errors in `createVehicle` by removing non-existent seller-specific columns (`seller_name`, `seller_email`, `seller_phone`, `seller_suburb`, `seller_city`, `seller_province`, `seller_profile_pic`).
  - Implemented fetching and displaying listed vehicles for the current user on the dashboard using `vehicleService.getVehiclesByUserId`.
  - Added delete functionality using `vehicleService.deleteVehicle` and integrated it into the dashboard view.
  - Added functionality to change vehicle status ('active'/'sold') using `vehicleService.updateVehicleStatus` and integrated it into the dashboard view.
  - Modified `UploadVehicleComponent` to accept initial vehicle data for pre-filling forms and displaying existing images during editing.
  - Ensured the `images` column is fetched for listed vehicles to allow displaying the main image on the dashboard vehicle cards.


## Bug Fixes

### 1. `VehicleCard` Module Not Found
- **Description:** Resolved an import error where the `VehicleCard` component could not be found by the `car-marketplace` component.
- **Components Affected:** `components/car-marketplace.tsx`.
- **Details:**
  - The import path for `VehicleCard` was corrected from `/components/vehicle-card` to `/components/ui/vehicle-card.tsx`, where the component is located.

### 2. `getVehicles` Function Not Exported
- **Description:** Fixed a runtime error caused by the missing `getVehicles` function in the `/lib/data.ts` module.
- **Components Affected:** `lib/data.ts`, `hooks/use-vehicles.ts`, `app/api/vehicles/route.ts`.
- **Details:**
  - Added the `getVehicles` function to `/lib/data.ts` to correctly filter and return vehicle data.
  - Corrected the `Vehicle` type interface within the same file to match the data structure, preventing potential type errors.

### 3. Profile Information Save Failure
- **Description:** Resolved a series of cascading errors that prevented users from saving their personal information and uploading a profile picture.
- **Components Affected:** `lib/vehicle-service.ts`, `lib/supabase.ts`, `components/profile-settings.tsx`.
- **Details:**
  - **`vehicles.seller_id` does not exist:** Corrected a database query in `getVehiclesByUserId` to use `user_id` instead of `seller_id`.
  - **Bucket not found:** Corrected the Supabase storage bucket names for both profile pictures (`profile-picture`) and vehicle images (`vehicle-storage`) in `uploadProfilePicture` and `uploadVehicleImage`.
  - **RLS Policy Violation:** Fixed a row-level security policy violation during profile picture upload by modifying the `uploadProfilePicture` function to save images to a user-specific path (`/{user_id}/profile.jpg`). This resolved the root cause of the profile update failure.
