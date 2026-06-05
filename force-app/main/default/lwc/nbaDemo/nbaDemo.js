import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const ACTION_TYPES = {
    RECORD: 'Open Record',
    FLOW: 'Launch Flow',
    URL: 'Go to URL',
    TOAST: 'Show Toast Message',
    OBJECT: 'Go to Object tab',
    TAB: 'Go to custom tab'
}

export default class NbaDemo extends NavigationMixin(LightningElement) {
    @api title = 'Next Best Action';
    @api body;// = 'Enter the text of your Next Best Action here.';
    @api button1Label;// = 'Cancel';
    @api button2Label;// = 'Launch';
    @api imgSrc;
    @api header = 'Special winter promotion!';

    @api actionType;
    @api actionDestination;
    frontFace = false;

    isClicked;

    @api delay = 500;

    rendered;
    renderedCallback() {
        if (this.rendered) return;
        this.rendered = true;
    }

    handleAcceptButtonClick(event) {
        setTimeout(() => {
            if (this.actionType === ACTION_TYPES.RECORD) {
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.actionDestination,
                        actionName: 'view'
                    }
                });
            } else if (this.actionType === ACTION_TYPES.FLOW) {
                this[NavigationMixin.GenerateUrl]('/flow/' + this.actionDestination)
                    .then(url => this.url = url);
            } else if (this.actionType === ACTION_TYPES.URL) {
                // this[NavigationMixin.GenerateUrl](this.actionDestination)
                //     .then(url => this.url = url);
                this[NavigationMixin.Navigate](
                    {
                        type: 'standard__webPage',
                        attributes: {
                            url: this.actionDestination
                        }
                    },
                    false // (i set this to false) Replaces the current page in your browser history with the URL
                )
            } else if (this.actionType === ACTION_TYPES.TOAST) {
                const event = new ShowToastEvent({
                    variant: 'success',
                    message: this.actionDestination,
                });
                this.dispatchEvent(event);
                // } else if (this.type === ACTION_TYPES.TAB) {
            } else {
                console.log('missing or invalid actionType');
            }
            this.template.querySelector('.cardBody').classList.add('finished');
            this.isClicked = true;
            // this.frontFace = true;
        }, this.delay);
    }

    handleTransitionEnd(event) {
        console.log('in handleTransitionEnd');
        this.frontFace = !this.frontFace;
    }
}