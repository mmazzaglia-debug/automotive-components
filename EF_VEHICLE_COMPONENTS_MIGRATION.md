# EF Vehicle Components - Migration Summary

## Overview
Successfully retrieved a comprehensive set of vehicle management components from the automotive org (omoda), including:

- **efDigitalTwin** - Interactive digital twin with vehicle controls, features management, and navigation
- **canVehicleView** - Advanced vehicle visualization with clickable parts and real-time telemetry
- **efVehicleOverview** - Vehicle information display with image carousel
- **efVehicleTimeline** - Real-time telemetry timeline with platform events
- Supporting components: chartJs, efDigitalTwinTabFeatures, efDigitalTwinMap
- Apex controller: CANVehicleController
- Custom objects: Asset_Telematic__c, Asset_Inspection__c, Asset_Alert__c
- Static resources: Vehicle top-view images

This solution provides a complete vehicle management experience with interactive controls, real-time monitoring, and comprehensive telemetry tracking.

---

## Retrieved Components

### 1. Lightning Web Component: `efDigitalTwin`
**Location:** `force-app/main/default/lwc/efDigitalTwin/`

**Files:**
- `efDigitalTwin.js` - Main container component logic
- `efDigitalTwin.html` - Tabbed interface template
- `efDigitalTwin.css` - Component styling (minimal)
- `efDigitalTwin.js-meta.xml` - Component metadata

**Purpose:** Digital Twin container with vehicle controls, features management, and navigation

**Key Features:**
- Tabbed interface with 3 tabs: Controls, Features, Navigation
- Container component that orchestrates child components
- Configurable telemetry measure names
- Real-time vehicle state management
- Works on Vehicle, Asset, WorkOrder, and Case records

**Configuration Properties:**
- `recordId` (String) - Record ID (auto-populated on record pages)
- `objectApiName` (String) - Object API name (dynamic on record pages, manual in Experience Cloud)
- `powerMeasureName` (String, default: "Power") - Telemetry measure name for power chart
- `doorsMeasureName` (String, default: "Doors") - Telemetry measure name for lock state
- `chargeMeasureName` (String, default: "Charge") - Telemetry measure name for battery charge

**Child Components:**
1. **canVehicleView** - Interactive vehicle control panel (Controls tab)
2. **efDigitalTwinTabFeatures** - Vehicle features toggle (Features tab)
3. **efDigitalTwinMap** - Vehicle location and charging stations map (Navigation tab)

---

### 2. Lightning Web Component: `canVehicleView`
**Location:** `force-app/main/default/lwc/canVehicleView/`

**Files:**
- `canVehicleView.js` - Complex vehicle visualization with real-time controls
- `canVehicleView.html` - Interactive vehicle diagram template
- `canVehicleView.css` - Vehicle visualization styling
- `canVehicleView.js-meta.xml` - Component metadata

**Purpose:** Interactive digital twin visualization of vehicle with clickable parts, telemetry charts, and real-time controls

**Key Features:**
- **Interactive Vehicle Diagram** - Top-down view with clickable vehicle parts
- **Real-Time Telemetry** - Live charts showing power consumption and other metrics
- **Part Inspection** - Click parts to see detailed information and telemetry
- **Vehicle Controls:**
  - Lock/Unlock doors
  - Power on/off switch
  - Battery charge indicator
- **Change Data Capture Integration:**
  - Listens to Asset_Inspection__c changes
  - Listens to Asset_Alert__c changes
  - Listens to Case changes
- **Multi-Object Support** - Works on Asset, Vehicle, WorkOrder, and Case records
- **Slider Panel** - Shows part details, remaining life, telemetry charts

**Dependencies:**
- Apex Controller: `CANVehicleController`
- Static Resource: `canVehicleViews` (vehicle images)
- Child Component: `chartJs` (telemetry visualization)
- Custom Objects: Asset_Telematic__c, Asset_Inspection__c, Asset_Alert__c

