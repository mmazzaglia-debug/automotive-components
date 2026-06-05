# AutoPack - Managed Package Creation Guide

## Overview

This guide provides step-by-step instructions for creating the **AutoPack** managed package containing all automotive industry components, data structures, and the Electra Dealer Central Experience Cloud site.

---

## Package Information

**Package Name:** AutoPack  
**Version:** 1.0.0  
**Type:** Managed Package  
**Description:** Complete Salesforce solution for the automotive industry including vehicle management, dealer portals, digital twin components, and connected vehicle experiences.

---

## Prerequisites

### 1. Dev Hub Org Requirements
- Dev Hub enabled
- Namespace registered for managed packages
- Salesforce CLI installed and authenticated
- Automotive Cloud license (for Vehicle standard object)
- Experience Cloud license
- Financial Services Cloud license (optional, for lending features)

### 2. Required Salesforce CLI Version
```bash
# Install or update Salesforce CLI
npm install -g @salesforce/cli
# Verify version (should be latest)
sf --version
```

### 3. Authenticate to Dev Hub
```bash
# Authenticate to your Dev Hub org
sf org login web --set-default-dev-hub --alias DevHub
```

---

## Package Contents

### Lightning Web Components (10)
1. ✅ recommendedVehicles
2. ✅ efVehicleOverview
3. ✅ efVehicleTimeline
4. ✅ efDigitalTwin
5. ✅ canVehicleView
6. ✅ efDigitalTwinTabFeatures
7. ✅ efDigitalTwinMap
8. ✅ chartJs
9. ✅ carConfigurator
10. ✅ financeCalculator

### Apex Classes (2)
1. ✅ RecommendedVehiclesController
2. ✅ CANVehicleController

### Custom Objects (4)
1. ✅ Asset_Telematic__c (with CDC enabled)
2. ✅ Asset_Inspection__c (with CDC enabled)
3. ✅ Asset_Alert__c (with CDC enabled)
4. ✅ Vehicle (standard object with 4 custom fields)

### Experience Cloud Site (1)
1. ✅ Electra_Dealer_Central1 (129 files)
   - 60 pages/views
   - 60 routes
   - 2 themes
   - 2 branding sets
   - 5 configuration files

### Static Resources (1)
1. ✅ canVehicleViews (vehicle top-view images)

### Metadata Components
- Custom Fields (4 on Vehicle object)
- Permission Sets (to be created)
- Profiles (guest user and member profiles for Experience Cloud)

**Total Components:** 200+ files

---

## Step-by-Step Package Creation

### Step 1: Register a Namespace (If Not Already Registered)

1. Log into your Dev Hub org
2. Navigate to: **Setup → Packages → Package Manager**
3. Click **Edit** next to your organization
4. Enter a unique namespace (e.g., `autopack`, `automotivepack`, or your company name)
5. Check availability and register
6. **Important:** Once registered, the namespace cannot be changed

**Recommended Namespace Options:**
- `autopack`
- `automotivepkg`
- `autocloud`
- `[yourcompany]auto`

### Step 2: Update sfdx-project.json with Namespace

The `sfdx-project.json` file has been configured with the AutoPack package structure. You need to add your namespace:

```json
{
  "packageDirectories": [
    {
      "versionName": "AutoPack v1.0",
      "versionNumber": "1.0.0.NEXT",
      "path": "force-app",
      "default": true,
      "package": "AutoPack",
      "versionDescription": "Automotive Industry Package - Complete solution for vehicle management, dealer portals, and connected vehicle experiences"
    }
  ],
  "name": "automotive-ido",
  "namespace": "YOUR_NAMESPACE_HERE",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "66.0",
  "packageAliases": {}
}
```

Replace `YOUR_NAMESPACE_HERE` with your registered namespace.

### Step 3: Create the Managed Package

Run the following command to create the managed package:

```bash
# Create the package
sf package create \
  --name "AutoPack" \
  --description "Automotive Industry Package - Complete solution for vehicle management, dealer portals, and connected vehicle experiences" \
  --package-type Managed \
  --path force-app \
  --target-dev-hub DevHub
```

