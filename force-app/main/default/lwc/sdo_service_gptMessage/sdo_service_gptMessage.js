import { LightningElement, api, track } from "lwc";

export default class sdo_service_gptMessage extends LightningElement {
    @track _message;
    loading = true;
    type; //Start, Inbound, Outbound, End

    @api
    get message(){
        return this._message;
    }
    set message(value){
        this._message = value;
        if(value) {
            this.type = value.type;
            this.stopLoading(value.typingTime);
        }
    }

    get isStart(){
        return this.type === "Start";
    }

    get isInbound(){
        return this.type === "Inbound";
    }

    get isOutbound(){
        return this.type === "Outbound";
    }

    get isLast(){
        return this.type === "End";
    }

    stopLoading(timeoutValue) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          this.loading = false;
          this.notifyWindow();
        }, timeoutValue);
      }
      
    notifyWindow(){
        let event = new CustomEvent("posted", {
          detail: {
            value: true
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
    
    }
}