---

### 3. Lightning Web Component: `efDigitalTwinTabFeatures`
**Location:** `force-app/main/default/lwc/efDigitalTwinTabFeatures/`

**Files:**
- `efDigitalTwinTabFeatures.js` - Vehicle features management
- `efDigitalTwinTabFeatures.html` - Feature toggles interface
- `efDigitalTwinTabFeatures.css` - Feature styling
- `efDigitalTwinTabFeatures.js-meta.xml` - Component metadata

**Purpose:** Manage vehicle software features and subscriptions

**Key Features:**
- Toggle vehicle features on/off
- 14 pre-configured vehicle features:
  - **Subscription:** Vehicle Preconditioning
  - **Driver Assist:** IPAS, Adaptive Cruise Control
  - **Safety:** Blind Spot Monitoring, Pedestrian Detection, Driver Drowsiness Detection, TPMS
  - **Technology:** Virtual Mirrors, Head-Up Display, Launch Control, Summon Vehicle, Ambient Lighting, 360° Camera, DCT
- Expandable accordion sections for each feature
- Creates Asset_Telematic__c records when features are toggled
- Tracks feature state with telemetry (Measure_Name__c = "Service Feature")

**Feature Data Structure:**
Each feature includes:
- Name
- Category (Subscription, Driver Assist, Safety, Technology)
- State (Activated, Deactivated, Unavailable)
- Version number
- Description
- Resource reference

---

### 4. Lightning Web Component: `efDigitalTwinMap`
**Location:** `force-app/main/default/lwc/efDigitalTwinMap/`

**Files:**
- `efDigitalTwinMap.js` - Map with markers
- `efDigitalTwinMap.html` - Map template
- `efDigitalTwinMap.js-meta.xml` - Component metadata

**Purpose:** Display vehicle location and nearby charging stations

**Key Features:**
- Lightning map component with multiple markers
- Vehicle current location marker
- Charging station markers (Gas and Electric)
- Pre-configured with sample locations in Gennevilliers, France
- Marker selection and info windows

**Sample Locations:**
- Vehicle Location (home icon)
- TotalEnergies Gas Station
- ChargeGuru Charging Station
- Stations TIERS Charging Station
- DRIVECO Charging Station

**Note:** Map locations are hardcoded in component. For production, should be replaced with dynamic geolocation data.

---

### 5. Lightning Web Component: `chartJs`
**Location:** `force-app/main/default/lwc/chartJs/`

**Files:**
- `chartJs.js` - Chart.js wrapper component
- `chartJs.html` - Chart canvas template
- `chartJs.js-meta.xml` - Component metadata

**Purpose:** Wrapper for Chart.js library to display telemetry data

**Key Features:**
- Displays line charts for telemetry data
- Dynamic chart updates via `handleUpdateChart` method
- Used by canVehicleView for power and part telemetry

---

### 6. Lightning Web Component: `efVehicleOverview`
**Location:** `force-app/main/default/lwc/efVehicleOverview/`

**Files:**
- `efVehicleOverview.js` - Main component logic
- `efVehicleOverview.html` - Component template
- `efVehicleOverview.js-meta.xml` - Component metadata

**Purpose:** Displays comprehensive vehicle overview with images in a carousel

**Key Features:**
- Shows vehicle information using lightning-record-view-form
- Displays up to 4 vehicle pictures in a carousel
- Uses Lightning Data Service (no Apex needed)
- Responsive grid layout with vehicle details

**Fields Displayed:**
- Name
- VehicleDefinitionId
- AverageMarketValue
- LastOdometerReading
- VehicleRegistrationNumber
- ActiveWarrantyCount

**Image Fields:**
- Vehicle_Picture_URL__c
- Vehicle_Picture_URL_2__c
- Vehicle_Picture_URL_3__c
- Vehicle_Picture_URL_4__c

---