**Expected Output:**
```
Successfully created a package. 0Ho... [Package ID]
Name: AutoPack
Namespace: [your-namespace]
Package Type: Managed
```

**Important:** Note the Package ID (starts with `0Ho`) - you'll need this for versioning.

### Step 4: Update Package Aliases

After package creation, update the `packageAliases` section in `sfdx-project.json`:

```json
"packageAliases": {
  "AutoPack": "0HoXXXXXXXXXXXXX"
}
```

Replace with your actual Package ID from Step 3.

### Step 5: Create Permission Sets

Before creating a package version, create permission sets for the components:

```bash
# You may need to create permission sets manually in a scratch org first
# Then retrieve them to include in the package
```

**Recommended Permission Sets:**
1. **AutoPack_Admin** - Full access to all components and objects
2. **AutoPack_Dealer_User** - Access for dealer portal users
3. **AutoPack_Service_Technician** - Access for service operations

### Step 6: Validate Package Contents

Ensure all components are in the correct directory structure:

```bash
# List all components that will be included
find force-app/main/default -type f -name "*.xml" | wc -l
# Should show 200+ files

# Verify key directories exist
ls -la force-app/main/default/
# Should show: classes, lwc, objects, experiences, staticresources
```

### Step 7: Create Package Version

Create the first version of the managed package:

```bash
sf package version create \
  --package "AutoPack" \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub DevHub \
  --code-coverage \
  --version-name "AutoPack v1.0" \
  --version-number 1.0.0.NEXT
```

**Options Explained:**
- `--installation-key-bypass` - No password required for installation (recommended for ease of use)
- `--wait 30` - Wait up to 30 minutes for package creation
- `--code-coverage` - Run Apex tests and calculate code coverage
- `--version-name` - Human-readable version name
- `--version-number` - Semantic version number

**Expected Output:**
```
Waiting for package version creation to complete....
Successfully created package version: 04tXXXXXXXXXXXXX
Package Version Id: 04tXXXXXXXXXXXXX
Subscriber Package Version Id: 04tXXXXXXXXXXXXX
Status: Success
```

**Important:** Note the Subscriber Package Version ID (starts with `04t`) - this is what users will install.

### Step 8: Promote Package Version to Released

Once tested, promote the package version:

```bash
sf package version promote \
  --package "AutoPack@1.0.0-1" \
  --target-dev-hub DevHub
```

Or use the version ID:

```bash
sf package version promote \
  --package "04tXXXXXXXXXXXXX" \
  --target-dev-hub DevHub
```

**Warning:** Once promoted, a managed package version **cannot be unpromoted or deleted**. Test thoroughly before promoting.

---

## Testing the Package

### Step 1: Install in a Test Org

```bash
# Create a scratch org for testing
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias AutoPackTest \
  --set-default \
  --duration-days 30

# Install the package version
sf package install \
  --package "04tXXXXXXXXXXXXX" \
  --target-org AutoPackTest \
  --wait 30 \
  --publish-wait 30
```

### Step 2: Test Key Functionality

**Component Testing:**
1. Add `recommendedVehicles` to Lead page layout - verify vehicle recommendations appear
2. Add `efDigitalTwin` to Asset page layout - verify interactive vehicle diagram loads
3. Test real-time updates - click "Lock Doors" and verify immediate UI update
4. Test `efVehicleTimeline` - verify telemetry events display

**Experience Cloud Testing:**
1. Navigate to All Sites in Setup
2. Activate Electra Dealer Central site
3. Configure guest user and member profiles
4. Test login, navigation, and all pages
5. Test car configurator and finance calculator

**Data Testing:**
1. Create sample Vehicle records with Image URLs
2. Create Asset records with child assets (parts)
3. Create Asset_Telematic__c records
4. Verify Change Data Capture events publish correctly

### Step 3: Verify Apex Test Coverage

Managed packages require minimum 75% code coverage:

```bash
# Run all tests in the package
sf apex run test \
  --code-coverage \
  --result-format human \
  --target-org AutoPackTest \
  --wait 30
```

**If coverage is insufficient:**
- Create test classes for `RecommendedVehiclesController`
- Create test classes for `CANVehicleController`
- Include test classes in the package

---

## Package Installation Guide for End Users

