import { LightningElement, wire, api, track } from 'lwc';
import getVehicle from '@salesforce/apex/CANVehicleController.getAsset';
import getVehicleParts from '@salesforce/apex/CANVehicleController.getVehiclePartsFromAsset';
import getTelematics from '@salesforce/apex/CANVehicleController.getTelematics';
import insertTelematics from '@salesforce/apex/CANVehicleController.insertTelematics';
import insertAssetInspection from '@salesforce/apex/CANVehicleController.insertAssetInspection';
import getAssetIdByWorkOrderId from '@salesforce/apex/CANVehicleController.getAssetIdByWorkOrderId';
import getPriceBookEntry from '@salesforce/apex/CANVehicleController.getPriceBookEntry';
import getPriceBookList from '@salesforce/apex/CANVehicleController.getPriceBookList';
import saveOpty from '@salesforce/apex/CANVehicleController.saveOpty';
import STATIC_FILES from "@salesforce/resourceUrl/canVehicleViews";
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from "lightning/uiRecordApi";

import { RefreshEvent } from 'lightning/refresh';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } 
from 'lightning/empApi';


export default class CanVehicleWalkAround extends NavigationMixin(LightningElement) {
    @api objectApiName
    @api recordId
    @api assetId
    @api vehicle
    @api battery
    @api parts
    @api activePart
    @api isAssetClicked
    @api vehicleImageBackground = STATIC_FILES
    @api assetTelematics
    @api vehicleTelematics
    @api batteryTelematics
    
    // Charge
    @api chargeMeasureName
    @api currentCharge

    // Power
    @api powerMeasureName
    @api switchPower  
    
    // Doors
    @api doorsMeasureName
    @api lockState

    // For Charts
    @api chartPoints 
    @api hasChartPoints
    @api chartPowerValues
    @api chartPowerLabels

    // Walk Around
    @api isRotationSliderOpen;
    @api rotation;
    @api isInspectionOver;
    @api isInspectionSliderOpen;
    @api measureValue
    @api toggleChecked
    
    // Opportunity
    @api hasOptyLines
    @api opportunityLines
    @api isOptyCreated
    @api createOptyLabel
    @api createOptyIcon
    @api opportunityName
    @api opportunityStage

    // Pricebook
    @api isPricebookSliderOpen
    @api pricebookId
    @api pricebookList
    @api closeDate

    @api stateValue

    // Default values
    DEFAULT_OPPORTUNITY_NAME = 'Inspection Opportunity'
    DEFAULT_STAGE_NAME = 'Qualification'
    DEFAULT_CLOSE_DATE = '2023-09-13'

    error
				
    isDebug = false

    // push topic
    channelName = '/topic/NewTelematicCreated';

    get stateOptions() {
        return [
            { label: 'Dead', value: '0' },
            { label: 'Bad', value: '1' },
            { label: 'Med', value: '2' },
            { label: 'Good', value: '3' },
            { label: 'New', value: '4' },
        ];
    }

