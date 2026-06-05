# Electra Dealer Central - Experience Cloud Site Migration

## Overview
Successfully retrieved the complete **Electra Dealer Central** Experience Cloud site from the automotive org (omoda) with all customizations, pages, components, themes, and configurations.

This is a Partner Central/Dealer Portal site designed for automotive dealers to manage leads, opportunities, cases, orders, and vehicle information.

---

## Site Information

**Site Name:** Electra Dealer Central  
**Status:** Live  
**Network ID:** 0DBJ9000000HEDPOA4  
**Experience Bundle:** Electra_Dealer_Central1  
**Template Base:** Partner Central  
**Location:** `force-app/main/default/experiences/Electra_Dealer_Central1/`

---

## Retrieved Components Summary

### Site Structure
- **Total Files:** 129 files
- **Pages (Views):** 60 custom pages
- **Routes:** 60 routes
- **Configuration Files:** 5
- **Themes:** 2 (Automotive, Jepson)
- **Branding Sets:** 2 (Automotive, Jepson)

### Configuration Files
1. `electraDealerCentral.json` - Main site configuration
2. `mainAppPage.json` - Main app page layout
3. `loginAppPage.json` - Login page configuration
4. `languages.json` - Language settings
5. `nativeConfig.json` - Native mobile configuration

---

## Site Features & Pages

### Home Page Components
The home page includes:
- **Lead Inbox** - Recent leads with navigation to list view
- **Opportunities** - My opportunities (compact layout, 8 records)
- **Orders** - All activated orders (compact layout, 6 records)
- **Application Forms** - All application forms (compact layout, 6 records)
- **Cases** - My open cases (compact layout, 6 records)
- **Custom Component:** `sdo_Experience_RecordSnapshot` - Record snapshot with greeting

**Layout:** 2-column responsive grid (8/4 split)

---

### Standard Object Pages

#### 1. Lead Management
- **leadList.json** - Lead list view with filters
- **leadDetail.json** - Lead detail page
- **leadRelatedList.json** - Lead related lists

#### 2. Opportunity Management
- **quoteList.json** - Quote list view
- **quoteDetail.json** - Quote detail page
- **quoteRelatedList.json** - Quote related lists

#### 3. Case Management
- **caseList.json** - Case list view with filters
- **caseDetail.json** - Case detail page
- **caseRelatedList.json** - Case related lists

#### 4. Vehicle Management
- **vehicleList.json** - Vehicle list view
- **vehicleDetail.json** - Vehicle detail page
- **vehicleRelatedList.json** - Vehicle related lists

#### 5. Service Appointments
- **serviceAppointmentList.json** - Service appointment list
- **serviceAppointmentDetail.json** - Service appointment detail
- **serviceAppointmentRelatedList.json** - Related lists

#### 6. Booking Management
- **bookingList.json** - Booking list view
- **bookingDetail.json** - Booking detail page
- **bookingRelatedList.json** - Booking related lists

---

### Automotive-Specific Pages

#### 1. Car Configurator
- **carConfigurator.json** - Interactive vehicle configuration page
- Purpose: Allow dealers to configure vehicles for customers
- Custom LWC component integration

#### 2. Finance Calculator
- **financeCalculator.json** - Vehicle financing calculator
- Purpose: Calculate financing options for vehicle purchases
- Custom LWC component integration

#### 3. Lending Application Forms
- **automotiveLendingNewApplicationFormPage.json** - New lending application
- **automotiveLendingApplicationFormRedirectPage.json** - Application redirect
- **automotiveLendingProductDetailPage.json** - Lending product details
- **applicationFormProductList.json** - Application form products list
- **applicationFormProductDetail.json** - Application form product detail
- **applicationFormProductRelatedList.json** - Related lists

#### 4. Asset Lending
- **assetLendingAppFormProductPageForPartners.json** - Partner application form
- **assetLendingAppFormProductRedirectPage.json** - Redirect page
- **assetLendingProposalRehashing.json** - Proposal rehashing

#### 5. OEM Orders
- **oEMOrders.json** - OEM order management page

---

### Enablement & Training Pages

#### Learning Management
- **enablementProgramList.json** - Training program list
- **enablementProgramDetail.json** - Program detail page
- **enablementProgramRelatedList.json** - Program related lists
- **enablementMilestoneDetail.json** - Milestone tracking
- **enablementLessonExercise.json** - Lesson exercises
- **enablementVideoExercise.json** - Video training
- **enablementLinkExercise.json** - Link-based exercises

**Purpose:** Dealer training and enablement programs

---

### Content & Communication Pages

#### 1. Articles & News
- **articleDetail.json** - Knowledge article detail
- **newsDetail.json** - News article detail
- **topicDetail.json** - Topic detail page

