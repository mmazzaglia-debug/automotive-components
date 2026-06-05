import { LightningElement, api, track, wire } from "lwc";
import getGPTConfiguration from "@salesforce/apex/SDO_Service_GPTController.getGPTConfiguration";
import getSimulatedReplies from "@salesforce/apex/SDO_Service_GPTController.getSimulatedReplies";


export default class sdo_service_gptConversation extends LightningElement {
    @track messages = []; // Tracks the array of messages
    @api gptConfiguration;
    @wire(getGPTConfiguration, { configurationId: '$gptConfiguration' }) 
        wiredRecordMethod({ error, data }) {
            if (data) {
                this.configurationData  = data;    
                this.error = undefined;
            } else if (error) {
                this.error = error;
                this.configurationData  = undefined;
            }
        }

    @wire(getSimulatedReplies, { configurationId: '$gptConfiguration' }) 
        wiredMessagesMethod({ error, data }) {
            if (data) {
                this.conversationData  = data;
                this.getFirstMessage();
                this.error = undefined;
            } else if (error) {
                this.error = error;
                this.conversationData  = undefined;
            }
        }
       

    async connectedCallback() {
        this.addEventListeners(); // Adds event listeners when the component is connected
    }

    addEventListeners() {
        // Adds event listeners for outbound messages
        window.addEventListener("outboundmessage", this.handleMessage);
    }

    getFirstMessage(){
        let sessionStarted = this.setMessage("Start", "", false); // Logs session start in conversation window
        this.publishMessage(sessionStarted); // Publishes the session started 

        for(let message in this.conversationData){
            //Now find the starting message 
            if(this.conversationData[message].Message_Type__c == 'Start'){
               let startMessage = this.setMessage(
                    "Inbound",
                    this.conversationData[message].Message__c,
                    this.configurationData?.Service_Contact_Name__c,
                    this.conversationData[message].End_Messaging_Session__c
                );

                this.publishMessage(startMessage); // Publishes the starting message
                this.shareMessage(startMessage); // Shares the starting message
            } 
        }
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

    // Gets the next message based on the last keyword
    getNextMessage(currentMessage) {
        
        if(currentMessage.endChat) {
            //if the last message is from the agent 
            let last = this.setMessage(
                "End",
                "",
                this.configurationData.Service_Agent_Name__c,
                true,
            ); 
            this.shareMessage(last);
            
        } else {
            let nextMessage = this.conversationData.find((item) => currentMessage.messageBody.toLowerCase().includes(item.Keyword__c.toLowerCase()));

            let inboundMessage = this.setMessage(
                nextMessage.Message_Type__c,
                nextMessage.Message__c,
                this.configurationData.Service_Contact_Name__c,
                nextMessage.End_Messaging_Session__c,
            ); 
            
            this.shareMessage(inboundMessage);
            setTimeout(() => {
                this.publishMessage(inboundMessage, 1000); // Publishes the inbound message after a delay
            }, 2000);

            if(nextMessage.End_Messaging_Session__c ){
                let sessionEnded = this.setMessage("End", "", this.configurationData.Service_Contact_Name__c, true); // Logs session end in conversation window
                setTimeout(() => {
                    this.publishMessage(sessionEnded, 2000); // Publishes the session ended 
                }, 3000);
            }
        }  
        
    }

    endMessagingSession(){
        let sessionEnded = this.setMessage("End", "", this.configurationData.Service_Agent_Name__c, true); // Logs session end in conversation window
        this.publishMessage(sessionEnded, 1000); // Publishes the session ended 
            
    }

    publishMessage(message, typingTime) {
        this.messages.push(message);
        this.scrollToBottom(typingTime);
    }

    // Shares the inbound message
    shareMessage(inboundMessage) {
        let event = new CustomEvent("inboundmessage", {
            detail: {
                value: inboundMessage
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event); // Dispatches the inboundMessage event
    }

    // Handles the outbound message event.
    handleMessage = (event) => {
        let type = event.detail.type;
        let recommendedReply = event.detail.value;

        // Enter hit on keyboard
        let fkEvent = { keyCode: 13 };
        switch (type) {
            case "Post":
                this.draftMessage = recommendedReply;
                this.handleKeystroke(fkEvent);
                break;
            case "Edit":
                this.draftMessage = recommendedReply;
                this.updateTextArea(recommendedReply);
                break;
            default:
                console.log(`Type not recognized: ${type}.`);
        }
    };

    // Handles the input change event.
    handleInputChange(event) {
        this.draftMessage = event.target.value;
    }

    // Handles the keystroke event.
    handleKeystroke(event) {
        let keyCode = event.keyCode;
        let gptRec = '';
        if (keyCode === 13) {

            const last = this.conversationData.find(({ End_Messaging_Session__c }) => End_Messaging_Session__c === true);
            let flag = false;
            
            if(this.draftMessage.includes(last.Message__c)){
                //only if last message from agent
                gptRec = this.conversationData.find((item) => this.draftMessage.toLowerCase().includes(item.Message__c.toLowerCase()));
                flag = gptRec.End_Messaging_Session__c;
            } else {
                gptRec = this.conversationData.find((item) => this.draftMessage.toLowerCase().includes(item.Keyword__c.toLowerCase()));
            }
            
            let recommendedMessage = this.setMessage('Outbound', this.draftMessage, this.configurationData.Service_Agent_Name__c, flag);
            this.publishMessage(recommendedMessage, 0);
            this.clearTextArea();
            this.getNextMessage(recommendedMessage);
        }
    }


    updateTextArea(gptReply) {
        let textarea = this.template.querySelector("lightning-textarea");
        textarea.setRangeText(gptReply);
    }
    
    clearTextArea() {
        setTimeout(() => {
        [...this.template.querySelectorAll("lightning-textarea")].forEach((input) => {
            input.value = undefined;
        });
        }, 100);
    }

    // Scrolls to the bottom of the conversation after a delay.
    scrollToBottom(typingTime) {
        for (let i = 0; i < 1000; i++) {
            if (i < 900) {
                this.scroll(i);
            } else {
                this.scroll(typingTime);
            }
        }
    }

    // This method scrolls to the bottom of the chat window.
    scroll(wait) {
        setTimeout(() => {
            let el = this.template.querySelector(".scroller");
            el.scrollTop = el.scrollHeight;
        }, wait);
    }

}