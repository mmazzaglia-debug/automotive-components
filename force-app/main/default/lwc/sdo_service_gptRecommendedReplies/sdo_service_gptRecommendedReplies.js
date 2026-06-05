import { LightningElement, api, wire } from "lwc";
import getGPTConfiguration from "@salesforce/apex/SDO_Service_GPTController.getGPTConfiguration";
import getSimulatedReplies from "@salesforce/apex/SDO_Service_GPTController.getSimulatedReplies";

export default class sdo_service_gptRecommendedReplies extends LightningElement {
    state = "empty"; //  empty | active | complete
    thinking = true;
    containerHeight = 200;
    wordCount = 0;
    messageInt = 1;
    suggestedMessage = "";
    
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
                this.getRecommendedReply();
                this.error = undefined;
            } else if (error) {
                this.error = error;
                this.conversationData  = undefined;
            }
        }

    connectedCallback() {
        this.addEventListeners();
    }
        
    addEventListeners() {
        // Subscribe to the inboundmessage custom event that is fired everytime a message posts to the chat window
        window.addEventListener("inboundmessage", this.handleMessage);
    }


    getRecommendedReply(message, wait) {
      console.log('Message variable:', message);
      if (message){
        let gptRec = this.conversationData.find((item) => message.toLowerCase().includes(item.Keyword__c.toLowerCase()));
        setTimeout(() => {
          this.suggestedMessage = "";
          this.setState("active");
          this.typeMessage(gptRec.Message__c);
      }, wait + 1000);
      }
        
    }

    // Handle inbound messages as they come in from the main chat window
    handleMessage = (event) => {
        let inboundMessage = event.detail.value;

        if(inboundMessage.type == 'End'){
          this.endChat(0);
        }

        setTimeout(() => {
          if (inboundMessage.endChat) {
              this.endChat(inboundMessage.typingTime);
          } else {
              this.getRecommendedReply(inboundMessage.messageBody, inboundMessage.typingTime);
          }
        }, inboundMessage.typingTime + 1000);
    };

    endChat(wait) {
        setTimeout(() => {
        this.setState("complete");
        }, 700);
    }

    // Organize state changes
    setState(value) {
        this.state = value;
    }
    
    typeMessage(value) {
        this.typing = true;
        let speed = 15;
        let words = value.split(" ");
        if (this.wordCount < words.length) {
          setTimeout(() => {
            this.suggestedMessage += words[this.wordCount] + " ";
            this.wordCount++;
            
            setTimeout(() => {
              this.typeMessage(value);
            }, speed);
          }, 25);
        } else {
          this.typing = false;
          this.thinking = false;
          this.wordCount = 0;
        }
      }
    
      pushMessage(event) {
        this.thinking = true;
        let type = event.currentTarget.dataset.type;
        let customEvent = new CustomEvent("outboundmessage", {
          detail: {
            type: type,
            value: this.suggestedMessage
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(customEvent);
      }
    
      get showEmptyState() {
        return this.state === "empty";
      }
    
      get showActiveState() {
        return this.state === "active";
      }
    
      get showCompleteState() {
        return this.state === "complete";
      }
    
      get containerStyle() {
        return `min-height:${this.containerHeight}px;`;
      }
    
      get containerClass() {
        return this.state !== "empty" ? " slds-grid slds-wrap slds-align_absolute-center" : "slds-grid slds-wrap";
      }
    
      get messageStyle() {
        return this.thinking && !this.typing ? "text-weak" : "";
      }
    
      get messageContainer() {
        return this.suggestedMessage === "" ? "chat-message-container" : "chat-message-container";
      }
    
}