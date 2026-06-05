# Recommended Vehicles Component - Migration Summary

## Overview
Successfully retrieved the **Recommended Vehicles** component from the automotive org (omoda) and copied it to the current project.

## Retrieved Components

### 1. Lightning Web Component: `recommendedVehicles`
**Location:** `force-app/main/default/lwc/recommendedVehicles/`

**Files:**
- `recommendedVehicles.js` - Main component logic
- `recommendedVehicles.html` - Component template
- `recommendedVehicles.css` - Component styles
- `recommendedVehicles.js-meta.xml` - Component metadata
- `recommendedVehicles.svg` - Component icon

**Purpose:** Displays recommended vehicles for Lead records

**Configuration Options:**
- Maximum Vehicles to Display (default: 3, range: 1-10)
- Manual vehicle configuration (Vehicle 1-3):
  - Vehicle Name
  - Vehicle Image URL
  - Vehicle Record Link (URL or Record Id)

### 2. Apex Controller: `RecommendedVehiclesController`
**Location:** `force-app/main/default/classes/`

**Files:**
- `RecommendedVehiclesController.cls`
- `RecommendedVehiclesController.cls-meta.xml`

**Purpose:** Provides backend logic to fetch random vehicle recommendations

**Key Features:**
- Cacheable @AuraEnabled method for performance
- Flexible object support: tries `Vehicle__c` first, falls back to `Product2`
- Dynamic field detection for image URLs (supports multiple field naming conventions)
- Random shuffle algorithm for varied recommendations
- Configurable result limit

## Dependencies

### Standard Objects
- **Lead** - The component is designed to be placed on Lead record pages

### Custom/Standard Objects (One of the following is needed)
- **Vehicle__c** (Custom Object) - Primary choice for vehicle data
- **Product2** (Standard Object) - Fallback option if Vehicle__c doesn't exist

### Required Fields
The Apex controller looks for:
- `Name` field (required on the object)
- One of these image URL fields (optional):
  - `Image_URL__c`
  - `ImageUrl__c`
  - `Photo_URL__c`
  - `PhotoUrl__c`
  - `Picture_URL__c`
  - `PictureUrl__c`
  - `Thumbnail_URL__c`
  - `ThumbnailUrl__c`

## Deployment Steps

1. **Deploy the components to target org:**
   ```bash
   sf project deploy start -m "LightningComponentBundle:recommendedVehicles,ApexClass:RecommendedVehiclesController" -o [target-org-alias]
   ```

2. **Create a Vehicle custom object (if not using Product2):**
   - Object API Name: `Vehicle__c`
   - Required fields:
     - `Name` (Auto Number or Text)
     - `Image_URL__c` (Text/URL field) - optional but recommended

3. **Add sample vehicle data:**
   Create records in either Vehicle__c or Product2 with:
   - Name populated
   - Image URL field populated (for display)

4. **Add component to Lead record page:**
   - Navigate to Setup > Lightning App Builder
   - Edit the Lead Record Page
   - Drag "Recommended Vehicles" component onto the page
   - Configure the component properties as needed
   - Save and activate

## Testing Recommendations

### Manual Testing
1. Create/navigate to a Lead record
2. Verify the component loads and displays vehicles
3. Test with different maxRecords configurations
4. Test manual vehicle configuration
5. Verify links work correctly

### Apex Test Coverage
**Note:** No test class was found in the source org. You should create one:
- Create `RecommendedVehiclesControllerTest.cls`
- Test scenarios:
  - Get recommendations with Vehicle__c records
  - Get recommendations with Product2 records
  - Handle empty results
  - Test with various maxRecords values
  - Test field detection logic

## Component Behavior

### Auto Mode (Default)
When no manual vehicles are configured, the component:
1. Queries for available vehicle records
2. Randomizes the order
3. Displays up to maxRecords vehicles
4. Shows vehicle name and image (if available)
5. Links to vehicle record pages

### Manual Mode
When vehicle fields are configured:
1. Displays exactly the configured vehicles
2. Uses provided names, images, and links
3. Ignores the Apex controller
4. Filters out empty/incomplete entries

### Edge Cases
- Shows empty state message when no vehicles available
- Shows loading spinner during data fetch
- Gracefully handles missing images (shows icon fallback)
- Supports absolute URLs, relative URLs, and record Ids for links

## Additional Notes

- Component is exposed for Lightning Record Pages only
- Designed specifically for Lead object
- API Version: 64.0
- Uses caching for better performance
- No custom permissions or profiles required
- Works with both custom and standard objects

## Next Steps

1. Deploy to target org
2. Create test class for Apex controller
3. Set up Vehicle__c object or ensure Product2 has appropriate data
4. Add component to Lead page layouts
5. Test thoroughly in sandbox before production deployment
