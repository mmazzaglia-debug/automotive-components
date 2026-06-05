import { LightningElement, track, wire } from 'lwc';
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import getLocationIdForCurrentUserServiceResource from '@salesforce/apex/SDO_SFS_ProductScanRequest.getLocationIdForCurrentUserServiceResource';
import getProductData from '@salesforce/apex/SDO_SFS_ProductScanRequest.getProductData';
import getProductSKU from '@salesforce/apex/SDO_SFS_ProductScanRequest.getProductSKU';
import createProductRequestAndItems from '@salesforce/apex/SDO_SFS_ProductScanRequest.createProductRequestAndItems';

export default class Sdo_sfs_scanProductRequest extends NavigationMixin(LightningElement) {

    barcodeScanner;
    barcodeResults = 'Nothing scanned yet!';
    locationId;
    isLoading = false;


    showProductSearch = false;
    sourceLocationId;
    destinationId;
    needByDateTime;

    @track productRequests = {};
    @track prodSKUsToFetch = new Set();

    connectedCallback() {
        this.barcodeScanner = getBarcodeScanner();
    }

    @wire(getLocationIdForCurrentUserServiceResource)
    locationIdCallback({ error, data }) {
        if (data) {
            this.locationId = data;
            this.destinationId = data;
        } else if (error) {
            console.error('Error loading location id', error);
        }
    }

    handleDestinationChange(event) {
        this.destinationId = event.detail.recordId;
    }

    handleSourceChange(event) {
        this.sourceLocationId = event.detail.recordId;
    }

    handleNeedByDateTimeChange(event) {
        this.needByDateTime = event.target.value;
    }

    handleProductSearchSelect(event) {
        let selectedProdId = event.detail.recordId;
        if (selectedProdId) {
            getProductSKU({ prodId: selectedProdId })
                .then(result => {
                    this.prodSKUsToFetch.add(result);
                    this.getProductData();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    handleBeginScanClick(event) {
        if (this.barcodeScanner.isAvailable()) {
            console.log('scanner available');
            // Perform scanning operations
            let scanningOptions = {
                "barcodeTypes": ["code128"],
                "instructionText": "Scan barcodes — Click ✖︎ when done",
                "successText": "Successful Scan!",
                showSuccessCheckMark: true,
                enableBulkScan: true,
                enableMultiScan: true,
            };
            this.barcodeScanner.scan(scanningOptions)
                .then((results) => {
                    // Do something with the results of the scan
                    this.barcodeResults = '';
                    results.forEach(result => {
                        this.barcodeResults += 'type: ' + result.type + ', value: ' + result.value + '\n';
                        let sku = result.value;
                        if (!this.productRequests.hasOwnProperty(sku)) {
                            this.prodSKUsToFetch.add(sku);
                        }
                    });
                })
                .catch((error) => {
                    // Handle cancellation and scanning errors here
                    this.barcodeResults = 'Error code: ' + error.code + '\nError message: ' + error.message;
                })
                .finally(() => {
                    this.barcodeScanner.dismiss();
                    this.getProductData();
                });
        } else {
            // Scanner not available
            // Not running on hardware with a scanner
            // Handle with message, error, beep, and so on
            this.barcodeResults = 'Problem initiating scanner. Are you using a mobile device?';
        }
    }

    getProductData() {
        let skus = this.prodSKUsToFetch;
        if (skus.size > 0) {
            this.isLoading = true;
            getProductData({
                locationId: this.locationId,
                skus: Array.from(skus).join(';')
            })
                .then(result => {
                    this.prodSKUsToFetch.clear();
                    this.showProductSearch = false;
                    this.productRequests = Object.assign(this.productRequests, result);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                }).finally(() => {
                    this.isLoading = false;
                });
        }
    }

    changeQuantity(event) {
        let sku = event.currentTarget.dataset.sku;
        let action = event.currentTarget.dataset.action;

        if (action == 'decrease') {
            let currentRequestQty = this.productRequests[sku].requestQuantity;
            if (currentRequestQty > 0) {
                this.productRequests[sku].requestQuantity--;
            }
        } else if (action == 'update') {
            this.productRequests[sku].requestQuantity = event.target.value;
        } else if (action == 'increase') {
            this.productRequests[sku].requestQuantity++;
        }
    }

    createProductRequest() {
        try {
            if (this.productRequestList.length > 0) {
                this.isLoading = true;

                let sourceLocationId = this.sourceLocationId;
                let destinationId = this.destinationId;
                let needByDateTime = this.needByDateTime;
                let currentLocation = this.locationId;

                let prLines = this.productRequestList.map((item) => {
                    return {
                        Product2Id: item.productId,
                        QuantityRequested: item.requestQuantity,
                        QuantityUnitOfMeasure: 'Each',
                        SourceLocationId: sourceLocationId,
                        DestinationLocationId: destinationId,
                        NeedByDate: needByDateTime
                    }
                });

                let prodItems = this.productRequestList.filter((item) => item.hasProdItem === false).map((item) => {
                    return {
                        LocationId: currentLocation,
                        Product2Id: item.productId,
                        QuantityOnHand: item.requestQuantity,
                        QuantityUnitOfMeasure: 'Each'
                    }
                });

                createProductRequestAndItems({
                    sourceLocation: sourceLocationId,
                    destinationLocation: destinationId,
                    needByDateTime: needByDateTime,
                    productRequestLines: prLines,
                    productItems: prodItems,
                })
                    .then((result) => {
                        this.showToast(`Product Request ${result} Was Created.`, null, 'success');
                    })
                    .catch((error) => {
                        this.showToast('Uh Oh! An Error Occured.', null, 'error');
                    }).finally(() => {
                        this.isLoading = false;
                    });
            }
        } catch (error) {
            console.error(error);
        }
    }

    showToast(title, message, variant) {
        let toastContent = { title, variant };
        if (message) {
            toastContent.message = message;
        }
        this.dispatchEvent(new ShowToastEvent(toastContent));
    }

    toggleProductSearch() {
        this.showProductSearch = !this.showProductSearch;
    }

    get productRequestList() {
        return Object.values(this.productRequests);
    }

    get strData() {
        return JSON.stringify(this.productRequests);
    }

    get disableRequestProductBtn() {
        return !(Boolean(this.destinationId) && Boolean(this.needByDateTime) && this.productRequestList.length > 0);
    }

    get showRequestBtn() {
        return this.productRequestList.length > 0;
    }

    get requestProdButtonLabel() {
        let partLabel = this.productRequestList.length > 1 ? 'Products' : 'Product';
        return `Request ${partLabel}`;
    }

    get prodSearchCls() {
        return this.showProductSearch ? '' : 'slds-hide';
    }

}