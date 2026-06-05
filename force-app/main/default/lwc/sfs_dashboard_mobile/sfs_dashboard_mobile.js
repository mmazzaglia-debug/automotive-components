import { LightningElement, track, api, wire  } from 'lwc';
import fetchDemoChartSFS from '@salesforce/apex/serviceAppointmentSearchController.fetchDemoChartSFSlist';
import CURRENCY_CODE from '@salesforce/i18n/currency';
import LOCALE from '@salesforce/i18n/locale';

export default class De_is_sfsLwcDashboard extends LightningElement {
@api Title;
@track demoChart = [];
@track listOfDemoCharts = [];

get isdemoChart(){
    return this.listOfDemoCharts.length > 0;
}

@wire(fetchDemoChartSFS,{})
fetchDemoChartSFS({ error, data }) {
    if (data) {
        this.demoChart = data;
        this.error = undefined;
        console.log('activityScoreCard- fetchDemoChartSFS:  DemoChart Details '+JSON.stringify(this.demoChart)+' length '+this.demoChart.length);

        let listofDemoChart=[];
        for(let i=0; i<this.demoChart.length; i++){
            let objDemo = {};
            if(this.demoChart[i].Show_Chart__c){
                objDemo.Id = this.demoChart[i].Id;
                objDemo.Label = this.demoChart[i].MasterLabel;
                objDemo.Max = this.demoChart[i].Max__c;
                objDemo.Percentage = (this.demoChart[i].Value__c/this.demoChart[i].Max__c)*100;
                objDemo.Value = this.demoChart[i].Value__c;
                objDemo.Type = this.demoChart[i].Type__c;
                objDemo.ShowChart = this.demoChart[i].Show_Chart__c;
            }
            else {
                objDemo.Id = this.demoChart[i].Id;
                objDemo.Label = this.demoChart[i].MasterLabel;
                objDemo.Max = this.demoChart[i].Max__c;
                objDemo.Percentage = (this.demoChart[i].Value__c/this.demoChart[i].Max__c)*100;
                objDemo.Type = this.demoChart[i].Type__c;
                objDemo.ShowChart = this.demoChart[i].Show_Chart__c;
                if(this.demoChart[i].Type__c === 'Currency'){
                    objDemo.Value = this.demoChart[i].Value__c;
                    objDemo.Value = new Intl.NumberFormat(LOCALE, {
                        style: 'currency',
                        currency: CURRENCY_CODE,
                        currencyDisplay: 'symbol'
                    }).format(this.demoChart[i].Value__c);
                }
                else {
                    objDemo.Value = this.demoChart[i].Value__c;
                }
            }
            
            listofDemoChart.push(objDemo);
        }
        this.listOfDemoCharts = listofDemoChart;

    } else if (error) {
        this.error = error;
        this.demoChart = undefined;
    }
}
}