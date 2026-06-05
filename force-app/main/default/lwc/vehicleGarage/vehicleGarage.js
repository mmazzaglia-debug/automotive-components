import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getVehiclesForRecord from '@salesforce/apex/VehicleGarageController.getVehiclesForRecord';

const OBJECT_PREFIXES = {
    '001': 'Account',
    '003': 'Contact',
    '500': 'Case',
    '0DH': 'VoiceCall'
};

export default class VehicleGarage extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName = '';
    @api imageFieldApiName = 'Auto_Vehicle_Image__c';

    vehicles = [];
    loading = true;
    errorMessage = '';

    get effectiveObjectApiName() {
        const raw = this.objectApiName && typeof this.objectApiName === 'string' ? this.objectApiName.trim() : '';
        if (raw && raw !== 'Auto' && ['Account', 'Contact', 'Case', 'VoiceCall'].includes(raw)) return raw;
        if (this.recordId && typeof this.recordId === 'string' && this.recordId.length >= 3) {
            return OBJECT_PREFIXES[this.recordId.substring(0, 3)] || '';
        }
        return '';
    }

    @wire(getVehiclesForRecord, { recordId: '$recordId', objectApiName: '$effectiveObjectApiName', imageFieldApiName: '$imageFieldApiName' })
    wiredVehicles({ data, error }) {
        this.loading = false;
        if (error) {
            this.errorMessage = error.body?.message || error.message || 'Error al cargar vehículos';
            this.vehicles = [];
            return;
        }
        this.errorMessage = '';
        const raw = Array.isArray(data) ? data : [];
        this.vehicles = raw.map((v) => ({
            ...v,
            lastServiceDateFormatted: this.formatDateSpanish(v.lastServiceDate) || v.lastServiceDate || ''
        }));
    }

    formatDateSpanish(value) {
        if (!value) return '';
        const str = String(value).trim();
        const dateMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const [, y, m, d] = dateMatch;
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const month = months[parseInt(m, 10) - 1] || m;
            return `${parseInt(d, 10)} de ${month} ${y}`;
        }
        return str;
    }

    handleImageError(event) {
        const el = event.target;
        if (el && el.dataset && el.dataset.id) {
            const id = el.dataset.id;
            this.vehicles = this.vehicles.map((v) =>
                v.id === id ? { ...v, imageUrl: null } : v
            );
        }
    }

    get hasVehicles() {
        return !this.loading && !this.errorMessage && this.vehicles.length > 0;
    }

    get showEmpty() {
        return !this.loading && !this.errorMessage && this.vehicles.length === 0 && this.recordId;
    }

    get hasError() {
        return Boolean(this.errorMessage);
    }

    handleCardClick(event) {
        const id = event.currentTarget?.dataset?.id;
        if (id) this.navigateToVehicle(id);
    }

    handleCardKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const id = event.currentTarget?.dataset?.id;
            if (id) this.navigateToVehicle(id);
        }
    }

    navigateToVehicle(vehicleId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: vehicleId,
                actionName: 'view'
            }
        });
    }
}