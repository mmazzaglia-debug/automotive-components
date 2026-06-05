import { LightningElement, wire, api } from 'lwc';
import { getRecord, createRecord, getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Vehicle.Name';
import { RefreshEvent } from 'lightning/refresh';


/*NOT WORKING AS EXPECTED, DON'T FORGET TO IMPORT field "Description__c" IN PACKAGE
import DESCRIPTION_FIELD from '@salesforce/schema/Asset_Telematic__c.Description__c';
*/


const fields = [NAME_FIELD];

export default class EfDigitalTwinTabFeatures extends LightningElement {

    features = [
        {name : "Vehicle Preconditioning", category : "Subscription", state : "Activated", checked : true, version : "5.12.1", description : "Preconditioning allows you to pre-heat or pre-cool the car’s cabin before you start your journey. Not only will you feel more comfortable, you’ll maximise the car’s driving range and prolong the life of the battery.",resource : "Setup and Customization for Vehicle Precondition"},
        {name : "Intelligent Parking Assist System (IPAS)", category : "Driver Assist", state : "Deactivated",checked : false,  version : "16.1.30", description : "Intelligent Parking Assist System (IPAS), also known as the Advanced Parking Guidance System (APGS), assists drivers in parking their vehicles using computer processors tied to multiple sensors.",resource : "Advanced Parking Guidance System / Parking Assist"},
        {name : "Adaptive Cruise Control (ACC)", category : "Driver Assist", state : "Activated", checked : true, version : "16.1.30", description : "Adaptive cruise control (ACC) is a system designed to help vehicles maintain a safe following distance and stay within the speed limit. This system adjusts a car's speed automatically so drivers don't have to.",resource : "Adaptive Cruise Control Systems and Automation"},
        {name : "Blind Spot Monitoring (BSM)", category : "Safety", state : "Activated",checked : true,  version : "14.2.24", description : "BSM is an advanced driving assistance systems (ADAS) designed to help increase safety by alerting the driver to vehicles that may have escaped visibility in the side-view mirrors. In simplest terms, this technology helps keep a motorist from running into another car moving in the same direction in an adjacent lane.",resource : "Employing ADAS: Blind Spot Monitoring (BSM)"},
        {name : "Pedestrian Detection", category : "Safety", state : "Activated", checked : true, version : "14.2.24", description : "Pedestrian detection is an essential and significant task in any intelligent video recognition systems as it provides the fundamental information for semantic understanding of the footage. Alerts the driver or automatically brakes if there is a pedestrian in the path between a certain speed range—generally around 25 mph.",resource : "Employing ADAS: Pedestrian Detection"},
        {name : "Driver Drowsiness Detection", category : "Safety", state : "Deactivated", checked : false, version : "16.1.30", description : "Drowsiness detection works to prevent accidents created by microsleep, fatigue and lack of attention. Driver drowsiness detection systems generally come as one tool, one part of Advanced Driver Assistance Systems (ADAS).",resource : "Employing ADAS: Driver Monitoring"},
        {name : "Virtual Mirrors", category : "Technology", state : "Unavailable", checked : false, version : "--", description : "The primary benefits of digital side view mirrors stem from the versatility of the cameras. In models such as the Lexus ES (available in overseas markets), the camera uses a wide-angle lens and can crop or otherwise adjust the field of vision to suit the situation.",resource : "Digital Doors and Virtual Mirrors"},
        {name : "Head-Up Display", category : "Technology", state : "Activated", checked : true, version : "v2.03", description : "The head-up display is a technology that projects an image onto the vehicle’s windshield or a panel just beneath the driver’s line of sight. Although it’s an information tool, it’s equally a safety feature. It provides assorted information but doesn’t require drivers to take their eyes off the road.",resource : "Vehicle Head-up Displays"},
        {name : "Launch Control", category : "Technology", state : "Deactivated", checked : false, version : "16.1.30", description : "Typically available as Eco, Comfort, and Sport, other modes can include Smart, Sport+, and Individual. With the push of a button, a driver can adjust how a vehicle handles based on changing road conditions or preferences. Each mode is calibrated to alter gearing, throttle response, suspension settings, steering feel, and traction control.",resource : "Launch Control: Vehicle Drive Modes"},
        {name : "Tire Pressure Monitoring System (TPMS)", category : "Safety", state :  "Activated", checked : true, version : "16.1.30", description : "The purpose of the tire pressure monitoring system (TPMS) in your vehicle is to warn you that at least one or more tires are significantly under-inflated, possibly creating unsafe driving conditions.",resource : "TPMS Guidelines and Implementation"},
        {name : "Summon Vehicle", category : "Technology", state : "Deactivated", checked : false, version : "v5.20", description : "Summon allows you to automatically park and retrieve your vehicle while outside of the cabin. Summon moves your vehicle forward and reverse up to 12 meters in, or out of, a parking space.",resource : "Summon Guidelines"},
        {name : "Ambient Lighting", category : "Technology", state : "Activated", checked : true, version : "16.1.30", description : "Ambient automotive lights generate attractive, robust and functional exterior and interior illumination, delivering design freedom and qualified safety.",resource : "Integrated Lighting Systems for Vehicle Safety"},
        {name : "360° Camera View / Bird’s Eye View", category : "Technology", state : "Activated", checked : true, version : "5.5.1", description : "The Bird's Eye View Camera System consists of cameras mounted on all four sides of the vehicle. These cameras link to provide a single composite 360-degree overhead view on the cab LCS screen. This provides the driver with the view of all activity taking place around the vehicle to improve fireground safety.",resource : "Vehicle Camera Systems: Bird’s Eye View"},
        {name : "Dual Clutch Transmission (DCT)", category : "Technology", state : "Deactivated",checked : false,  version : "16.1.30", description : "Multi-speed vehicle transmission system, that uses two separate clutches for odd and even gear sets. The design is often similar to two separate manual transmissions with their respective clutches contained within one housing, and working as one unit.",resource : "DCT Requirements and Specifications"}
    ];
    displayList = ["true","false","true","true","true","false","false","true","false","false","false","true","true","false"];

    activeSectionsMessage = "";

    @api
    get activeSections() { 
        return ['Vehicle Preconditioning']
     }

     @api recordId;
     @api assetId;
     @api name;

     MEASURE_NAME = 'Service Feature' ;

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }

    handleToggleChange(event){

        // Insert Telematics
        let recordInput = {
            apiName : 'Asset_Telematic__c' ,
            fields : {
                Asset__c : this.assetId ,
                Measure_Name__c : this.MEASURE_NAME ,
                Measure_Value__c : event.detail.checked ? 1 : 0 ,
                Measure_Time__c : new Date() ,
                Description__c : event.target.dataset.id 
            }
        };
        console.log(event) ;
        console.log(event.target.dataset.id) ;
        

        createRecord(recordInput)
        .then(result => {
            console.log('Feature Telematics created') ,

            this.dispatchEvent(new RefreshEvent());
        })
        .catch( error => {
            console.log('Error creating telematics')
            console.log(error)
        })

    }
}