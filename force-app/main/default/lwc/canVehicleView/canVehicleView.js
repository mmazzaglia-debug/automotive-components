import { LightningElement, wire, api, track } from 'lwc';
import getVehicle from '@salesforce/apex/CANVehicleController.getAsset';
import getVehicleParts from '@salesforce/apex/CANVehicleController.getVehiclePartsFromAsset';
import getTelematics from '@salesforce/apex/CANVehicleController.getTelematics';
import getAssetIdByVehicleId from '@salesforce/apex/CANVehicleController.getAssetIdByVehicleId';
import getAssetIdByWorkOrderId from '@salesforce/apex/CANVehicleController.getAssetIdByWorkOrderId';
import getAssetIdByCaseId from '@salesforce/apex/CANVehicleController.getAssetIdByCaseId';
import STATIC_FILES from "@salesforce/resourceUrl/canVehicleViews";
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from "lightning/uiRecordApi";
import { RefreshEvent } from 'lightning/refresh';
import { subscribe, onError } from 'lightning/empApi';


export default class CanVehicleView extends NavigationMixin(LightningElement) {
    @api objectApiName
    @api recordId
    @api assetId
    @api vehicle
    @api battery
    @api parts
    @api activePart
    @api isAssetClicked
    vehicleImageBackground = STATIC_FILES
    @api assetTelematics
    @api vehicleTelematics
    @api currentCharge
    @api batteryTelematics

    // Charge
    @api chargeMeasureName

    // Power
    @api powerMeasureName
    @api switchPower

    // Doors
    @api doorsMeasureName
    @api lockState

    // For Charts
    @api chartPoints 
    @api chartPowerValues
    @api chartPowerLabels
    @api hasChartPoints

    @api rerender // triggering rerender by changing value

    error
				
    isDebug = false