### 2. Lightning Web Component: `efVehicleTimeline`
**Location:** `force-app/main/default/lwc/efVehicleTimeline/`

**Files:**
- `efVehicleTimeline.js` - Main component logic with platform event subscription
- `efVehicleTimeline.html` - Timeline template
- `efVehicleTimeline.css` - Timeline styling
- `efVehicleTimeline.js-meta.xml` - Component metadata

**Purpose:** Real-time vehicle telemetry timeline with live updates

**Key Features:**
- Real-time updates via Platform Events (Change Data Capture)
- Interactive timeline with expandable items
- Custom icons and styling based on telemetry type
- Navigation to related list view
- Limits display to 9 most recent events
- Auto-refresh when new telemetry data arrives

**Telemetry Event Types:**
1. **Light Alert** - Displayed with incident icon
2. **Service Feature** - Shows feature enabled/disabled status
3. **Doors** - Shows doors opened/closed with lock/unlock icons
4. **Power** - Shows vehicle active/inactive status
5. **Default** - Generic telemetry events

**Real-Time Features:**
- Subscribes to Change Data Capture: `/data/Asset_Telematic__ChangeEvent`
- Push Topic support (legacy): `/topic/NewTelematicCreated`
- Auto-refreshes timeline when asset telemetry changes

---

## Apex Controllers

### CANVehicleController
**Location:** `force-app/main/default/classes/CANVehicleController.cls`

**Purpose:** Backend controller for canVehicleView component

**Methods:**
- `getAsset(String assetId)` - Get asset with vehicle image
- `getVehicle(String assetId)` - Get vehicle asset data
- `getAssetIdByVehicleId(String vehicleId)` - Get AssetId from Vehicle record
- `getAssetIdByWorkOrderId(String workOrderId)` - Get AssetId from WorkOrder
- `getAssetIdByCaseId(String caseId)` - Get AssetId from Case
- `getVehiclePartsFromAsset(String assetId)` - Get all child assets (parts)
- `updateAsset(Asset tireAsset)` - Update asset record
- `getTelematics(String assetId)` - Get all telemetry for asset
- `insertTelematics(Asset_Telematic__c)` - Insert new telemetry record
- `saveOpty(Opportunity, List<OpportunityLineItem>)` - Create opportunity with line items
- `getPriceBookList()` - Get available price books
- `getPriceBookEntry(String productId, String pricebookId)` - Get price book entry

**Custom Fields Used:**
- Product2.Top_View_Image_URL__c
- Product2.Product_Image_URL__c
- Product2.Life_Expectancy__c
- Asset.CSS_properties__c
- Asset.Remaining_Life__c
- Asset.Daily_Mileage__c
- Asset.Replacement_Date__c
- Asset.Walk_Around_Order__c

**Note:** Some custom fields on Product2 and Asset may need to be created manually if not present.

---

## Static Resources

### canVehicleViews
**Location:** `force-app/main/default/staticresources/canVehicleViews/`

**Purpose:** Vehicle top-view images for digital twin visualization

**Files:**
- `top_view_car_image.png` - Default vehicle top view
- `audi_a3.png` - Audi A3 top view
- `mercedes.png` - Mercedes top view
- `airbus_a380.png` - Aircraft example
- `train_coach_low.png` - Train example

**Usage:** Referenced by Product2.Top_View_Image_URL__c field to display vehicle diagram in canVehicleView component.

---

## Dependencies

### Standard Objects
- **Vehicle** (Standard Object in Automotive Industry Cloud)
- **Asset** (Standard Object - linked from Vehicle)

### Custom Objects

#### 1. Asset_Telematic__c (Already documented above)
**Location:** `force-app/main/default/objects/Asset_Telematic__c/`

**Purpose:** Stores vehicle telemetry data and events

