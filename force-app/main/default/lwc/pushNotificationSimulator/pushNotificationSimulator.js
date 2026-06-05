import { LightningElement, track } from 'lwc';
import CustomNotificationFromApex from '@salesforce/apex/CustomNotificationFromApex.notifyUsers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PushNotificationSimulator extends LightningElement {

    @track recordToOpen = '00QHs00001s83QRMAY';
    @track notifyMessage = 'A Test Drive Appointment has been scheduled by Lauren Bailey';

  //  notifications = [
  //  {idx: 0, message: 'A Test Drive Appointmetn has been scheduled by Lauren Bailey', targetType: 'record', targetvalue: this.recordToOpen
  //  }
  //  ]

    handleInputChange(event) {
        this.recordToOpen = event.target.value;
       // console.log('input change fired');
    }
    handleTxtAreaChange(event){
        this.notifyMessage = event.target.value;
    }

    notify(evt){
    try {
        console.log('notify evt', evt);
        //let msg = evt.currentTarget.closest('.slds-grid').querySelector('textarea').defaultValue;
        //console.log(msg);
        let payload = { message:this.notifyMessage , targetType:'record', targetvalue:this.recordToOpen };

        console.log('Pay Load' + payload);
        console.log('Target Type' + payload.targetType);
        console.log('Message' + payload.message);
        console.log('Target Value' + payload.targetvalue);

        CustomNotificationFromApex(payload)
            .then((result) => {
                console.log('notify success');
                this.showNotification('Notification Sent', 'success');
            })
            .catch((error) => {
                this.showNotification('Error Sending Notification', 'error');
                console.log('Error Sending Notification', error);
                this.contacts = undefined;
            });
           } catch(err) {
            console.log(err);
            }
    }

    showNotification(message, variant) {
        //message: this.message,
        const evt = new ShowToastEvent({
            title: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}