### Installation URL Format

```
https://login.salesforce.com/packaging/installPackage.apexp?p0=04tXXXXXXXXXXXXX
```

Replace `04tXXXXXXXXXXXXX` with your Subscriber Package Version ID.

### Installation Steps for Customers

1. **Prerequisites Check:**
   - Automotive Cloud license required
   - Experience Cloud license required (for dealer portal)
   - System Administrator access

2. **Install Package:**
   - Use installation URL provided
   - Select "Install for All Users"
   - Approve third-party access (Font Awesome, Tableau, AWS)
   - Wait 10-15 minutes for installation

3. **Post-Installation Configuration:**
   - Enable Change Data Capture for custom objects
   - Assign AutoPack permission sets to users
   - Activate Electra Dealer Central site
   - Configure sharing rules
   - Populate sample data

4. **Component Configuration:**
   - Add components to Lightning page layouts
   - Configure component properties
   - Test real-time functionality

---

## Package Upgrade Strategy

### Creating Patch Versions (Bug Fixes)

```bash
sf package version create \
  --package "AutoPack" \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub DevHub \
  --version-name "AutoPack v1.0.1 (Patch)" \
  --version-number 1.0.1.NEXT
```

### Creating Minor Versions (New Features)

```bash
sf package version create \
  --package "AutoPack" \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub DevHub \
  --version-name "AutoPack v1.1" \
  --version-number 1.1.0.NEXT
```

### Creating Major Versions (Breaking Changes)

```bash
sf package version create \
  --package "AutoPack" \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub DevHub \
  --version-name "AutoPack v2.0" \
  --version-number 2.0.0.NEXT
```

---

## Package Dependencies

### Required Salesforce Products
- **Salesforce Platform** (base)
- **Automotive Cloud** (for Vehicle standard object)
- **Experience Cloud** (Partner Central or similar)
- **Change Data Capture** (included with Platform)
- **Platform Events** (included with Platform)

### Optional Dependencies
- **Financial Services Cloud** (for ApplicationForm object in dealer portal)