#### 2. Chatter & Feeds
- **feedDetail.json** - Chatter feed detail

#### 3. Reports
- **reportList.json** - Report list view
- **reportDetail.json** - Report detail page
- **reportBuilder.json** - Report builder
- **reportRelatedList.json** - Report related lists

---

### Authentication Pages

- **login.json** - Custom login page
- **loginError.json** - Login error page
- **register.json** - Self-registration page
- **forgotPassword.json** - Password reset page
- **checkPassword.json** - Password verification

---

### Utility Pages

- **home.json** - Homepage
- **search.json** - Global search page
- **createRecord.json** - Generic record creation
- **recordList.json** - Generic record list
- **recordDetail.json** - Generic record detail
- **relatedRecordList.json** - Generic related lists
- **error.json** - Error page
- **serviceNotAvailable.json** - Service unavailable page
- **tooManyRequests.json** - Rate limit page
- **omniScript.json** - OmniScript integration page

---

## Themes & Branding

### 1. Automotive Theme
**File:** `themes/automotive.json`

**Purpose:** Custom automotive-branded theme for dealer portal

**Key Customizations:**
- Brand colors aligned with Electra brand
- Custom typography
- Automotive-specific styling
- Responsive design

### 2. Jepson Theme
**File:** `themes/jepson.json`

**Purpose:** Alternative theme option

### Branding Sets
Matching branding sets in `brandingSets/` directory:
- **automotive.json** - Automotive branding (colors, logos, fonts)
- **jepson.json** - Jepson branding alternative

---

## Site Configuration

### Trusted Sites for Scripts
The site is configured to trust external scripts from:

1. **Font Awesome**
   - URL: `https://kit.fontawesome.com`
   - Purpose: Icon library

2. **Flaticon**
   - URL: `https://cdn-icons-png.flaticon.com`
   - Purpose: Additional icons

3. **Tableau Public**
   - URL: `https://public.tableau.com`
   - Purpose: Embedded analytics/dashboards

4. **Amazon AWS**
   - URL: `https://*.amazonaws.com`
   - Purpose: CDN and cloud resources

### Site Settings
- **Guest Access:** Enabled
- **Self Registration:** Enabled (route configured)
- **Forgot Password:** Enabled (route configured)
- **Progressive Rendering:** Disabled
- **Filtered Components View:** Enabled
- **Preferred Domain:** None

---

## Custom Components Used

### Identified Custom LWC Components
Based on page configurations, the following custom components are used:

1. **sdo_Experience_RecordSnapshot**
   - Location: Home page
   - Purpose: Display record snapshot with greeting
   - Configuration: Displays leads and tasks

2. **carConfigurator**
   - Location: Car Configurator page
   - Purpose: Interactive vehicle configuration
   - Integration: Custom LWC

3. **financeCalculator**
   - Location: Finance Calculator page
   - Purpose: Vehicle financing calculations
   - Integration: Custom LWC

### Standard Force Community Components
- `forceCommunity:leadInbox` - Lead management
- `forceCommunity:objectHome` - Object list views
- `forceCommunity:section` - Layout sections
- `siteforce:dynamicLayout` - Dynamic page layouts

---

## Routes Configuration

The site includes 60 custom routes mapping URLs to pages:

**Example Routes:**
- `/` → Home page
- `/leads` → Lead list
- `/lead/{recordId}` → Lead detail
- `/cases` → Case list
- `/case/{recordId}` → Case detail
- `/vehicles` → Vehicle list
- `/vehicle/{recordId}` → Vehicle detail
- `/car-configurator` → Car configurator
- `/finance-calculator` → Finance calculator
- `/oem-orders` → OEM orders
- `/enablement` → Training programs
- And many more...

---

## Deployment Steps

### 1. Review Experience Bundle Structure
```bash
# View the structure
ls -la ./force-app/main/default/experiences/Electra_Dealer_Central1/
```

### 2. Deploy Experience Bundle
```bash
# Deploy the complete experience
sf project deploy start \
  -m "ExperienceBundle:Electra_Dealer_Central1" \
  -o [target-org-alias]
```

**Note:** Experience Bundle deployment includes:
- All pages (views)
- All routes
- Themes and branding
- Configuration files
- Site settings

### 3. Deploy Dependencies

Before deploying the Experience Bundle, ensure these are deployed first:

#### Required Custom LWC Components
```bash
sf project deploy start \
  -m "LightningComponentBundle:carConfigurator,LightningComponentBundle:financeCalculator,LightningComponentBundle:sdo_Experience_RecordSnapshot" \
  -o [target-org-alias]
```

#### Required Custom Objects
The site relies on standard Salesforce objects plus:
- Lead
- Opportunity
- Case
- Order
- Vehicle (standard Automotive object)
- ServiceAppointment
- ApplicationForm (Financial Services Cloud)
- Booking

