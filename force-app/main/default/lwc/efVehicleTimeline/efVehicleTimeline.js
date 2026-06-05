import { LightningElement, wire, api, track } from 'lwc';
import { getRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { RefreshEvent } from 'lightning/refresh';

const VEHICLE_FIELDS = ['Vehicle.AssetId'];
const ASSET_FIELDS = ['Asset_Telematic__c.Name',
'Asset_Telematic__c.Measure_Name__c',
'Asset_Telematic__c.Measure_Time__c',
'Asset_Telematic__c.Measure_Value__c',
'Asset_Telematic__c.Id',
'Asset_Telematic__c.Description__c',
];

export default class EfVehicleTimeline extends NavigationMixin(LightningElement) {
    @api recordId;
    _isDescriptionVisible = true;
    isDescriptionVisible = false;
    buttonIcon = 'utility:chevronright';
    assetId ;
    @track assetTelematicsRecords ;
    errors_getRecord ;
    errors_getRelatedListRecords ;
    expandedSections = new Set();
    refreshHandlerID;
    refreshContainerID;
    refreshTelematicsId ;
    
       // push topic
       channelName = '/topic/NewTelematicCreated';

        // Change Data Capture Channels
        channelAssetTelematic = '/data/Asset_Telematic__ChangeEvent'


    @wire(getRecord, { recordId: '$recordId', fields: VEHICLE_FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.vehicle = data;
            this.assetId = this.vehicle.fields.AssetId.value;
            
        } else if (error) {
            this.errors_getRecord = error;
            this.vehicle = undefined;
        }
     }
 
    get displayCondition(){
        return this.vehicle && this.vehicle.data && this.vehicle.data.fields ;
    }


    @wire(getRelatedListRecords, {
        parentRecordId: '$assetId',
        relatedListId: 'Asset_Telematics__r',
        fields: ASSET_FIELDS
    })listInfo({ error, data }) {
        if (data) {
            this.assetTelematicsRecords = data.records.map(record => {
               /* iconDisplay : data.fields.Measure_Name__c.value === 'Light Alert' ? "utility:alert" : "utility:events",
                  iconClass1 : data.fields.Measure_Name__c.value === 'Light Alert' ? "slds-timeline__item_expandable slds-timeline__item_incident" : "slds-timeline__item_expandable slds-timeline__item_task" ,
                  iconClass2 : data.fields.Measure_Name__c.value === 'Light Alert' ? "slds-icon_container slds-icon-standard-event slds-timeline__icon" : "slds-icon_container slds-icon-standard-task slds-timeline__icon"*/
              
                var itemTitle = "Asset Telematic" ;
                var iconDisplay =  "utility:events" ;
                var iconClass1 = "slds-timeline__item_expandable slds-timeline__item_task"  ;
                var iconClass2 =  "slds-icon_container slds-icon-standard-task slds-timeline__icon";


                if ( record.fields.Measure_Name__c.value === 'Light Alert'){
                    itemTitle = "Light Alert" ;
                    iconDisplay =  "utility:incident"  ;
                    iconClass1 = "slds-timeline__item_expandable slds-timeline__item_event"  ;
                    iconClass2 =  "slds-icon_container slds-icon-standard-event slds-timeline__icon";
                }

                else if ( record.fields.Measure_Name__c.value === 'Service Feature'){
                    var enabledOrDisabled = record.fields.Measure_Value__c.value ? "enabled" : "disabled" ;

                    itemTitle = record.fields.Description__c.value + " is " + enabledOrDisabled;
                    iconDisplay =  "utility:product"  ;
                    iconClass1 = "slds-timeline__item_expandable slds-timeline__item_call"  ;
                    iconClass2 =  "slds-icon_container slds-icon-standard-log-a-call slds-timeline__icon";
                } 

                else if ( record.fields.Measure_Name__c.value === 'Doors'){
                    var openedOrClosed = "" ;
                    console.log(record.fields.Measure_Value__c.value===1) ;
                    if (record.fields.Measure_Value__c.value === 1) {
                        console.log(3345345);
                        openedOrClosed = "opened" ;
                        iconDisplay = "utility:unlock"  ;
                    }
                    else {
                        openedOrClosed = "closed" ;
                        iconDisplay = "utility:lock"  ;
                    }

                    itemTitle = "Doors are  " + openedOrClosed;
                    iconClass1 = "slds-timeline__item_expandable slds-timeline__item_email"  ;
                    iconClass2 =  "slds-icon_container slds-icon-standard-email slds-timeline__icon";
                } 
                
                else if ( record.fields.Measure_Name__c.value === 'Power'){
                    var Active_Inactive = record.fields.Measure_Value__c.value ? "Active" : "Inactive" ;

                    itemTitle = "Car is now " + Active_Inactive;
                } 


                  return {
                  ...record,
                  isActive: false,
                  buttonIcon :  'utility:chevronright',
                  itemTitle : itemTitle ,
                  iconDisplay :  iconDisplay  ,
                  iconClass1 : iconClass1 ,
                  iconClass2 : iconClass2,

                  
                };

                //Reverse the list seems to be not needed anymore ...
              //}).reverse().slice(0, 9);
              }).slice(0, 9).sort() ;

              if (this.assetTelematicsRecords[0]){
                this.refreshTelematicsId = this.assetTelematicsRecords[0].id 
              }
            
            this.error = undefined;

        } else if (error) {
            this.errors_getRelatedListRecords = error;
            this.assetTelematicsRecords = undefined;
        }
    }

    toggleDescription(event) {
        var sectionId = event.target.dataset.id ;
        var index = this.assetTelematicsRecords.findIndex(rec => rec.id === sectionId);

       
       
// Check if the sectionId is already in the expandedSections set
if (this.expandedSections.has(sectionId)) {
    // If it is, remove it from the set to collapse the section
    this.expandedSections.delete(sectionId);
  } else {
    // If it isn't, add it to the set to expand the section
    this.expandedSections.add(sectionId);
  }

        this.assetTelematicsRecords[index].isActive = !this.assetTelematicsRecords[index].isActive ;

        if (this.assetTelematicsRecords[index].buttonIcon === 'utility:chevrondown') {
            this.assetTelematicsRecords[index].buttonIcon = 'utility:chevronright'
          } else {
            // If it isn't, add it to the set to expand the section
            this.assetTelematicsRecords[index].buttonIcon = 'utility:chevrondown'
          }


       this.buttonIcon = this.assetTelematicsRecords[index].isActive ? 'utility:chevrondown' : 'utility:chevronright';

       // Force a re-render to reflect the changes
       //this.expandedSections = new Set([...this.expandedSections]);

 
     
    }

    connectedCallback() {
        // Automatic subscription to Push Topic when component is load
        //this.handleSubscribe();
        this.handleSubscribeAssetTelematic() ;

        
       
    }


    /**
         * Subscription to Change Data Capture channel for Asset Telematic object
         */
        handleSubscribeAssetTelematic() {

            // Invoke subscribe method of empApi. Pass reference to messageCallback
            subscribe(this.channelAssetTelematic, -1, (message) => {
                let inspectedAssetId = message.data.payload.Asset__c
                console.log('🇫🇷 Update activity timeline ...');
                console.log(inspectedAssetId);
                    if (inspectedAssetId === this.assetId) {
                        notifyRecordUpdateAvailable([{recordId:   this.refreshTelematicsId }]);
                        this.dispatchEvent(new RefreshEvent());
                    }
            })
            .then((response) => {
                // Response contains the subscription information on subscribe call
                console.log(
                    '🇫🇷 Subscription request sent to Change Data Capture channel (Asset_Telematic__c): ',
                    JSON.stringify(response.channel)
                );
            })
            .catch( error => {
                console.log('🇫🇷 ❌ Subscription error')
                console.log(error)
            })
        }





    // NOT USED ANYMORE : Subscription to push topic
    handleSubscribe() {

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, (message) => {
            console.log('Timeline push topic received :')
            console.log(message.data.sobject)
           
            if (message.data.sobject.Asset__c === this.assetId){

                console.log("Trigger timeline update") ;
                notifyRecordUpdateAvailable([{recordId:   this.refreshTelematicsId }]);
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


    navigateToRelatedList() {
        // Navigate to the vehicle related list page
        // for a specific Case record.
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.assetId,
                objectApiName: 'Asset_Telematic__c',
                relationshipApiName: 'Asset_Telematics__r',
                actionName: 'view'
            }
        });
    }
   
}