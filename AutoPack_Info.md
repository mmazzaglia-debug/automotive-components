# Automotive Industry Package - Component & Data Inventory

## Overview

This package contains a comprehensive set of Salesforce components and configurations specifically designed for the **automotive industry**. The purpose of this project is to allow organizations, consultants, and Salesforce professionals to **easily set up a production-ready Salesforce org for automotive businesses** without spending months on custom development.

This package eliminates the complexity of building automotive CRM solutions from scratch by providing pre-built, fully functional components for vehicle management, dealer portals, customer interactions, and connected vehicle experiences.

---

## Target Audience

- **Automotive Dealerships** - Implement a complete dealer management system
- **OEMs (Original Equipment Manufacturers)** - Deploy partner/dealer portals
- **Automotive Consultants** - Rapidly deliver automotive CRM solutions to clients
- **Salesforce Professionals** - Learn automotive industry best practices and accelerate implementations
- **Demo & Training** - Create realistic automotive demos and training environments

---

## What's Included in This Package

### Lightning Web Components (10 Components)

#### 1. **recommendedVehicles**
- **Purpose:** Display personalized vehicle recommendations on Lead pages
- **Features:**
  - Configurable number of recommendations (1-10 vehicles)
  - Manual override option for specific vehicle selection
  - Random shuffle functionality
  - Automatic fallback to Product2 catalog if Vehicle__c not available
  - Responsive card layout with vehicle images
- **Use Case:** Sales teams can see relevant vehicles for each lead based on preferences

#### 2. **efVehicleOverview**
- **Purpose:** Display comprehensive vehicle information with image carousel
- **Features:**
  - 4-image carousel showcasing vehicle from multiple angles
  - Standard vehicle details display using Lightning Data Service
  - Responsive layout
- **Use Case:** Present vehicle details to customers or dealers with visual appeal

#### 3. **efVehicleTimeline**
- **Purpose:** Real-time vehicle telemetry timeline with live updates
- **Features:**
  - Displays 9 most recent telemetry events
  - Real-time updates via Change Data Capture
  - Platform event subscription for live data streaming
  - Expandable event items with custom icons
  - Supports multiple telemetry types (temperature, battery, doors, alerts, etc.)
- **Use Case:** Monitor vehicle health, service history, and real-time events

#### 4. **efDigitalTwin**
- **Purpose:** Main container for complete vehicle digital twin interface
- **Features:**
  - Tabbed interface (Controls, Features, Navigation)
  - Integration with child components
  - Configurable measure names for different telemetry types
  - Lightning Data Service integration for vehicle/asset data
- **Use Case:** Provide a unified digital twin experience for connected vehicles

#### 5. **canVehicleView**
- **Purpose:** Interactive vehicle diagram with clickable parts and real-time controls
- **Features:**
  - Top-view interactive vehicle diagram
  - Clickable vehicle parts showing inspection status and remaining life
  - Real-time control actions (lock/unlock doors, power on/off, battery charge)
  - Part inspection status updates via Change Data Capture
  - Alert monitoring with live notifications
  - Telemetry chart visualization using Chart.js
  - Multi-object support (works on Asset, Vehicle, WorkOrder, Case records)
  - CDC subscriptions for real-time updates
- **Use Case:** Service technicians and customers can interact with vehicle systems remotely

#### 6. **efDigitalTwinTabFeatures**
- **Purpose:** Manage 14 vehicle software features and subscriptions
- **Features:**
  - Toggle 14 software features on/off
  - Categories: Driver Assist, Safety, Subscription services
  - Features include: ADAS, ACC, Lane Keeping, Blind Spot, Parking Assist, Preconditioning, etc.
  - Creates telemetry records when features are toggled
  - Visual feedback with icons and status indicators
- **Use Case:** Manage vehicle software subscriptions and feature activation

#### 7. **efDigitalTwinMap**
- **Purpose:** Display vehicle location and nearby charging stations
- **Features:**
  - Interactive map with vehicle location pin
  - Charging station markers
  - Configurable locations (default: Gennevilliers, France)
  - Integration with Lightning Map component
- **Use Case:** Track vehicle location and find nearby services

#### 8. **chartJs**
- **Purpose:** Chart.js wrapper for telemetry data visualization
- **Features:**
  - Dynamic chart updates
  - Multiple chart types supported
  - Telemetry trend visualization
- **Use Case:** Display vehicle telemetry trends (battery levels, temperature, etc.)

