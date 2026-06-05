import { LightningElement, wire, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Vehicle.Name';
import ASSET_ID from '@salesforce/schema/Vehicle.AssetId';

const fields = [NAME_FIELD, ASSET_ID];

export default class EfDigitalTwin extends LightningElement {
    @api recordId;
    @api objectApiName;
    assetId;
    name;

     // Charge
    @api chargeMeasureName

    // Power
    @api powerMeasureName

    // Doors
    @api doorsMeasureName

    //Get car name and assetId to populate digital Twin component

    @wire(getRecord, { recordId: '$recordId', fields})
     wiredRecord({ error, data }) {
        if (data) {
            this.record = data;
            this.name = this.record.fields.Name.value;
            this.assetId = this.record.fields.AssetId.value;
        }
        else if (error) {
            this.error = error;
        }
    }
		
		get VehicleParametersSet() {
        return this.recordId && this.objectApiName && this.assetId ? true : false;
    }

    renderedCallback() {
        if(this.template.querySelector('lightning-tabset')){
            const style = document.createElement('style');
            style.innerText = `
            lightning-tabset > div > lightning-tab-bar {
                background-color: #706e6b33;
            }
        `;
            this.template.querySelector('lightning-tabset').appendChild(style);
        }
        }
}