### 4. Activate the Experience
After deployment:

1. **Navigate to:** Setup → All Sites → Electra Dealer Central
2. **Click:** Activate or Administration
3. **Configure:**
   - Set custom domain (if needed)
   - Configure guest user profile permissions
   - Set member user permissions
   - Configure email templates
   - Set up roles and sharing rules

### 5. Configure Permissions

#### Guest User Profile
Grant guest users access to:
- Public pages (login, register, forgot password)
- Publicly accessible content

#### Member Profile (Partner User)
Grant authenticated dealer users access to:
- Lead, Opportunity, Case objects (read/edit)
- Vehicle object (read)
- Order object (read/create)
- ServiceAppointment (read/create)
- ApplicationForm (read/create)
- Booking (read/create)
- Reports and dashboards

### 6. Configure Sharing Rules
Set up sharing rules for dealer/partner visibility:
- Account sharing based on partner account hierarchy
- Opportunity sharing based on account
- Case sharing based on account
- Lead assignment rules

### 7. Configure External URLs
Set up custom domain:
1. Setup → Custom URLs
2. Add domain for Electra Dealer Central
3. Configure SSL certificate
4. Update DNS records

---

## Page-by-Page Component Mapping

### High-Level Components by Page Type

| Page Type | Key Components | Functionality |
|-----------|----------------|---------------|
| Home | leadInbox, objectHome, sdo_Experience_RecordSnapshot | Dashboard with key records |
| List Views | objectHome, search, filters | Filterable object lists |
| Detail Pages | recordDetail, relatedLists, actions | Full record detail with related data |
| Forms | recordEdit, validation | Create/edit records |
| Configurator | carConfigurator (custom) | Interactive vehicle config |
| Calculator | financeCalculator (custom) | Finance calculations |
| Training | enablement components | Learning management |
| Content | article, news, feed | Knowledge & updates |

---

## Custom Component Requirements

### Components That Need to Be Retrieved/Created

1. **sdo_Experience_RecordSnapshot**
   - May be part of SDO (Sales Demo Org) package
   - Check if already in your org
   - Or retrieve from source org

2. **carConfigurator**
   - Already retrieved in previous migration
   - Location: `force-app/main/default/lwc/carConfigurator/`

3. **financeCalculator**
   - Already retrieved in previous migration
   - Location: `force-app/main/default/lwc/financeCalculator/`

---

## Known Customizations

### 1. Color Scheme
The Automotive theme uses custom brand colors:
- Review `themes/automotive.json` for color values
- Update branding to match your organization

### 2. Trusted Sites
External scripts are configured for:
- Font Awesome icons
- Flaticon images
- Tableau dashboards
- AWS resources

### 3. Homepage Layout
- 2-column responsive design
- Left column (8/12): Leads, Orders, Application Forms
- Right column (4/12): Opportunities, Cases, Record Snapshot

### 4. Navigation
- Top navigation bar with key sections
- Search functionality
- User profile dropdown
- Custom automotive branding

---

## Testing Recommendations

### Pre-Deployment Testing
1. Review all page JSON files for custom component references
2. Verify all custom components exist in target org
3. Check object permissions for guest and member profiles
4. Review sharing rules configuration

### Post-Deployment Testing
1. **Guest User Testing:**
   - Access login page
   - Test self-registration
   - Test forgot password
   - Verify public page access

2. **Authenticated User Testing:**
   - Login as partner user
   - Navigate to all main pages (Home, Leads, Opportunities, Cases)
   - Test car configurator
   - Test finance calculator
   - Create/edit records
   - Verify related lists display correctly

3. **Mobile Testing:**
   - Test on mobile devices
   - Verify responsive design
   - Test mobile app (if configured)

4. **Integration Testing:**
   - Verify OEM orders integration
   - Test lending application workflow
   - Verify external scripts load (Font Awesome, Tableau)

---

## Maintenance & Customization

### Adding New Pages
1. Use Experience Builder in target org
2. Create new page based on existing templates
3. Add to navigation
4. Set permissions

### Modifying Existing Pages
1. Open Experience Builder
2. Edit page in WYSIWYG editor
3. Add/remove/configure components
4. Publish changes

### Updating Themes
1. Navigate to: Experience Builder → Settings → Theme
2. Modify colors, fonts, spacing
3. Preview changes
4. Publish

### Managing Users
1. Setup → Partner Users
2. Assign appropriate profiles
3. Configure role hierarchy
4. Set up account relationships

---

## Architecture Diagram

