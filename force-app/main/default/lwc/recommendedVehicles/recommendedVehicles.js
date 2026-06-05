import { LightningElement, api, wire } from 'lwc';
import getRecommendedVehicles from '@salesforce/apex/RecommendedVehiclesController.getRecommendedVehicles';

export default class RecommendedVehicles extends LightningElement {
    @api recordId;
    @api maxRecords = 3;
    @api vehicle1Name;
    @api vehicle1ImageUrl;
    @api vehicle1RecordLink;
    @api vehicle2Name;
    @api vehicle2ImageUrl;
    @api vehicle2RecordLink;
    @api vehicle3Name;
    @api vehicle3ImageUrl;
    @api vehicle3RecordLink;

    vehicles = [];
    isLoading = true;
    error;

    @wire(getRecommendedVehicles, { leadId: '$recordId', maxRecords: '$maxRecords' })
    wiredVehicles({ data, error }) {
        this.isLoading = false;

        if (data) {
            this.vehicles = data;
            this.error = undefined;
            return;
        }

        if (error) {
            this.vehicles = [];
            this.error = error;
        }
    }

    get displayVehicles() {
        const configuredVehicles = [
            {
                recordId: 'configured-1',
                vehicleName: this.vehicle1Name,
                imageUrl: this.vehicle1ImageUrl,
                recordUrl: this.normalizeRecordUrl(this.vehicle1RecordLink)
            },
            {
                recordId: 'configured-2',
                vehicleName: this.vehicle2Name,
                imageUrl: this.vehicle2ImageUrl,
                recordUrl: this.normalizeRecordUrl(this.vehicle2RecordLink)
            },
            {
                recordId: 'configured-3',
                vehicleName: this.vehicle3Name,
                imageUrl: this.vehicle3ImageUrl,
                recordUrl: this.normalizeRecordUrl(this.vehicle3RecordLink)
            }
        ].filter((vehicle) => vehicle.vehicleName || vehicle.imageUrl);

        if (configuredVehicles.length) {
            return configuredVehicles;
        }

        return this.vehicles.map((vehicle) => ({
            ...vehicle,
            recordUrl: this.buildRecordPath(vehicle.recordId)
        }));
    }

    get showSpinner() {
        return this.isLoading && !this.hasConfiguredVehicles;
    }

    get hasConfiguredVehicles() {
        return (
            this.vehicle1Name ||
            this.vehicle1ImageUrl ||
            this.vehicle2Name ||
            this.vehicle2ImageUrl ||
            this.vehicle3Name ||
            this.vehicle3ImageUrl
        );
    }

    get hasVehicles() {
        return this.displayVehicles.length > 0;
    }

    get showEmptyState() {
        return !this.isLoading && this.displayVehicles.length === 0;
    }

    normalizeRecordUrl(value) {
        if (!value) {
            return null;
        }

        if (/^(https?:\/\/|\/)/i.test(value)) {
            return value;
        }

        return this.buildRecordPath(value);
    }

    buildRecordPath(recordId) {
        if (!recordId) {
            return null;
        }
        return `/lightning/r/${recordId}/view`;
    }
}