    connectedCallback() {

        console.log('🇫🇷 Vehicle Walk Around Component - initialisation')
        console.log('🇫🇷 Delivered with love by the French SE Automotive Team 🇫🇷 Author : Charly ANSEL')

        // Active Part init
        this.resetActivePart();

        // Battery init
        this.battery = {}

        // Opportunity Lines init
        this.opportunityLines = []

        // Display init
        this.switchPower = false
        this.isRotationSliderOpen = true
        this.isInspectionSliderOpen = false
        this.createOptyIcon = 'utility:add'
        this.createOptyLabel = 'Create'

        // Checking Object type of the displayed Page
        // Check if assetId has been passed by a parent LWC
        if (this.assetId) {
            this.loadVehicle(this.assetId)

        } else {
            
            // Checking Object type of the displayed Page
            if (this.objectApiName) {

                if (this.objectApiName === 'Asset') {
                    this.assetId = this.recordId
                    this.loadVehicle(this.assetId)

                } else if (this.objectApiName === 'Vehicle') {
                    // Get Asset on Vehicle
                    getAssetIdByVehicleId({ vehicleId: this.recordId})
                    .then(result => {
                        this.assetId = result.Id
                        this.loadVehicle(this.assetId)
                    })
                    .catch(error => {
                        console.log('Error loading Asset from Vehicle')
                        console.log(error)
                        //console.log(error.body.message)
                    })
                    
                } else if (this.objectApiName === 'WorkOrder') {
                    // Get Asset on Work Order
                    getAssetIdByWorkOrderId({ workOrderId: this.recordId})
                    .then(result => {
                        this.assetId = result.AssetId
                        this.loadVehicle(this.assetId)
                    })
                    .catch(error => {
                        console.log('Error loading Asset from Work Order')
                        console.log(error)
                        //console.log(error.body.message)
                    })

                }  else if (this.objectApiName === 'Case') {
                    // Get Asset on Case
                    getAssetIdByCaseId({ caseId: this.recordId})
                    .then(result => {
                        this.assetId = result.Id
                        this.loadVehicle(this.assetId)
                    })
                    .catch(error => {
                        console.log('Error loading Asset from Case')
                        console.log(error)
                        //console.log(error.body.message)
                    })

                } else {
                    console.log('🇫🇷 no object detected :-(')
                }
            }
        }

        this.loadPricebooks()

        // Setting default opportunities values
        // Opportunity Name
        if (this.opportunityName == undefined || this.opportunityName == '') this.opportunityName = this.DEFAULT_OPPORTUNITY_NAME
        // Opportunity Stage
        if (this.opportunityStage == undefined || this.opportunityStage == '') this.opportunityStage = this.DEFAULT_STAGE_NAME
        // Close Date = Today + 30 days
        var defaultDate = new Date(new Date().getTime()+(30*24*60*60*1000)); //added 30 days to todays date
        this.closeDate = defaultDate.toISOString();      

    }

    /**
     * Loading Vehicle from assetId
     * @param {string} assetId 
     */
    loadVehicle(assetId) {
        console.log('🇫🇷 Loading vehicle ...')
        getVehicle({ assetId: assetId})
        .then(result => {
            this.vehicle = result
            this.vehicleImageBackground = STATIC_FILES + '/' + this.vehicle.Product2.Top_View_Image_URL__c
            console.log('🇫🇷 ... vehicle loaded !')

            // Loading Vehicle Parts
            this.loadParts(assetId)

            // Loading Telematics could be added here
            
        })
        .catch(error => {
            console.log('... error loading vehicle')
            console.log(error)
            //console.log(error.body.message)
            console.log('record Id : ' + this.recordId + ' / asset Id : ' + this.assetId)
        })
    }

    /**
     * Loading Vehicle Parts from Vehicle assetId
     * @param {string} assetId 
     */
    loadParts(assetId) {
        console.log('🇫🇷 Loading Vehicle Parts...')
        getVehicleParts({ assetId: assetId})
        .then(result => {
            this.parts = []
            // Getting only parts for which the Walk Around Order has been set
            result.forEach(asset => {
                if (asset.Walk_Around_Order__c > 0) {
                    this.parts.push(asset)
                }
            })
            console.log(this.parts)
            console.log('🇫🇷 ...', this.parts.length,'vehicle parts loaded')

            this.parts.forEach(part => {

                // Initializing parts
                part.isChecked = false
                part.isActive = false
                part.inspectionStatus = -1

                // Getting battery in order to display current charge
                if (part.Name.toLowerCase().includes('battery')) {
                    console.log('🇫🇷 battery found in vehicle parts')
                    this.battery = part
                    this.initializeBattery()
                }
            });
        })
        .catch(error => {
            console.log('... error loading vehicle parts')
            console.log(error)
            //console.log(error.body.message)
        })
    }

    /**
     * Loading all pricebooks to populate a dropdown list
     * when adding a product to opportunity
     */
    loadPricebooks() {
        getPriceBookList()
        .then( result => {
            this.pricebookList = result
        })
        .catch(error => {
            console.log('Error getting pricebooks')
            this.error = error;
        });
    }