**Custom Fields:**
- `Asset__c` (Lookup to Asset) - Links telemetry to vehicle asset
- `Description__c` (Text) - Telemetry description
- `Measure_Name__c` (Text/Picklist) - Type of measurement (Light Alert, Service Feature, Doors, Power, etc.)
- `Measure_Time__c` (DateTime) - Timestamp of the measurement
- `Measure_Value__c` (Number/Boolean) - Value of the measurement

**Relationships:**
- Master-Detail or Lookup relationship to Asset (Asset_Telematics__r)

**List Views:**
- All
- telemetry

**Change Data Capture:**
- Must be enabled for real-time updates in timeline component and digital twin controls

---

#### 2. Asset_Inspection__c
**Location:** `force-app/main/default/objects/Asset_Inspection__c/`

**Purpose:** Stores vehicle part inspection records

**Custom Fields:**
- `Asset__c` (Lookup to Asset) - Links inspection to vehicle part
- `Status__c` (Picklist/Number) - Inspection status/result

**Change Data Capture:**
- Must be enabled for real-time inspection status updates in canVehicleView
- Triggers visual indicators on vehicle parts when inspections are created/updated

**Use Case:**
- When a technician inspects a vehicle part, creates Asset_Inspection__c record
- Component automatically highlights the inspected part on vehicle diagram
- Shows inspection status on part details panel

---

#### 3. Asset_Alert__c
**Location:** `force-app/main/default/objects/Asset_Alert__c/`

**Purpose:** Stores vehicle alerts and warnings

**Custom Fields:**
- `Asset__c` (Lookup to Asset) - Links alert to vehicle or part

**Change Data Capture:**
- Must be enabled for real-time alert notifications in canVehicleView
- Triggers visual indicators when alerts are created

**Use Case:**
- System creates Asset_Alert__c when vehicle detects issues
- Component shows alert icon on affected parts
- Alternative to Case object for alert tracking

**Note:** Component also supports Case object for alerts (via AssetId field).

---

### Custom Fields on Vehicle Object

**Location:** `force-app/main/default/objects/Vehicle/fields/`

**Image URL Fields:**
- `Vehicle_Picture_URL__c` (Text/URL, 255) - First vehicle image
- `Vehicle_Picture_URL_2__c` (Text/URL, 255) - Second vehicle image
- `Vehicle_Picture_URL_3__c` (Text/URL, 255) - Third vehicle image
- `Vehicle_Picture_URL_4__c` (Text/URL, 255) - Fourth vehicle image

**Note:** The Vehicle object retrieval includes all standard and custom fields. The entire Vehicle object metadata was retrieved to ensure compatibility.

---

## Platform Configuration Requirements

### 1. Change Data Capture
**Required for efVehicleTimeline real-time updates**

To enable Change Data Capture:
1. Setup → Integrations → Change Data Capture
2. Select `Asset_Telematic__c`
3. Click "Enable" to move to Selected Entities
4. Save

### 2. Platform Events (Optional)
The component also supports a legacy Push Topic:
- Topic Name: `NewTelematicCreated`
- This is optional if Change Data Capture is enabled

### 3. Lightning Experience Required
Both components use Lightning Web Components and must run in Lightning Experience or Communities.

---

## Deployment Steps

### 1. Deploy All Components and Objects
```bash
# Deploy all LWC components
sf project deploy start \
  -m "LightningComponentBundle:efDigitalTwin,LightningComponentBundle:canVehicleView,LightningComponentBundle:efDigitalTwinTabFeatures,LightningComponentBundle:efDigitalTwinMap,LightningComponentBundle:chartJs,LightningComponentBundle:efVehicleOverview,LightningComponentBundle:efVehicleTimeline" \
  -o [target-org-alias]

# Deploy Apex controller
sf project deploy start \
  -m "ApexClass:CANVehicleController" \
  -o [target-org-alias]

# Deploy custom objects
sf project deploy start \
  -m "CustomObject:Asset_Telematic__c,CustomObject:Asset_Inspection__c,CustomObject:Asset_Alert__c" \
  -o [target-org-alias]

# Deploy static resources
sf project deploy start \
  -m "StaticResource:canVehicleViews" \
  -o [target-org-alias]

# Deploy Vehicle custom fields (if deploying to org without them)
sf project deploy start \
  -m "CustomField:Vehicle.Vehicle_Picture_URL__c,CustomField:Vehicle.Vehicle_Picture_URL_2__c,CustomField:Vehicle.Vehicle_Picture_URL_3__c,CustomField:Vehicle.Vehicle_Picture_URL_4__c" \
  -o [target-org-alias]
```