    // Change Data Capture Channels
    channelCase = '/data/CaseChangeEvent'
    channelAssetInspection = '/data/Asset_Inspection__ChangeEvent'
    channelAssetAlert = '/data/Asset_Alert__ChangeEvent'

    
    connectedCallback() {

        console.log('🇫🇷 Connected Vehicle Component - initialisation')
        console.log('🇫🇷 Delivered with ❤️ by the French SE Automotive Team 🇫🇷 Edwin FAMBY, Quentin HURTARD & Charly ANSEL')

        // Active Part init
        this.resetActivePart()

        // Battery init
        this.battery = {}

        // Display init
        this.switchPower = false
        this.rerender = false

        // Check if assetId has been passed by a parent LWC
        if (this.assetId) {
            console.log('🇫🇷 Asset Id provided')
            this.loadVehicle(this.assetId)

        } else {
            
            // Checking Object type of the displayed Page
            if (this.objectApiName) {

                if (this.objectApiName === 'Asset') {
                    this.assetId = this.recordId
                    this.loadVehicle(this.assetId)

                } else if (this.objectApiName === 'Vehicle') {
                    console.log('🇫🇷 Vehicle object, getting asset Id')
                    // Get Asset on Vehicle
                    getAssetIdByVehicleId({ vehicleId: this.recordId})
                    .then(result => {
                        console.log(' Asset Id from Vehicle : ' + result.Id)
                        this.assetId = result.AssetId
                        this.loadVehicle(this.assetId)
                    })
                    .catch(error => {
                        console.log('Error loading Asset from Vehicle')
                        console.log(error)
                        console.log(error.body.message)
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
                        console.log(error.body.message)
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
                        console.log(error.body.message)
                    })

                } else {
                    console.log('no object detected :-(')
                }
            }
        }
        
        // Automatic subscription to Change Data Capture (CDC) channels when component is load
        this.handleSubscribeAssetInspection();
        this.handleSubscribeAssetAlert();
        this.handleSubscribeCase();
        
        // Register error listener for CDC channels
        this.registerErrorListener();

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

            // Loading Telematics
            console.log('🇫🇷 Loading vehicle telematics (looking for Power) ...')
            getTelematics({ assetId: this.assetId })
            .then(result => {
                this.vehicleTelematics = []
                this.vehicleTelematics = result
                this.chartPowerValues = []
                this.chartPowerLabels = []
                this.vehicleTelematics.forEach(telematic => {
                    if (telematic.Measure_Name__c == this.powerMeasureName) {
                        this.chartPowerValues.push(telematic.Measure_Value__c)
                        this.chartPowerLabels.push(telematic.Measure_Time__c)
                    }
                })

                // Passing values to chart component
                this.template.querySelector('c-chart-js[data-id="powerChart"]').handleUpdateChart(this.chartPowerValues.join(','), this.chartPowerLabels);

                // Getting last value of Power to initiate Power State Button
                this.switchPower = this.chartPowerLabels.length > 0 ? (this.chartPowerLabels[this.chartPowerLabels.length - 1] == '1') : false

            })
        })
        .catch(error => {
            console.log('... error loading vehicle')
            console.log(error)
            console.log(error.body.message)
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
            this.parts = result
            console.log(this.parts)
            console.log('🇫🇷 ...', this.parts.length,'vehicle parts loaded')

            this.parts.forEach(part => {

                // Initializing parts
                part.isActive = false
                part.isAlert = false
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
            console.log(error.body.message)
        })
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

            // If clicked asset is already active, deactivate and close slider
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

    changeActivePart(asset) {
        this.activePart = asset

        // Setting isActive flag to apply CSS on active part
        this.parts.forEach(part => {
            part.isActive = (part.Id == this.activePart.Id)
        })

        // Get clicked asset telematics
        getTelematics({ assetId: this.activePart.Id })
        .then(result => {
            this.assetTelematics = []
            this.assetTelematics = result
            var measureValues = []
            var measureTimes = []
            this.assetTelematics.forEach(telematic => {
                measureValues.push(telematic.Measure_Value__c)
                measureTimes.push(new Date(telematic.Measure_Time__c))
            })

            // Update telematics chart in slider
            this.hasChartPoints = measureValues.length > 0
            this.chartPoints = measureValues.join(',')                    
            this.template.querySelector('c-chart-js[data-id="assetChart"]').handleUpdateChart(this.chartPoints, measureTimes);

            // Opening slider
            this.isAssetClicked = true
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
        return (this.activePart.Remaining_Life__c >= 0 && this.activePart.Life_Expectancy__c > 0)
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

    handleLock() {
        this.lockState = !this.lockState;

        // Insert Telematics
        let recordInput = {}
        recordInput.apiName = 'Asset_Telematic__c'
        recordInput.fields = {}
        recordInput.fields.Asset__c = this.assetId
        recordInput.fields.Measure_Name__c = this.doorsMeasureName
        recordInput.fields.Measure_Value__c = this.lockState ? 0 : 1
        recordInput.fields.Measure_Time__c = new Date()

        createRecord(recordInput)
        .then(result => {
            console.log('Telematics created')
            this.dispatchEvent(new RefreshEvent());
        })
        .catch( error => {
            console.log('Error creating telematics')
            console.log(error)
        })
    }

    get unlockState() {
        return !this.lockState;
    }

    get lockStateLabel() {
        return this.lockState ? 'LOCKED' : 'UNLOCKED'
    }

    handleSwitchPower() {

        // Change Power State
        this.switchPower = !this.switchPower

        // Insert Telematics
        let recordInput = {}
        recordInput.apiName = 'Asset_Telematic__c'
        recordInput.fields = {}
        recordInput.fields.Asset__c = this.assetId
        recordInput.fields.Measure_Name__c = this.powerMeasureName
        recordInput.fields.Measure_Value__c = this.switchPower ? 1 : 0
        recordInput.fields.Measure_Time__c = new Date()

        createRecord(recordInput)
        .then(result => {
            console.log('Telematics created')

            this.chartPowerValues.push(recordInput.fields.Measure_Value__c)
            this.chartPowerLabels.push(recordInput.fields.Measure_Time__c)

            this.template.querySelector('c-chart-js[data-id="powerChart"]').handleUpdateChart(this.chartPowerValues.join(','), this.chartPowerLabels);

            this.dispatchEvent(new RefreshEvent());
        })
        .catch( error => {
            console.log('Error creating telematics')
            console.log(error)
        })
    }

    get powerState() {
        return this.switchPower ? 'ON' : 'OFF'
    }

    handleCloseSlider() {
        this.isAssetClicked = false
        this.resetActivePart()
        this.parts.forEach(part => {
            part.isActive = (part.Id == this.activePart.Id)
        })
    }

    /**
     * Subscription to Change Data Capture channel for Asset Inspection object
     */
    handleSubscribeAssetInspection() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelAssetInspection, -1, (message) => {
            let inspectedAssetId = message.data.payload.Asset__c
            if (inspectedAssetId) {
                let inspectedAsset = this.getAssetById(inspectedAssetId)
                if (inspectedAsset) {
                    inspectedAsset.inspectionStatus = message.data.payload.Status__c
                    this.rerender = !this.rerender
                    this.dispatchEvent(new RefreshEvent());
                }
            }
        })
        .then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                '🇫🇷 Subscription request sent to Change Data Capture channel (Asset_Inspection__c): ',
                JSON.stringify(response.channel)
            );
        })
        .catch( error => {
            console.log('🇫🇷 ❌ Subscription error')
            console.log(error)
        })
    }

    /**
     * Subscription to Change Data Capture channel for Asset Alert object
     * To be used when an Asset Alert is created (not a Case)
     */
    handleSubscribeAssetAlert() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelAssetAlert, -1, (message) => {
            let alertAssetId = message.data.payload.Asset__c
            if (alertAssetId) {
                let alertAsset = this.getAssetById(alertAssetId)
                if (alertAsset) {
                    alertAsset.isAlert = true
                    this.rerender = !this.rerender
                    this.dispatchEvent(new RefreshEvent());
                }
            }
        })
        .then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                '🇫🇷 Subscription request sent to Change Data Capture channel (Asset_Alert__c): ',
                JSON.stringify(response.channel)
            );
        })
        .catch( error => {
            console.log('🇫🇷 ❌ Subscription error')
            console.log(error)
        })
    }

    /**
     * Subscription to Change Data Capture channel for Case object
     * To be used when a Case is created (not an Asset Alert)
     */
    handleSubscribeCase() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelCase, -1, (message) => {
            let alertAssetId = message.data.payload.AssetId
            if (alertAssetId) {
                let alertAsset = this.getAssetById(alertAssetId)
                if (alertAsset) {
                    alertAsset.isAlert = true
                    this.rerender = !this.rerender
                    this.dispatchEvent(new RefreshEvent());
                }
            }
        })
        .then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                '🇫🇷 Subscription request sent to Change Data Capture channel (Case): ',
                JSON.stringify(response.channel)
            );
        })
        .catch( error => {
            console.log('🇫🇷 ❌ Subscription error')
            console.log(error)
        })
    }

    // Handling errors with subscription
    registerErrorListener() {
        // Invoke onError empApi method
        onError((error) => {
            console.log('🇫🇷 ❌ CHANGE DATA CAPTURE ERROR ❌')
            console.log('🇫🇷 Be sure that Change Data Capture is enabled for objects Asset_Inspection__c and Asset_Alert__c')
            console.log('🇫🇷 Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }
       
    /**
     * 
     * NOT USED ANYMORE
     * 
     * Subscription to push topic
     */
    handleSubscribePushTopic() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, (message) => {
            console.log('🇫🇷 push topic received :')
            console.log(message.data.sobject)
            this.dispatchEvent(new RefreshEvent());
            let inspectedAsset = this.getAssetById(message.data.sobject.Asset__c)
            if (inspectedAsset) {
                inspectedAsset.inspectionStatus = message.data.sobject.Status__c
                this.rerender = !this.rerender
            }
        })
        .then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                '🇫🇷 Subscription request sent to: ',
                JSON.stringify(response.channel)
            );
        });
    }

    

    /**
     * 
     * NOT USED ANYMORE
     * 
     */
    handleSubscribeAlert() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelNameAlert, -1, (message) => {
            console.log('alert push topic received :')
            console.log(message.data.sobject)
            this.dispatchEvent(new RefreshEvent());
            let alertAsset = this.getAssetById(this.alertAssetId)
            if (alertAsset) {
                console.log('alert on asset')
                alertAsset.isAlert = true
                this.rerender = !this.rerender
            }
        })
        .then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                'Subscription request sent to: ',
                JSON.stringify(response.channel)
            );
        });
    }

    /**
     * 
     * UNUSED
     * 
     * 
     * @param {string} methodName 
     * @param {*} methodArgs 
     * @returns 
     */
    invokeWorkspaceAPI(methodName, methodArgs) {
        return new Promise((resolve, reject) => {
            const apiEvent = new CustomEvent("internalapievent", {
            bubbles: true,
            composed: true,
            cancelable: false,
            detail: {
                category: "workspaceAPI",
                methodName: methodName,
                methodArgs: methodArgs,
                callback: (err, response) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(response);
                }
                }
            }
            });
        
            window.dispatchEvent(apiEvent);
        })
    }

}