import { LightningElement, api } from 'lwc';
export default class CxInCustomGuidanceCenterRatings extends LightningElement {
    @api ratingValue;

    rating(){
        this.ratingVal= Math.floor(this.ratingValue);
        // console.log("Rating",this.ratingVal);
    }
    connectedCallback() {
        this.rating();
    }

    get isRating1() {
        return this.ratingVal == "1";
    }

    get isRating2() {
        return this.ratingVal == "2";
    }

    get isRating3() {
        return  this.ratingVal== "3";
    }

    get isRating4() {
        return  this.ratingVal == "4";
    }

    get isRating5() {
        return this.ratingVal == "5";
    }

}