**Or deploy everything at once:**
```bash
sf project deploy start \
  -d force-app/main/default \
  -o [target-org-alias]
```

### 2. Enable Change Data Capture
**Required for real-time functionality**

Navigate to Setup → Integrations → Change Data Capture and enable:
- `Asset_Telematic__c` (for timeline and telemetry updates)
- `Asset_Inspection__c` (for inspection status updates)
- `Asset_Alert__c` (for alert notifications)
- `Case` (optional, for alert tracking via Case object)

### 3. Create Custom Fields (if not deploying full objects)

If your target org already has Product2 and Asset, manually create these fields:

**Product2 Custom Fields:**
- `Top_View_Image_URL__c` (Text/URL, 255) - URL to vehicle top-view image
- `Product_Image_URL__c` (Text/URL, 255) - URL to product/part image
- `Life_Expectancy__c` (Number) - Expected life in miles/km

**Asset Custom Fields:**
- `CSS_properties__c` (Text/Long Text) - CSS positioning for part on diagram
- `Remaining_Life__c` (Number) - Remaining useful life
- `Daily_Mileage__c` (Number) - Average daily usage
- `Replacement_Date__c` (Date) - Scheduled replacement date
- `Walk_Around_Order__c` (Number) - Display order for walk-around

### 4. Configure Vehicle Product Records

For each vehicle product, set the `Top_View_Image_URL__c` field to reference static resource:
```
canVehicleViews/top_view_car_image.png
```

### 5. Create Sample Data

#### Asset_Telematic__c Records:
```apex
// Example telemetry records
Asset_Telematic__c telemetry1 = new Asset_Telematic__c(
    Asset__c = [SELECT AssetId FROM Vehicle WHERE Id = :vehicleId LIMIT 1].AssetId,
    Measure_Name__c = 'Light Alert',
    Measure_Time__c = System.now(),
    Measure_Value__c = 1,
    Description__c = 'Check Engine Light'
);

Asset_Telematic__c telemetry2 = new Asset_Telematic__c(
    Asset__c = [SELECT AssetId FROM Vehicle WHERE Id = :vehicleId LIMIT 1].AssetId,
    Measure_Name__c = 'Doors',
    Measure_Time__c = System.now(),
    Measure_Value__c = 1, // 1 = opened, 0 = closed
    Description__c = 'Front Left Door'
);

insert new List<Asset_Telematic__c>{telemetry1, telemetry2};
```

### 6. Add Components to Vehicle Record Page
1. Navigate to Setup → Lightning App Builder
2. Edit the Vehicle Record Page
3. Add components:
   - **efDigitalTwin** - Full-width main section (contains Controls, Features, Navigation tabs)
   - **efVehicleOverview** - Secondary section or tab for static vehicle info
   - **efVehicleTimeline** - Sidebar or dedicated tab for telemetry timeline
4. Configure efDigitalTwin properties (use defaults or customize measure names)
5. Save and activate

**Recommended Layout:**
- Tab 1: Digital Twin (efDigitalTwin - interactive controls)
- Tab 2: Overview (efVehicleOverview - vehicle details and photos)
- Tab 3: Timeline (efVehicleTimeline - telemetry events)

**Alternative Layout:**
- Main Section: efDigitalTwin (full width)
- Right Sidebar: efVehicleTimeline
- Bottom Section: efVehicleOverview

