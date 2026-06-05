import { LightningElement,wire, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import fetchProducts from '@salesforce/apex/serviceAppointmentSearchController.fetchProductlist';
import createProductRequest from '@salesforce/apex/serviceAppointmentSearchController.createProductRequest';

export default class RProductTabularView extends NavigationMixin(LightningElement) {
    recordCount = 20;
    @track productsList;
    @track productWithQuantity = [];
    @track tempproductWithQuantity = [];
    
    @track productName = '';

    @api recordId;
    @api Id;

    isLoading = false;
   

    get isProductList(){
        return this.productWithQuantity.length > 0;
    }
    
    connectedCallback(){
        this.handleFetchProducts();
    }

    handleFetchProducts = async () => {
        this.isLoading = true;
        let data = await fetchProducts({recordCount: this.recordCount});
        if (data) {
            this.productsList = data;
            this.error = undefined;

            let listofProducts=[];
            for(let i=0; i<this.productsList.length; i++){
                let objProduct = {};
                objProduct.Id = this.productsList[i].Id;
                objProduct.Name = this.productsList[i].Product2.Name;
                objProduct.QuantityOnHand = this.productsList[i].QuantityOnHand;
                objProduct.Quantity = '';
                objProduct.ProductId = this.productsList[i].Product2Id;
                listofProducts.push(objProduct);
            }
            this.productWithQuantity = listofProducts;
            this.tempproductWithQuantity = listofProducts;
            console.log('RProductTabularView- fetchProductsList:  Products Details '+JSON.stringify(this.productsList)+' Product with Quantity '+JSON.stringify(this.productWithQuantity));
        }
        this.isLoading = false;
    }

    // @wire(fetchProducts,{recordCount: '$recordCount'})
    // fetchProductsList({ error, data }) {
    //     alert('Data' + JSON.stringify(data));
    //     if (data) {
    //         this.productsList = data;
    //         this.error = undefined;

    //         let listofProducts=[];
    //         for(let i=0; i<this.productsList.length; i++){
    //             let objProduct = {};
    //             objProduct.Id = this.productsList[i].Id;
    //             objProduct.Name = this.productsList[i].Product2.Name;
    //             objProduct.QuantityOnHand = this.productsList[i].QuantityOnHand;
    //             objProduct.Quantity = '';
    //             objProduct.ProductId = this.productsList[i].Product2Id;
    //             listofProducts.push(objProduct);
    //         }
    //         this.productWithQuantity = listofProducts;
    //         this.tempproductWithQuantity = listofProducts;
    //         console.log('RProductTabularView- fetchProductsList:  Products Details '+JSON.stringify(this.productsList)+' Product with Quantity '+JSON.stringify(this.productWithQuantity));
    //     } else if (error) {
    //         this.error = error;
    //         this.productsList = undefined;
    //     }
    // }

    handleSave(event){

        let productRequestLineItem = [];

        for(let i of this.productWithQuantity){
            productRequestLineItem.push({
                Product2Id : i.ProductId,
                QuantityRequested : i.Quantity,
            });
        }

        createProductRequest({
            prodReqLine : productRequestLineItem,
            recordId : this.recordId
        })
        .then(ele=> {
            this[NavigationMixin.Navigate]({
                "type": "standard__webPage",
                "attributes": {
                    "url": `com.salesforce.fieldservice://v1/sObject/${ele}/details`
                }
            }
            );
        })
        .catch(err => {

        });
    }

    handleInputChange(event){
        console.log('RProductTabularView- handleInputChange: Dataset '+JSON.stringify(event.target.dataset)+' target value'+event.target.value+' Target Name '+event.target.name+' Assigned data '+JSON.stringify(this.productWithQuantity));
        console.log('RProductTabularView- handleInputChange: List of tempproductWithQuantity '+JSON.stringify(this.tempproductWithQuantity));
        let index = event.target.dataset.id;
        let fieldName = event.target.name;
        let value = event.target.value;
        
        for(let i = 0; i < this.productWithQuantity.length; i++) {
            if(this.productWithQuantity[i].Id === index){
                this.productWithQuantity[i][fieldName] = value;
            }
        }
        for(let i = 0; i < this.tempproductWithQuantity.length; i++) {
            if(this.tempproductWithQuantity[i].Id === index){
                this.tempproductWithQuantity[i][fieldName] = value;
            }
        }
        console.log('RProductTabularView- handleInputChange: List of tempproductWithQuantity '+JSON.stringify(this.tempproductWithQuantity));
        console.log('RProductTabularView- handleInputChange: List of productWithQuantity '+JSON.stringify(this.productWithQuantity));
    }

    handleChangeProductName(event){
        console.log('search value '+event.target.value);
        this.productName = event.target.value;
        console.log('RProductTabularView- handleChangeProductName '+JSON.stringify(this.tempproductWithQuantity));
        let Productslist=[];
        for(let i=0; i<this.tempproductWithQuantity.length; i++){
            let objProduct = {};
            if(this.tempproductWithQuantity[i].Name.toLowerCase().includes(this.productName.toLowerCase())){
                objProduct.Id = this.tempproductWithQuantity[i].Id;
                objProduct.Name = this.tempproductWithQuantity[i].Name;
                objProduct.QuantityOnHand = this.tempproductWithQuantity[i].QuantityOnHand;
                objProduct.ProductCode = this.tempproductWithQuantity[i].ProductCode;
                objProduct.Quantity = this.tempproductWithQuantity[i].Quantity;
                objProduct.ProductId = this.tempproductWithQuantity[i].ProductId;
                Productslist.push(objProduct);
            }
        }
        this.productWithQuantity = Productslist;
        console.log('RProductTabularView- productWithQuantity '+JSON.stringify(this.productWithQuantity));
    }

}