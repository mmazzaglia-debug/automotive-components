import { api, LightningElement, track, wire } from 'lwc';

import SUMMARY_FIELD from '@salesforce/schema/SDO_Einstein_GPT_Configuration__c.Work_Summary__c';
import ISSUE_FIELD from '@salesforce/schema/SDO_Einstein_GPT_Configuration__c.Work_Issue__c';
import RESOLUTION_FIELD from '@salesforce/schema/SDO_Einstein_GPT_Configuration__c.Work_Resolution__c';

export default class gptSummarization extends LightningElement {
    @api recsApplied = false;
    @api isLoaded = false;
    @api gptConfiguration;

    numberofColumns = 1;
    fields = [SUMMARY_FIELD,ISSUE_FIELD,RESOLUTION_FIELD];
 
    handleClick (event) {
        this.recsApplied = true;

        setTimeout(() => {
            this.isLoaded = true;
        }, 2000);
    }

}