---

## Component Configuration

### efDigitalTwin
**Configuration Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| recordId | String | {!recordId} | Auto-populated on record pages |
| objectApiName | String | Vehicle | Object API name (required in Experience Cloud) |
| powerMeasureName | String | Power | Measure name for power telemetry chart |
| doorsMeasureName | String | Doors | Measure name for lock/unlock control |
| chargeMeasureName | String | Charge | Measure name for battery charge display |

**Targets:**
- Lightning Record Pages (Vehicle, Asset, WorkOrder, Case)
- Lightning Communities
- Experience Cloud Sites

**Best Practices:**
- Use default measure names unless telemetry uses different naming
- Ensure AssetId is populated on Vehicle records
- Create child Asset records for vehicle parts to enable part inspection

---

### canVehicleView
**Nested within efDigitalTwin - Not typically placed directly on page**

**Key Configuration:**
- Receives configuration from parent efDigitalTwin component
- Requires AssetId to function
- Needs static resource images for vehicle visualization

**Part Configuration:**
To make parts clickable on vehicle diagram:
1. Create Asset records as children of main vehicle Asset (ParentId field)
2. Set `CSS_properties__c` field with positioning CSS: `top: 40%; left: 30%;`
3. Set `Walk_Around_Order__c` for display ordering
4. Optionally set `Remaining_Life__c` and `Life_Expectancy__c` for gauges

---

### efDigitalTwinTabFeatures
**Nested within efDigitalTwin - Features tab**

**Configuration:**
- No configuration needed
- Features list is hardcoded in component
- Toggles create Asset_Telematic__c records with Measure_Name__c = "Service Feature"

**Customization:**
To add/modify features, edit the `features` array in `efDigitalTwinTabFeatures.js`

---

### efDigitalTwinMap
**Nested within efDigitalTwin - Navigation tab**

**Configuration:**
- Map markers are hardcoded with French locations
- To customize: Edit `mapMarkers` array in `efDigitalTwinMap.js`
- For production: Replace with dynamic geolocation data

---

### efVehicleOverview
**No configuration needed** - Uses standard recordId from the page

**Targets:**
- Lightning Record Pages
- Lightning Communities
- Experience Cloud Sites

**recordId Property:**
- Automatically populated on record pages
- Can be manually set in Experience Cloud: `{!recordId}`

### efVehicleTimeline
**No configuration needed** - Uses standard recordId from the page

**Targets:**
- Lightning Record Pages
- Lightning Communities
- Experience Cloud Sites

**recordId Property:**
- Automatically populated on record pages
- Can be manually set in Experience Cloud: `{!recordId}`

**Real-Time Behavior:**
- Automatically subscribes to platform events when component loads
- Updates timeline when new Asset_Telematic__c records are created
- Shows loading spinner while data is fetched

---

## Data Flow

### efVehicleOverview
1. Receives Vehicle recordId from page
2. Uses Lightning Data Service to fetch:
   - Vehicle fields via getRecord
   - Image URLs from custom fields
3. Displays data in card with carousel

### efVehicleTimeline
1. Receives Vehicle recordId from page
2. Fetches Vehicle.AssetId via getRecord wire
3. Queries related Asset_Telematic__c records via getRelatedListRecords
4. Subscribes to Change Data Capture channel
5. Displays timeline with expandable items
6. Listens for new telemetry events
7. Auto-refreshes when matching events arrive

---

## Telemetry Event Logic

The timeline component applies different styling based on `Measure_Name__c`:

| Measure Name    | Icon           | Color/Style    | Display Logic                              |
|-----------------|----------------|----------------|--------------------------------------------|
| Light Alert     | utility:incident | Event (orange) | Shows "Light Alert"                       |
| Service Feature | utility:product | Call (purple)  | Shows "{Description} is enabled/disabled" |
| Doors           | utility:lock/unlock | Email (blue) | Shows "Doors are opened/closed"          |
| Power           | utility:events | Task (blue)    | Shows "Car is now Active/Inactive"        |
| Default         | utility:events | Task (blue)    | Shows "Asset Telematic"                   |