```
Electra Dealer Central Experience Cloud Site
│
├── Guest Access (Unauthenticated)
│   ├── Login
│   ├── Self Registration
│   ├── Forgot Password
│   └── Public Content
│
├── Authenticated Access (Partner Users)
│   ├── Dashboard/Home
│   │   ├── Lead Inbox
│   │   ├── My Opportunities
│   │   ├── My Cases
│   │   ├── Orders
│   │   └── Application Forms
│   │
│   ├── Sales Management
│   │   ├── Leads
│   │   ├── Opportunities
│   │   ├── Quotes
│   │   └── Orders
│   │
│   ├── Automotive Features
│   │   ├── Vehicle Catalog
│   │   ├── Car Configurator
│   │   ├── Finance Calculator
│   │   └── OEM Orders
│   │
│   ├── Lending & Finance
│   │   ├── Application Forms
│   │   ├── Lending Products
│   │   └── Proposals
│   │
│   ├── Service Management
│   │   ├── Cases
│   │   ├── Service Appointments
│   │   └── Bookings
│   │
│   ├── Training & Enablement
│   │   ├── Programs
│   │   ├── Milestones
│   │   └── Exercises
│   │
│   └── Content & Reports
│       ├── Knowledge Articles
│       ├── News
│       ├── Chatter Feeds
│       └── Reports & Dashboards
│
└── Integration Points
    ├── OmniScript
    ├── External Scripts (Font Awesome, Tableau)
    └── Custom Components
```

---

## Files Included

### Experience Bundle Structure
```
force-app/main/default/experiences/Electra_Dealer_Central1/
├── config/
│   ├── electraDealerCentral.json (site settings)
│   ├── mainAppPage.json (main app layout)
│   ├── loginAppPage.json (login layout)
│   ├── languages.json (language config)
│   └── nativeConfig.json (mobile config)
├── routes/ (60 route files)
│   ├── Home.route
│   ├── leadList.route
│   ├── leadDetail.route
│   ├── vehicleList.route
│   └── ... (56 more)
├── views/ (60 view JSON files)
│   ├── home.json
│   ├── leadList.json
│   ├── leadDetail.json
│   ├── carConfigurator.json
│   ├── financeCalculator.json
│   └── ... (55 more)
├── themes/
│   ├── automotive.json
│   └── jepson.json
└── brandingSets/
    ├── automotive.json
    └── jepson.json
```

**Total:** 129 files in complete Experience Bundle

---

## Related Components Already Retrieved

From previous migrations, the following related components are already available:

1. **carConfigurator** LWC
2. **financeCalculator** LWC
3. **efDigitalTwin** suite (vehicle visualization)
4. **efVehicleOverview** (vehicle details)
5. **efVehicleTimeline** (vehicle telemetry)
6. **canVehicleView** (interactive vehicle diagram)

These components integrate seamlessly with the Electra Dealer Central site.

---

## Next Steps

1. ✅ Experience Bundle retrieved and ready for deployment
2. ⬜ Review custom component dependencies
3. ⬜ Deploy custom components (carConfigurator, financeCalculator, etc.)
4. ⬜ Deploy Experience Bundle
5. ⬜ Activate site in target org
6. ⬜ Configure guest user profile permissions
7. ⬜ Configure member user profile permissions
8. ⬜ Set up sharing rules
9. ⬜ Configure custom domain (optional)
10. ⬜ Test all pages and functionality
11. ⬜ Update branding/themes as needed
12. ⬜ Train dealer users

---

## Known Limitations & Notes

1. **Custom Components:** Some custom components (like `sdo_Experience_RecordSnapshot`) may need to be retrieved separately or recreated
2. **External Scripts:** Requires network access to CDNs (Font Awesome, Flaticon, Tableau, AWS)
3. **Object Dependencies:** Requires Financial Services Cloud objects (ApplicationForm) if using lending features
4. **Branding:** Theme colors and logos should be updated to match your organization
5. **Domain:** Custom domain configuration required for production use
6. **Permissions:** Careful permission configuration needed for guest vs. authenticated users
7. **Data:** Site structure is deployed, but data (accounts, vehicles, etc.) must exist in target org

---

## Support & Resources

**Experience Cloud Documentation:**
- [Experience Cloud Basics](https://help.salesforce.com/s/articleView?id=sf.networks_resources.htm)
- [Experience Builder](https://help.salesforce.com/s/articleView?id=sf.community_designer_overview.htm)
- [ExperienceBundle Metadata](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_experiencebundle.htm)

**Automotive Cloud Resources:**
- [Automotive Cloud Documentation](https://help.salesforce.com/s/articleView?id=sf.automotive_cloud.htm)
- Vehicle object configuration
- Dealer management best practices

**Financial Services Cloud:**
- [Application Forms](https://help.salesforce.com/s/articleView?id=sf.fsc_admin_lending.htm)
- Lending processes
