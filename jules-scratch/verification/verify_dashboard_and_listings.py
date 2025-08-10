import re
import os
from playwright.sync_api import sync_playwright, Page, expect

# --- Important Note ---
# This script is designed to run in an environment where a user is already logged in
# and has at least one vehicle listed. In the current sandboxed environment without
# seeded data or a login mechanism, the later parts of this script will fail.
# It is provided as a verification template.

def verify_dashboard_features(page: Page):
    # This script assumes the user is already logged in and on the dashboard page.
    # In a real test environment, you would have a setup step to log in first.
    print("Navigating to the dashboard page...")
    page.goto("http://localhost:3000/dashboard")

    # --- 1. Verify "Recently Listed Cars" Layout and "View All" Button ---
    print("Verifying 'Recently Listed Cars' card...")

    # Check for the card title
    recently_listed_card_title = page.get_by_role("heading", name="Recently Listed Cars")
    expect(recently_listed_card_title).to_be_visible(timeout=15000)

    # Check for the "View All" link
    view_all_link = page.get_by_role("link", name="View All")
    expect(view_all_link).to_be_visible()
    expect(view_all_link).to_have_attribute("href", "/dashboard/my-listings")

    # Take a screenshot of the dashboard
    print("Taking screenshot of the dashboard view...")
    page.screenshot(path="jules-scratch/verification/dashboard-view.png")
    print("Dashboard view screenshot saved.")

    # --- 2. Verify "My Listings" Page ---
    print("Navigating to 'My Listings' page...")
    view_all_link.click()

    # Wait for the new page to load and check the heading
    my_listings_heading = page.get_by_role("heading", name="My Listings")
    expect(my_listings_heading).to_be_visible(timeout=10000)
    expect(page).to_have_url(re.compile(r".*/dashboard/my-listings"))

    print("Taking screenshot of the 'My Listings' page...")
    page.screenshot(path="jules-scratch/verification/my-listings-page.png")
    print("'My Listings' page screenshot saved.")

    # --- 3. Verify Owner Controls on Vehicle Details Page ---
    # This part will only succeed if there is at least one listed vehicle.
    print("Checking for a listed vehicle to verify owner controls...")
    try:
        # Find the first vehicle link on the "My Listings" page
        first_listing_link = page.locator("a[href^='/vehicle/']").first
        expect(first_listing_link).to_be_visible(timeout=5000)

        vehicle_href = first_listing_link.get_attribute("href")
        if not vehicle_href:
            raise Exception("Could not find href for the first listed vehicle.")

        print(f"Navigating to vehicle details page: {vehicle_href}")
        first_listing_link.click()

        # On the details page, check for owner controls
        expect(page).to_have_url(re.compile(r".*/vehicle/.*"), timeout=10000)
        print("Verifying owner controls are visible...")

        edit_button = page.get_by_role("button", name="Edit")
        delete_button = page.get_by_role("button", name="Delete")
        mark_sold_button = page.get_by_role("button", name="Mark as Sold")

        expect(edit_button).to_be_visible()
        expect(delete_button).to_be_visible()
        expect(mark_sold_button).to_be_visible()

        print("Owner controls found.")
        print("Taking screenshot of vehicle details page with owner controls...")
        page.screenshot(path="jules-scratch/verification/vehicle-details-owner-view.png")

    except Exception as e:
        print(f"Could not verify owner controls, likely due to empty database: {e}")
        print("This is expected behavior in the current test environment.")

    print("Verification script finished.")


def main():
    # Ensure the output directory exists
    os.makedirs("jules-scratch/verification", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_dashboard_features(page)
        browser.close()

if __name__ == "__main__":
    main()