#### 9. **carConfigurator**
- **Purpose:** Interactive vehicle configuration tool
- **Features:**
  - Visual vehicle configuration interface
  - Options and package selection
  - Integration with vehicle catalog
- **Use Case:** Allow customers or dealers to configure vehicles with options and packages

#### 10. **financeCalculator**
- **Purpose:** Vehicle financing calculator
- **Features:**
  - Loan payment calculations
  - Interest rate scenarios
  - Down payment options
- **Use Case:** Help customers understand financing options during sales process

---

### Apex Controllers (2 Classes)

#### 1. **RecommendedVehiclesController**
- **Purpose:** Backend logic for recommendedVehicles component
- **Key Methods:**
  - `getRecommendedVehicles(Id leadId, Integer maxRecords)` - Returns vehicle recommendations
- **Logic:**
  - Searches Vehicle__c object first
  - Falls back to Product2 if needed
  - Supports manual override for specific vehicles
  - Random shuffle algorithm for variety
  - Dynamic field detection for image URLs

#### 2. **CANVehicleController**
- **Purpose:** Backend logic for canVehicleView and digital twin components
- **Key Methods:**
  - `getAsset(String assetId)` - Retrieve asset with image URL
  - `getVehiclePartsFromAsset(String assetId)` - Get child assets/parts
  - `getTelematics(String assetId)` - Retrieve telemetry records
  - `insertTelematics(Asset_Telematic__c telemetry)` - Create telemetry data
  - `getAssetIdByVehicleId/WorkOrderId/CaseId` - Multi-object navigation support
- **Features:**
  - Cacheable queries for performance
  - Multi-object support
  - Real-time telemetry data management

---

### Custom Objects (4 Objects)

#### 1. **Asset_Telematic__c**
- **Purpose:** Store real-time vehicle and part telemetry data
- **Key Fields:**
  - `Asset__c` (Lookup to Asset) - Links telemetry to vehicle/part
  - `Measure_Name__c` (Text) - Type of measurement (Power, Doors, Charge, Temperature, etc.)
  - `Measure_Time__c` (DateTime) - Timestamp of measurement
  - `Measure_Value__c` (Number) - Numerical value of measurement
  - `Description__c` (Text) - Additional context
- **Change Data Capture:** Enabled for real-time streaming
- **Use Cases:**
  - Battery charge levels
  - Door lock status
  - Power on/off status
  - Temperature readings
  - Service feature activations
  - Alert notifications

#### 2. **Asset_Inspection__c**
- **Purpose:** Track vehicle part inspection records
- **Key Fields:**
  - `Asset__c` (Lookup to Asset) - Links to vehicle part
  - `Status__c` (Picklist/Number) - Inspection status
- **Change Data Capture:** Enabled for real-time status updates
- **Use Cases:**
  - Service inspection tracking
  - Part condition monitoring
  - Maintenance scheduling

#### 3. **Asset_Alert__c**
- **Purpose:** Vehicle alerts and warnings system
- **Key Fields:**
  - `Asset__c` (Lookup to Asset) - Links to vehicle
- **Change Data Capture:** Enabled for real-time alert notifications
- **Use Cases:**
  - Critical vehicle alerts
  - Warning notifications
  - Proactive service recommendations

#### 4. **Vehicle (Standard Object with Custom Fields)**
- **Custom Fields Added:**
  - `Vehicle_Picture_URL__c` (Text/URL, 255) - Primary vehicle image
  - `Vehicle_Picture_URL_2__c` (Text/URL, 255) - Secondary image
  - `Vehicle_Picture_URL_3__c` (Text/URL, 255) - Third image
  - `Vehicle_Picture_URL_4__c` (Text/URL, 255) - Fourth image
- **Use Cases:**
  - Multi-angle vehicle photography
  - Image carousel displays
  - Visual vehicle catalog

---

### Experience Cloud Site (1 Complete Site)

#### **Electra Dealer Central**
- **Type:** Partner Central / Dealer Portal
- **Status:** Production-ready with 129 files
- **Template Base:** Partner Central
- **Total Components:**
  - 60 custom pages (views)
  - 60 routes
  - 2 themes (Automotive, Jepson)
  - 2 branding sets
  - 5 configuration files

**Key Pages & Features:**

**Dashboard & Home:**
- Lead Inbox with recent leads
- My Opportunities (compact view, 8 records)
- All Activated Orders (6 records)
- Application Forms (6 records)
- My Open Cases (6 records)
- Custom record snapshot component

