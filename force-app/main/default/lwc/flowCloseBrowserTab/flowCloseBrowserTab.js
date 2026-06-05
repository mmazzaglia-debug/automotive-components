import { LightningElement } from 'lwc';
export default class FlowCloseBrowserTab extends LightningElement {
    connectedCallback() {
        window.close();
    }
}