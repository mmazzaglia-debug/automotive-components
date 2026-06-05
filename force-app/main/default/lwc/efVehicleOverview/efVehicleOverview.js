import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
const fields = [
    'Vehicle.Vehicle_Picture_URL__c',
    'Vehicle.Vehicle_Picture_URL_2__c',
    'Vehicle.Vehicle_Picture_URL_3__c',
    'Vehicle.Vehicle_Picture_URL_4__c'
];

export default class EfVehicleOverview extends LightningElement {
    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields})
    vehicle;
     get vehiclePicture() {
        return this.vehicle?.data?.fields?.Vehicle_Picture_URL__c?.value;
    }
    get vehiclePicture2() {
        return this.vehicle?.data?.fields?.Vehicle_Picture_URL_2__c?.value;
    }
    get vehiclePicture3() {
        return this.vehicle?.data?.fields?.Vehicle_Picture_URL_3__c?.value;
    }
    get vehiclePicture4() {
        return this.vehicle?.data?.fields?.Vehicle_Picture_URL_4__c?.value;
    }
}