**Sales Management:**
- Lead list, detail, and related lists
- Opportunity/Quote list, detail, and related lists
- Vehicle catalog (list, detail, related lists)
- OEM Orders management

**Automotive-Specific:**
- Car Configurator page (integrated with carConfigurator LWC)
- Finance Calculator page (integrated with financeCalculator LWC)
- Vehicle inventory management

**Lending & Finance:**
- Automotive lending application forms
- Application form product catalog
- Asset lending pages for partners
- Proposal rehashing tools

**Service Management:**
- Case list, detail, and related lists
- Service Appointment scheduling (list, detail, related lists)
- Booking management (list, detail, related lists)

**Training & Enablement:**
- Enablement program catalog
- Program detail pages
- Milestone tracking
- Lesson exercises (video, link-based)

**Content & Communication:**
- Knowledge article details
- News article details
- Topic pages
- Chatter feed integration
- Report builder and viewer

**Authentication:**
- Custom login page
- Self-registration page
- Forgot password flow
- Login error handling

**Themes & Branding:**
- Custom Automotive theme with brand colors
- Alternative Jepson theme
- Customizable branding sets (logos, fonts, colors)
- Responsive design for mobile

**External Integrations:**
- Font Awesome icons (https://kit.fontawesome.com)
- Flaticon images (https://cdn-icons-png.flaticon.com)
- Tableau Public dashboards (https://public.tableau.com)
- Amazon AWS resources (https://*.amazonaws.com)

---

### Static Resources (1 Resource)

#### **canVehicleViews**
- **Purpose:** Vehicle top-view images for digital twin diagram
- **Files Included:**
  - `top_view_car_image.png` - Generic car top view
  - `audi_a3.png` - Audi A3 top view
  - `mercedes.png` - Mercedes top view
  - `airbus_a380.png` - Aircraft example
  - `train_coach_low.png` - Train example
- **Usage:** Referenced by Product2/Asset Top_View_Image_URL__c field
- **Use Case:** Interactive vehicle diagrams in digital twin interface

---

## Architecture Overview

### Object Relationships
```
Account (Dealer/Customer)
    ├── Vehicle (Standard Automotive Cloud)
    │       ├── Vehicle_Picture_URL__c (1-4 images)
    │       └── Asset (Individual vehicle instance)
    │               ├── Asset (Child parts - doors, battery, engine, etc.)
    │               │       ├── CSS_properties__c (visual positioning)
    │               │       ├── Remaining_Life__c (health metric)
    │               │       └── Walk_Around_Order__c (display order)
    │               ├── Asset_Telematic__c (real-time data)
    │               │       ├── Measure_Name__c
    │               │       ├── Measure_Value__c
    │               │       └── Measure_Time__c
    │               ├── Asset_Inspection__c (inspection records)
    │               └── Asset_Alert__c (alerts/warnings)
    ├── Lead
    │       └── Recommended Vehicles (via recommendedVehicles component)
    ├── Opportunity
    ├── Quote
    ├── Order
    ├── Case
    ├── Service Appointment
    ├── Booking
    └── ApplicationForm (Financial Services Cloud)
```

### Real-Time Data Flow
```
Vehicle Action (UI) 
    → Apex Controller 
    → Create Asset_Telematic__c record
    → Change Data Capture Event
    → Platform Event Streaming
    → LWC Component Subscription
    → UI Update (Real-Time)
```

---

## Use Cases & Scenarios

### 1. **Dealership Implementation**
Deploy a complete dealer management system with:
- Lead management with vehicle recommendations
- Inventory management
- Service scheduling
- Customer portal
- Training programs for staff

### 2. **OEM Partner/Dealer Network Portal**
Use Electra Dealer Central to:
- Provide dealers access to vehicle catalog
- Manage orders and quotes
- Configure vehicles for customers
- Access training and enablement content
- Submit warranty cases

### 3. **Connected Vehicle Platform**
Leverage digital twin components for:
- Real-time vehicle monitoring
- Remote diagnostics
- Feature subscription management
- Proactive service alerts
- Telemetry tracking

### 4. **Sales Demos & POCs**
Quickly demonstrate:
- Automotive CRM capabilities
- Connected vehicle experiences
- Dealer portal functionality
- Mobile-responsive design
- Real-time data streaming

### 5. **Training & Education**
Use as a learning platform for:
- Salesforce Automotive Cloud training
- Experience Cloud best practices
- Real-time data streaming with CDC
- LWC component development patterns

---

## Prerequisites

### Required Licenses
- **Salesforce Automotive Cloud** - For Vehicle standard object
- **Experience Cloud** (Partner Central or similar) - For dealer portal
- **Financial Services Cloud** (Optional) - If using lending features
- **Platform Events** - Included with most Salesforce licenses

### Technical Requirements
- Salesforce API version 57.0 or higher
- Change Data Capture enabled
- Platform Events enabled
- Experience Cloud site license

### Permissions Required
- Manage Experience Cloud Sites
- View Setup and Configuration
- Customize Application
- Create and Deploy Apex
- Create and Deploy Lightning Components

---

## Quick Start Deployment

### Step 1: Deploy Custom Objects
```bash
sf project deploy start \
  -m "CustomObject:Asset_Telematic__c,CustomObject:Asset_Inspection__c,CustomObject:Asset_Alert__c" \
  -o [your-org-alias]
```

### Step 2: Deploy Apex Controllers
```bash
sf project deploy start \
  -m "ApexClass:RecommendedVehiclesController,ApexClass:CANVehicleController" \
  -o [your-org-alias]
```

### Step 3: Deploy Static Resources
```bash
sf project deploy start \
  -m "StaticResource:canVehicleViews" \
  -o [your-org-alias]
```

### Step 4: Deploy Lightning Web Components
```bash
sf project deploy start \
  -m "LightningComponentBundle:recommendedVehicles,LightningComponentBundle:efVehicleOverview,LightningComponentBundle:efVehicleTimeline,LightningComponentBundle:efDigitalTwin,LightningComponentBundle:canVehicleView,LightningComponentBundle:efDigitalTwinTabFeatures,LightningComponentBundle:efDigitalTwinMap,LightningComponentBundle:chartJs,LightningComponentBundle:carConfigurator,LightningComponentBundle:financeCalculator" \
  -o [your-org-alias]
```

### Step 5: Deploy Experience Cloud Site
```bash
sf project deploy start \
  -m "ExperienceBundle:Electra_Dealer_Central1" \
  -o [your-org-alias]
```

### Step 6: Enable Change Data Capture
In Setup → Integrations → Change Data Capture:
1. Select: Asset_Telematic__c
2. Select: Asset_Inspection__c
3. Select: Asset_Alert__c
4. Select: Case (if using case alerts)
5. Click "Save"

### Step 7: Activate Experience Site
1. Setup → All Sites → Electra Dealer Central
2. Click "Activate" or "Administration"
3. Configure permissions for Guest User and Member profiles
4. Set up custom domain (optional)

---

## Configuration Guide

### Recommended Vehicles Component
Add to Lead page layouts:
1. Edit Lead Lightning Record Page
2. Add "recommendedVehicles" component
3. Configure properties:
   - Maximum Records: 5 (default)
   - Allow Manual Override: true/false

### Digital Twin Components
Add to Asset or Vehicle page layouts:
1. Edit record page in Lightning App Builder
2. Add "efDigitalTwin" component
3. Configure measure names:
   - Charge Measure Name: "Charge"
   - Power Measure Name: "Power"
   - Doors Measure Name: "Doors"

### Experience Cloud Site
Configure sharing rules:
1. Account sharing based on partner account hierarchy
2. Opportunity sharing based on account
3. Lead assignment rules for distribution
4. Profile permissions for guest vs. authenticated users

---

## Sample Data Requirements

### For Digital Twin Features
- **Asset records** with Top_View_Image_URL__c field populated
- **Child Asset records** representing vehicle parts with:
  - CSS_properties__c (e.g., "top: 40%; left: 20%;")
  - Remaining_Life__c (percentage)
  - Walk_Around_Order__c (display sequence)

### For Recommended Vehicles
- **Vehicle__c records** with Image_URL__c fields (1-4 variants)
- **Lead records** for testing recommendations

### For Experience Cloud
- **Partner User accounts** with appropriate profile
- **Account hierarchy** for dealer structure
- **Vehicle catalog** with images
- **Sample leads, opportunities, cases**

---

## Testing Procedures

### Real-Time Component Testing
1. Open canVehicleView on an Asset record
2. Click "Lock Doors" - verify telemetry record created
3. Observe real-time UI update (no page refresh)
4. Check Asset_Telematic__c records created

### Experience Cloud Testing
1. Access site as guest user (test login/registration)
2. Login as partner user
3. Navigate all main pages (Home, Leads, Vehicles, Cases)
4. Test car configurator
5. Test finance calculator
6. Verify responsive design on mobile

### Integration Testing
1. Create Lead → verify vehicle recommendations appear
2. Create Asset → test digital twin interface
3. Toggle vehicle features → verify telemetry created
4. Create service appointment from dealer portal

---

## Performance Considerations

- **Change Data Capture:** Events published within seconds, typically 1-3 seconds
- **List Views:** Use filters to limit data volume in Experience Cloud
- **Image Loading:** Store images in Salesforce Files or external CDN for best performance
- **Telemetry Volume:** Asset_Telematic__c can grow large; implement data retention policy
- **Experience Cloud:** Cache settings configured for optimal performance

---

## Support & Resources

### Documentation Files Included
- **RECOMMENDED_VEHICLES_MIGRATION.md** - recommendedVehicles component guide
- **EF_VEHICLE_COMPONENTS_MIGRATION.md** - Digital twin components guide
- **ELECTRA_DEALER_CENTRAL_MIGRATION.md** - Experience Cloud site guide

### Salesforce Resources
- [Automotive Cloud Documentation](https://help.salesforce.com/s/articleView?id=sf.automotive_cloud.htm)
- [Experience Cloud Basics](https://help.salesforce.com/s/articleView?id=sf.networks_resources.htm)
- [Change Data Capture Guide](https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/)
- [Lightning Web Components Dev Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)

---

## Troubleshooting

### Components Not Appearing
- Verify all dependencies deployed (Apex, custom objects, static resources)
- Check user permissions for custom objects
- Refresh Lightning Component cache

### Real-Time Updates Not Working
- Verify Change Data Capture enabled for custom objects
- Check Platform Event allocations not exceeded
- Review browser console for subscription errors

### Experience Cloud Site Issues
- Verify site is activated
- Check guest user profile permissions
- Ensure sharing rules configured
- Review external script CSP settings

### Image Display Issues
- Verify Image_URL__c fields populated
- Check static resource deployed
- Validate URL format and accessibility

---

## Project Structure

```
force-app/main/default/
├── classes/
│   ├── RecommendedVehiclesController.cls
│   ├── RecommendedVehiclesController.cls-meta.xml
│   ├── CANVehicleController.cls
│   └── CANVehicleController.cls-meta.xml
├── lwc/
│   ├── recommendedVehicles/
│   ├── efVehicleOverview/
│   ├── efVehicleTimeline/
│   ├── efDigitalTwin/
│   ├── canVehicleView/
│   ├── efDigitalTwinTabFeatures/
│   ├── efDigitalTwinMap/
│   ├── chartJs/
│   ├── carConfigurator/
│   └── financeCalculator/
├── objects/
│   ├── Asset_Telematic__c/
│   ├── Asset_Inspection__c/
│   ├── Asset_Alert__c/
│   └── Vehicle/
│       └── fields/
│           ├── Vehicle_Picture_URL__c.field-meta.xml
│           ├── Vehicle_Picture_URL_2__c.field-meta.xml
│           ├── Vehicle_Picture_URL_3__c.field-meta.xml
│           └── Vehicle_Picture_URL_4__c.field-meta.xml
├── staticresources/
│   ├── canVehicleViews/
│   └── canVehicleViews.resource-meta.xml
└── experiences/
    └── Electra_Dealer_Central1/
        ├── config/ (5 files)
        ├── routes/ (60 files)
        ├── views/ (60 files)
        ├── themes/ (2 files)
        └── brandingSets/ (2 files)
```

**Total Files:** 200+ files across all components

---

## License & Usage

This package is designed for **educational, demonstration, and production use** in automotive industry Salesforce implementations. All components follow Salesforce best practices and are production-ready.

**Recommended For:**
- Automotive dealerships and OEMs
- Salesforce implementation partners
- Consultants delivering automotive solutions
- Developers learning Automotive Cloud
- Training and demo environments

**Customization Encouraged:**
- Modify themes and branding for your organization
- Extend components with additional features
- Adapt to specific business processes
- Add integrations with external systems

---

## Version Information

- **Package Version:** 1.0
- **Salesforce API Version:** 57.0+
- **Last Updated:** 2026
- **Compatible With:** Automotive Cloud, Experience Cloud, Financial Services Cloud

---

## Contact & Contributions

For questions, issues, or contributions related to this automotive package, refer to the detailed migration documentation files included in this repository.

**Get Started Today!** Deploy this package and have a production-ready automotive CRM up and running in hours, not months.