---

## Testing Recommendations

### Manual Testing

#### efVehicleOverview:
1. Navigate to a Vehicle record
2. Verify component displays vehicle information
3. Add image URLs to Vehicle_Picture_URL__c fields
4. Verify carousel displays images correctly
5. Test with 1-4 images
6. Verify responsive layout

#### efVehicleTimeline:
1. Navigate to a Vehicle record with an Asset
2. Create Asset_Telematic__c records for the vehicle's asset
3. Verify timeline displays telemetry events
4. Click expand/collapse buttons
5. Test different Measure_Name__c values
6. Verify icons and styling change appropriately
7. Click "View All" to test navigation

#### Real-Time Updates:
1. Keep Vehicle record page open
2. Create new Asset_Telematic__c record via API or another tab
3. Verify timeline auto-updates (may take 1-2 seconds)
4. Check browser console for subscription messages

### Apex Test Coverage
**Note:** These components use Lightning Data Service and don't require Apex controllers, so no Apex test classes are needed.

For integration testing, consider creating:
- Test data loader for Asset_Telematic__c records
- Automated UI tests using Selenium or similar tools

---

## Component Architecture

### efVehicleOverview
- **No Apex Dependencies** - Pure LWC with Lightning Data Service
- **Wire Services:**
  - `getRecord` for Vehicle data
  - Lightning Base Components for UI
- **Responsive Design** - SLDS grid system

### efVehicleTimeline
- **No Apex Dependencies** - Pure LWC with Lightning Data Service
- **Wire Services:**
  - `getRecord` for Vehicle → Asset mapping
  - `getRelatedListRecords` for Asset_Telematic__c
- **Platform Event Integration:**
  - `lightning/empApi` for real-time subscriptions
  - `lightning/refresh` for UI updates
  - `notifyRecordUpdateAvailable` for cache refresh
- **Navigation:**
  - `NavigationMixin` for related list navigation

---

## Performance Considerations

1. **Timeline Limit:** Component shows only 9 most recent events to optimize performance
2. **Caching:** Uses Lightning Data Service built-in caching
3. **Real-Time Updates:** Only refreshes when Asset matches current vehicle
4. **Platform Events:** Minimal performance impact, handled by Salesforce platform

---

## Troubleshooting

### efVehicleOverview Issues:

**Images not displaying:**
- Verify Vehicle_Picture_URL__c fields contain valid URLs
- Check URLs are publicly accessible or served from Salesforce Files
- Verify field-level security allows read access

**Fields not showing:**
- Check Vehicle object field-level security
- Verify user has read access to Vehicle object

### efVehicleTimeline Issues:

**Timeline empty:**
- Verify Asset_Telematic__c records exist for the vehicle's Asset
- Check Asset__c field is populated correctly
- Verify relationship name is `Asset_Telematics__r`

**Real-time updates not working:**
- Check Change Data Capture is enabled for Asset_Telematic__c
- Verify browser console for subscription messages
- Check for JavaScript errors in console
- Verify user has streaming API permissions

**Console shows subscription errors:**
- Enable Streaming API in user profile
- Check API limits haven't been exceeded
- Verify org has Change Data Capture enabled

---

## API Versions
- efVehicleOverview: API v55.0
- efVehicleTimeline: API v56.0

---

## Additional Notes

### Vehicle Object
- The complete Vehicle standard object metadata was retrieved
- Includes all standard Automotive Cloud fields
- Custom Picture URL fields are additions

### Asset_Telematic__c Custom Object
- Custom object specific to this implementation
- Designed for real-time telemetry tracking
- Supports Change Data Capture for live updates

### Security
- Both components respect object and field-level security
- No sharing rule bypass
- Uses user context for all data access

