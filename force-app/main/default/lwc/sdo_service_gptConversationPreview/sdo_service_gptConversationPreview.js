import { LightningElement, api, track, wire } from "lwc";
import getGPTConfiguration from "@salesforce/apex/SDO_Service_GPTController.getGPTConfiguration";
import getSimulatedReplies from "@salesforce/apex/SDO_Service_GPTController.getSimulatedReplies";


export default class sdo_service_gptConversationPreview extends LightningElement {
    @api recordId;
    @track messages = []; // Tracks the array of messages
    @wire(getGPTConfiguration, { configurationId: '$recordId' }) 
        wiredRecordMethod({ error, data }) {
            if (data) {
                this.configurationData  = data;    
                this.error = undefined;
            } else if (error) {
                this.error = error;
                this.configurationData  = undefined;
            }
        }
        
    @wire(getSimulatedReplies, { configurationId: '$recordId' })
        wiredMessagesMethod({ error, data }) {
            if (data) {
                this.conversationData  = data;
                this.getConversation();
                this.error = undefined;
            } else if (error) {
                this.error = error;
                this.conversationData  = undefined;
            }
        }

    getConversation(){
        let sessionStarted = this.setMessage("Start", "", "", false); // Logs session start 
        this.messages.push(sessionStarted);
        let startMessage = '';

        //Now find the starting message 
        for(let message in this.conversationData){
            if(this.conversationData[message].Message_Type__c == 'Start'){
                startMessage = this.setMessage(
                    "Inbound",
                    this.conversationData[message].Message__c,
                    this.configurationData?.Service_Contact_Name__c,
                    this.conversationData[message].End_Messaging_Session__c
                );

                this.messages.push(startMessage); // Publishes the starting message
            } 
        }

        //Now find the next message in the sequence
        let lastMessage = startMessage;
        for(let i = 0; i < this.conversationData.length-1; i++){

            let temp = this.conversationData.find((item) => lastMessage.messageBody.toLowerCase().includes(item.Keyword__c.toLowerCase()));

            let sender = '';
            if(temp.Message_Type__c == 'Inbound'){
                sender = this.configurationData?.Service_Contact_Name__c;
            } else if (temp.Message_Type__c == 'Outbound'){
                sender = this.configurationData?.Service_Agent_Name__c;
            }

            let nextMessage = this.setMessage(
                temp.Message_Type__c,
                temp.Message__c,
                sender,
                temp.End_Messaging_Session__c,
            ); 
            this.messages.push(nextMessage);
            lastMessage = nextMessage;

        }

        let sessionEnded = this.setMessage("End", "", lastMessage.name, true); // Logs session end
        this.messages.push(sessionEnded);
    }
       
    setMessage(type, messageBody, sender, endChat) {
        let message = {
            type: type,
            messageBody: messageBody,
            name: sender,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            endChat: endChat,
            typingTime: 1000
        };
        return message;
    }
}