    /**
     * Initialize battery with Telematics
     */
    initializeBattery() {

        getTelematics({ assetId: this.battery.Id })
        .then(result => {
            this.batteryTelematics = []
            this.batteryTelematics = result
            var measureValues = []
            var measureTimes = []
            this.batteryTelematics.forEach(telematic => {
                measureValues.push(telematic.Measure_Value__c)
                measureTimes.push(new Date(telematic.Measure_Time__c))
            })
            this.currentCharge = result.length > 0 ? (result[result.length - 1].Measure_Value__c) : 0;
            
        })
        .catch( error => {
            console.log(error)
        })

    }

    /**
     * Reset Active Part object and properties (Id, Name, SerialNumber, Product and Image)
     */
    resetActivePart() {
        this.activePart = {}
        this.activePart.Id = ''
        this.activePart.Name = ''
        this.activePart.SerialNumber = ''
        this.activePart.Product2 = {}
        this.activePart.Product2.Product_Image_URL__c = ''
    }

    /**
     * When a part is clicked, gets clicked asset and open slider panel
     * @param {Event} event 
     */
    handlePartClick(event) {

        let clickedAssetId = event.currentTarget.dataset.partId
        let clickedAsset = this.getAssetById(clickedAssetId)

        if (clickedAsset !== undefined) {

            // If clicked asset is active asset, closing slider
            if (clickedAsset.Id == this.activePart.Id) {
                this.activePart.isActive = false
                this.isAssetClicked = false
                this.resetActivePart()

            } else {
                this.changeActivePart(clickedAsset)
            }
            
        } else {
            // Closing slider
            this.isAssetClicked = false
        }

    }

    /**
     * Changing the current active part. 
     * Implies highlighting the active part, getting telematics chart
     * @param {*} asset 
     */
    changeActivePart(asset) {

        this.activePart = asset

        // Setting isActive flag to apply CSS on active part
        this.parts.forEach(part => {
            part.isActive = (part.Id == this.activePart.Id)
        })
        
        // Get clicked asset telematics
        getTelematics({ assetId: this.activePart.Id })
        .then(result => {

            // Set Telematics
            this.activePart.assetTelematics = []
            this.activePart.assetTelematics = result
            this.assetTelematics = []
            this.assetTelematics = result
            
            // Set charts
            var measureValues = []
            var measureTimes = []
            this.assetTelematics.forEach(telematic => {
                this.activePart.Measure_Name__c = telematic.Measure_Name__c
                measureValues.push(telematic.Measure_Value__c)
                measureTimes.push(new Date(telematic.Measure_Time__c)) // .toLocaleDateString("fr")
            })

            // Update telematics chart in slider
            this.hasChartPoints = measureValues.length > 0
            this.chartPoints = measureValues.join(',')                    
            this.template.querySelector('c-chart-js[data-id="assetChart"]').handleUpdateChart(this.chartPoints, measureTimes);

            // Opening slider
            this.isAssetClicked = true

        })
        .catch(error => {
            console.log('... error loading telematics')
            console.log(error)
            //console.log(error.body.message)
        })
            
    }

    /**
     * Slider CSS class to open or close slider based on isAssetClicked attribute
     */
    get sliderClass() {
        return this.isAssetClicked ? 'slider slider-in' : 'slider slider-out'
    }

    /**
     * Check if active part has a remaining life and life expectancy to display gauge
     */
    get hasRemainingLife() {
        return (this.activePart.Remaining_Life__c >=0 && this.activePart.Life_Expectancy__c > 0)
    }

    /**
     * Loop through parts to find the part with given Id
     * @param {string} assetId 
     * @returns 
     */
    getAssetById(assetId) {
        let asset = undefined
        this.parts.forEach(part => {
            if (part.Id === assetId) {
                asset = part
            }
        });
        return asset
    }