### External Dependencies
The package includes trusted sites for external scripts:
- Font Awesome (https://kit.fontawesome.com)
- Flaticon (https://cdn-icons-png.flaticon.com)
- Tableau Public (https://public.tableau.com)
- Amazon AWS (https://*.amazonaws.com)

These are configured in the Experience Cloud site settings.

---

## Managed Package Best Practices

### Namespace Considerations
- All custom components are automatically prefixed with your namespace
- Example: `Asset_Telematic__c` becomes `yournamespace__Asset_Telematic__c`
- LWC components: `c-recommended-vehicles` becomes `c-yournamespace-recommended-vehicles`
- This ensures no conflicts with subscriber org components

### API Version Management
- Package uses API version 66.0
- Components are forward-compatible with newer API versions
- Test on multiple Salesforce release versions (Spring, Summer, Winter)

### Upgrade Safe Development
- Never delete fields or objects in managed packages
- Mark deprecated components with `@deprecated` annotation
- Provide migration guides for breaking changes
- Maintain backward compatibility where possible

### Security Review (for AppExchange)
If planning to list on AppExchange:
1. Submit for Salesforce Security Review
2. Address any vulnerabilities found
3. Implement CRUD/FLS checks in Apex
4. Use `WITH SECURITY_ENFORCED` in SOQL queries
5. Sanitize user inputs to prevent XSS/injection attacks

---

## Troubleshooting

### Package Creation Fails

**Error: "Namespace not found"**
- Solution: Register namespace in Dev Hub org first

**Error: "API version too old"**
- Solution: Update `sourceApiVersion` in sfdx-project.json to latest version

**Error: "Invalid dependency"**
- Solution: Ensure all referenced components exist in the package directory

### Package Version Creation Fails

**Error: "Code coverage insufficient"**
- Solution: Add test classes for Apex controllers (minimum 75% coverage required)
- Create: `RecommendedVehiclesControllerTest.cls`
- Create: `CANVehicleControllerTest.cls`

**Error: "Component not found"**
- Solution: Verify all components are in `force-app/main/default/` directory
- Run: `sf project deploy start --dry-run` to validate metadata

**Error: "Experience Bundle validation failed"**
- Solution: Ensure Experience Cloud is enabled in Dev Hub
- Verify all custom components referenced in Experience pages are included

### Installation Fails in Target Org

**Error: "Vehicle object not available"**
- Solution: Target org must have Automotive Cloud license

**Error: "Experience Cloud not enabled"**
- Solution: Target org must have Experience Cloud license for dealer portal

**Error: "Change Data Capture limit exceeded"**
- Solution: Target org can only track limited number of entities with CDC
- Adjust CDC selections if needed

---

## Package Versioning Strategy

### Version Number Format
`Major.Minor.Patch.Build`

**Example:** 1.0.0.NEXT → 1.0.0-1 (first build)

### When to Increment

**Major Version (1.x.x → 2.x.x):**
- Breaking changes to existing functionality
- Removal of deprecated features
- Significant architectural changes

**Minor Version (x.1.x → x.2.x):**
- New features added
- New components added
- Enhancements to existing features

**Patch Version (x.x.1 → x.x.2):**
- Bug fixes
- Security patches
- Performance improvements

---

## AppExchange Listing (Optional)

If you want to list AutoPack on Salesforce AppExchange:

### Step 1: Prepare Listing Materials
- Package description (use AutoPack_Info.md content)
- Screenshots of components (digital twin, dealer portal, etc.)
- Demo video showing key features
- Installation guide
- Support contact information

### Step 2: Submit Security Review
- Follow Salesforce Security Review process
- Address any findings
- Obtain security review approval

### Step 3: Create AppExchange Listing
1. Log into AppExchange Partner Portal
2. Create new listing
3. Upload package version
4. Add descriptions, images, videos
5. Set pricing (free or paid)
6. Submit for AppExchange review

### Step 4: Promote Listing
- Share installation URL with potential customers
- Create marketing materials
- Provide customer support
- Gather reviews and ratings

---

## Support & Maintenance

### Customer Support Channels
- Documentation: AutoPack_Info.md (included in package)
- Migration guides: RECOMMENDED_VEHICLES_MIGRATION.md, EF_VEHICLE_COMPONENTS_MIGRATION.md, ELECTRA_DEALER_CENTRAL_MIGRATION.md
- Email support: [Your support email]
- Community forum: [Your community URL]

### Package Updates
- Release patch versions for critical bugs
- Release minor versions quarterly with new features
- Release major versions annually if needed
- Notify customers before breaking changes

### Monitoring & Analytics
- Track package installations
- Monitor error logs
- Collect customer feedback
- Plan feature roadmap based on usage patterns

---

## Quick Command Reference

```bash
# Authenticate to Dev Hub
sf org login web --set-default-dev-hub --alias DevHub

# Create managed package
sf package create --name "AutoPack" --description "Automotive Industry Package" --package-type Managed --path force-app --target-dev-hub DevHub

# Create package version
sf package version create --package "AutoPack" --installation-key-bypass --wait 30 --target-dev-hub DevHub --code-coverage --version-name "AutoPack v1.0" --version-number 1.0.0.NEXT

# Promote package version
sf package version promote --package "04tXXXXXXXXXXXXX" --target-dev-hub DevHub

# Install in test org
sf package install --package "04tXXXXXXXXXXXXX" --target-org TestOrg --wait 30

# List package versions
sf package version list --packages "AutoPack" --target-dev-hub DevHub

# Get installation URL
echo "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tXXXXXXXXXXXXX"
```

---

## Next Steps

1. ✅ Register namespace in Dev Hub org
2. ✅ Update sfdx-project.json with namespace
3. ✅ Create Apex test classes (if not already created)
4. ✅ Run: `sf package create` command
5. ✅ Run: `sf package version create` command
6. ✅ Test package in scratch org
7. ✅ Promote package version
8. ✅ Generate installation URL
9. ✅ Share with customers or list on AppExchange

---

## Resources

- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/)
- [Package Development Model](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_dev2gp.htm)
- [Managed Package Guide](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/)
- [AppExchange Partner Portal](https://partners.salesforce.com/)
- [Security Review Requirements](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review.htm)

---

**AutoPack - Accelerating Automotive CRM Implementations**