### Communities/Experience Cloud
- Both components are exposed for Experience Cloud
- Support dynamic recordId binding
- Can be used in Account or Contact Community pages with proper context

---

## Quick Start Summary

**Digital Twin Features:**
- **Tab 1 - Controls:** Interactive vehicle diagram with clickable parts, lock/unlock, power on/off, telemetry charts
- **Tab 2 - Features:** Toggle 14 vehicle software features (ADAS, safety, subscriptions)
- **Tab 3 - Navigation:** Map with vehicle location and nearby charging stations

**Real-Time Capabilities:**
- Live telemetry updates via Change Data Capture
- Part inspection status indicators
- Alert notifications on vehicle parts
- Automatic chart updates

## Next Steps

1. ✅ Deploy all components, Apex controller, and custom objects
2. ✅ Enable Change Data Capture for Asset_Telematic__c, Asset_Inspection__c, Asset_Alert__c
3. ✅ Upload vehicle images to static resources or Files
4. ✅ Configure Product2.Top_View_Image_URL__c for vehicle products
5. ✅ Create Asset hierarchy (Vehicle Asset → Part Assets)
6. ✅ Set CSS_properties__c on part Assets for diagram positioning
7. ✅ Create sample Asset_Telematic__c records
8. ✅ Add efDigitalTwin to Vehicle record page
9. ✅ Test interactive controls (lock/unlock, power, part selection)
10. ✅ Test real-time updates by creating telemetry/inspection records
11. ✅ Train users on digital twin functionality

## Known Limitations & Notes

1. **Map Locations:** efDigitalTwinMap has hardcoded locations in France - customize for your geography
2. **Vehicle Images:** Static resource contains sample images - replace with actual vehicle images
3. **Part Positioning:** CSS_properties__c requires manual configuration per vehicle type
4. **Features List:** 14 features are hardcoded - customize in efDigitalTwinTabFeatures.js
5. **Custom Fields:** Product2 and Asset custom fields may need manual creation
6. **Streaming API:** Users need Streaming API permission for real-time updates
7. **Asset Hierarchy:** Component expects ParentId relationship for parts

---

## Files Included

### Lightning Web Components:
- `force-app/main/default/lwc/efDigitalTwin/` - Main digital twin container (4 files)
- `force-app/main/default/lwc/canVehicleView/` - Interactive vehicle control panel (4 files)
- `force-app/main/default/lwc/efDigitalTwinTabFeatures/` - Features management tab (4 files)
- `force-app/main/default/lwc/efDigitalTwinMap/` - Navigation map tab (3 files)
- `force-app/main/default/lwc/chartJs/` - Chart visualization wrapper (3 files)
- `force-app/main/default/lwc/efVehicleOverview/` - Vehicle overview with images (3 files)
- `force-app/main/default/lwc/efVehicleTimeline/` - Telemetry timeline (4 files)

### Apex Classes:
- `force-app/main/default/classes/CANVehicleController.cls` - Backend controller for canVehicleView
- `force-app/main/default/classes/CANVehicleController.cls-meta.xml`

### Static Resources:
- `force-app/main/default/staticresources/canVehicleViews/` - Vehicle top-view images (5 image files)
- `force-app/main/default/staticresources/canVehicleViews.resource-meta.xml`

### Custom Objects:
- `force-app/main/default/objects/Asset_Telematic__c/` - Telemetry data
- `force-app/main/default/objects/Asset_Inspection__c/` - Part inspection records
- `force-app/main/default/objects/Asset_Alert__c/` - Vehicle alerts
- `force-app/main/default/objects/Vehicle/` - Vehicle custom fields (4 image URL fields)

### Total Count:
- **7 Lightning Web Components** (25 files total)
- **1 Apex Class** (2 files)
- **1 Static Resource** (6 files)
- **3 Custom Objects** + Vehicle fields
- Object metadata, fields, and list views