    /**
     * Navigate to Asset Record Page
     * @param {Event} event 
     */
    handleOpenAsset(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.activePart.Id,
                //objectApiName: 'Case', // objectApiName is optional
                actionName: 'view'
            }
        });
        
        
    }

    /**
     * Closing slider and resetting the active part
     */
    handleCloseSlider() {
        this.isAssetClicked = false
        this.resetActivePart()
        this.parts.forEach(part => {
            part.isActive = (part.Id == this.activePart.Id)
        })
    }

    /**
     * Setting pricebookId when an option is selected
     * @param {Event} event 
     */
    handlePricebookChange(event) {
        this.pricebookId = event.target.value;
    }

    /**
     * Confirming pricebook to close modal window and
     * add opportunity line
     */
    selectPricebook() {
        this.isPricebookSliderOpen = false
        if (this.pricebookId) {
            this.handleAddOpportunityLine()
        }
    }

    /**
     * Closing pricebook selection modal
     */
    closePricebookSlider() {
        this.isPricebookSliderOpen = false
    }

    /**
     * Get Close Date when changed
     * @param {Event} event 
     */
    handleCloseDateChange(event) {
        this.closeDate = event.target.value;
    }

    /**
     * Creating opportunity
     */
    createOpportunity() {

        console.log('🇫🇷 Start creating opportunity...')

        this.createOptyIcon = 'utility:spinner'
        this.createOptyLabel = 'Please wait ...'

        
        // Create opty
        var opty = {}
        opty.Asset__c = this.assetId
        opty.AccountId = this.vehicle.AccountId
        opty.StageName = this.opportunityStage
        opty.Name = this.opportunityName
        opty.Pricebook2Id = this.pricebookId
        opty.CloseDate = this.closeDate

        saveOpty({opty: opty, optyLineItemList:this.opportunityLines})
        .then(result => {

            console.log('🇫🇷 opty successfully saved with Id: ' + result)

            this.isOptyCreated = true
            this.opportunityLines = []
            this.hasOptyLines = false
            this.createOptyIcon = 'utility:add'
            this.createOptyLabel = 'Create'

        })
        .catch(error => {
            console.log('error creating opportunity')
            console.log(error)
        });
    }

    /** 
     * Setting direction of rotation
    */
    setRotation(event) {
        console.log("🇫🇷 set rotation : " + event.target.value)
        this.rotation = parseInt(event.target.value)
        this.isRotationSliderOpen = false; // Closing modal window
    }

    /**
     * Getting next part is triggered after reviewing a part
     * Next part is determined by the Walk Around Order attribute
     * which is used to order parts in the Apex Controller, and 
     * the direction of rotation
     * @param {Object} asset 
     * @returns 
     */
    getNextPart(asset) {

        // Getting current part index in the parts list
        let currentIndex = this.parts.findIndex(x => x.Id === asset.Id);

        if (this.rotation >= 0) {
            // Rotating clockwise
            if(currentIndex >= 0 && currentIndex < this.parts.length - 1) {
                return this.parts[currentIndex + 1]
            } else {
                return this.parts[0]
            }
        }
        else {
            // Rotating counterclockwise
            if(currentIndex >= 1 && currentIndex < this.parts.length) {
                return this.parts[currentIndex - 1]
            } else {
                return this.parts[this.parts.length - 1]
            }
        }
    }

    /**
     * Add a product to an opportunity
     * If no pricebook has been selected, opens the pricebook modal
     */
    handleAddOpportunityLine() {

        if (!this.pricebookId) {
            this.isPricebookSliderOpen = true
        } 
        else {

            // Toggling product state (button)
            this.activePart.isAdded = !this.activePart.isAdded

            // Getting the pricebook entry of the product in the selected pricebook
            getPriceBookEntry({productId: this.activePart.Product2Id, pricebookId: this.pricebookId})
            .then(result => {

                console.log('🇫🇷 pricebook entry found : ' + result.Id)

                // Setting an opportunity line item object
                let opportunityLine = {}
                opportunityLine.Product2Id = this.activePart.Product2Id
                opportunityLine.Quantity = 1
                opportunityLine.PricebookEntryId = result.Id
                opportunityLine.TotalPrice = result.UnitPrice
                opportunityLine.Name = this.activePart.Name
                opportunityLine.AssetId = this.activePart.Id

                // Adding opportunity line to the list
                this.opportunityLines.push(opportunityLine)

                // Trigerring showing the opportunity bloc at the bottom
                this.hasOptyLines = true
                    
            })
            .catch(error => {
                console.log(error)
            });  
        }    

    }

    /**
     * Capturing the overall state of the part (radio button) when clicked
     * @param {Event} event 
     */
    handleStateChange(event){
        this.stateValue = event.detail.value
    }

    /**
     * Submitting state value which creates an Asset Inspection record
     * This record is important to trigger the Change Data Capture Event
     * for the other LWC canVehicleOverview
     */
    handleSubmitStateValue() {
        console.log(this.stateValue)

        console.log('🇫🇷 submitting value...')

        // Create inspection on asset
        let assetInspection = {}
        assetInspection.Asset__c = this.activePart.Id
        assetInspection.Status__c = this.stateValue
        
        // Get next part
        this.activePart.isChecked = true
        this.activePart.inspectionStatus = this.stateValue
        let nextPart = this.getNextPart(this.activePart)
        
        if (nextPart) {
            if (nextPart.isChecked === false) {
                // Next part has not been checked yet
                // Resetting value and changing the active part
                this.stateValue = -1
                this.changeActivePart(nextPart)
            } else {
                // Next part has already been checked
                // Inspection is over
                this.isInspectionOver = true
                this.isAssetClicked = false

                // Opening modal informing that inspection is over
                this.isInspectionSliderOpen = true
            }
        } else {
            // Error in getting next part
            console.log('🇫🇷 nextTire key (' + nextTireKey + ') not found in tires, closing slider')
            this.isAssetClicked = false;
        }

        // Insert Asset Inpection
        // This creation is trigger after switching part so that
        // it does not block the inspection
        insertAssetInspection({assetInspection: assetInspection})
        .then(result => {
            console.log('🇫🇷 ... inserted assetInspection id : ' + result)
        })
    }

    // Closing the modal informing that inspection is over
    closeSlider() {
        this.isInspectionSliderOpen = false
    }

    /**
     * UNUSED in this version
     * Could be added if a value had to be entered on a part (pressure, ...)
     * In this version, only an overall state is selected (new, good, medium...)
     * @param {Event} event 
     */
    handleMeasureValueChange(event) {
        this.measureValue = event.target.value;
    }

    /**
     * UNUSED in this version
     * Could be added with previous function to create an asset telematics
     */
    handleSubmitMeasureValue() {

        console.log('🇫🇷 submitting value...')

        // Create telematics on asset
        let assetTelematic = {}
        assetTelematic.Asset__c = this.activePart.Id
        assetTelematic.Measure_Name__c = this.activePart.Measure_Name__c
        assetTelematic.Measure_Time__c = new Date()
        assetTelematic.Measure_Value__c = parseFloat(this.measureValue)
        this.activePart.isChecked = true

        // Get next part
        let nextPart = this.getNextPart(this.activePart)
        
        if (nextPart) {
            if (nextPart.isChecked === false) {
                this.changeActivePart(nextPart)
                // Il faudrait récupérer de nouveau les télématics et mettre à jour le panneau
            } else {
                console.log('🇫🇷 nextTire is already done')
                this.isInspectionOver = true
                this.isAssetClicked = false
                this.isInspectionSliderOpen = true
            }
        } else {
            console.log('🇫🇷 nextTire key (' + nextTireKey + ') not found in tires, closing slider')
            this.isAssetClicked = false;
        }

        // Insert Telematics
        insertTelematics({assetTelematic: assetTelematic})
        .then(result => {
            console.log('🇫🇷 ... inserted telematics id : ' + result)
            this.measureValue = undefined

        })

        
    }

}