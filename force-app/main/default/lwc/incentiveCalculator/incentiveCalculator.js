import { LightningElement, track, api } from 'lwc';
import CHARTJS from '@salesforce/resourceUrl/ChartJs';
import CHARTJSGAUGE from '@salesforce/resourceUrl/ChartJSGauge';
import DATALABELS from '@salesforce/resourceUrl/datalabels';
import { loadScript } from 'lightning/platformResourceLoader';


export default class incentiveCalculatorNotWorking extends LightningElement {
    @track targetIncentiveValue = 5; 

    @api targetMinValue = 0;
    @api targetMaxValue = 400000;
    @api incentiveMinValue = 0 ;
    @api incentiveMaxValue = 30;
    @api defaultSalesTarget = 200000;
    @api defaultOpporunityWon = 140000;
    @api defaultIncentivePercentage = 5;

    @track targetValue = 2000000;
    @track moneyValue = 0; // Assuming you added this from the previous step
    @track opportunityValue = 1400000;
    @track amount = 0; // This will store the entered amount
    @track calculatedIncentive = 0; // This will store the calculated incentive
		@track calculatedTargetAttainment = 0;
    
    chartjsInitialized = false;
    calculatedValue = this.targetIncentiveValue; // Your calculation logic

	renderedCallback() {
    if (this.chartjsInitialized) {
        return;
    }
    this.chartjsInitialized = true;

    Promise.all([
        loadScript(this, CHARTJS),
        loadScript(this, CHARTJSGAUGE),
				loadScript(this, DATALABELS)
				
    ])
    .then(() => {
       //
       this.targetIncentiveValue = this.defaultIncentivePercentage;
       this.targetValue = this.defaultSalesTarget;
       this.opportunityValue = this.defaultOpporunityWon;
       this.calculatedValue = this.targetIncentiveValue;

       //

        this.initializeChart();
    })
    .catch(error => {
        console.error("Error loading library", error);
    });
}

  initializeChart() {
    const ctx = this.template.querySelector('.canvas-holder canvas').getContext('2d');
    this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [this.calculatedValue, 100 - this.calculatedValue],
								backgroundColor: ['#0e8a69', '#f39b04'],
								borderColor: ['#F4F6F8', '#F4F6F8'], 
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: true,
                position: 'top',
            },

            animation: {
                animateScale: true,
                animateRotate: true
            },
            cutoutPercentage: 40,
						    plugins: {
								datalabels: {
										formatter: (value, ctx) => {
												let sum = ctx.dataset._meta[0].total;
												let percentage = (value * 100 / sum).toFixed(2) + "%";  // Convert the value into percentage
												return percentage;
										},
										color: '#000',   // Color of the text
								}
						},
						    afterDraw: function(chart) {
            if (chart.config.type !== 'doughnut') return; // Ensure this only runs for doughnut type
            let ctx = chart.ctx;
            let width = chart.width;
            let height = chart.height;
            ctx.restore();

            let fontSize = Math.min(width, height) / 10; // Adjust this value to get the desired font size
            ctx.font = fontSize + "px sans-serif";
            ctx.textBaseline = "middle";

            let text = "30%",
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2;

            ctx.fillStyle = "#000";  // Adjust the color accordingly
            ctx.fillText(text, textX, textY);
            ctx.save();
    }
        }
    });

    // For the gauge chart
    const gaugeCtx = this.template.querySelector('.gauge-holder canvas').getContext('2d');
    this.gaugeChartInstance = new Chart(gaugeCtx, {
        type: 'gauge',
        data: {
            labels: ['Below Range', 'In Range', 'Above Range'],
            datasets: [{
                data: [30, 20, 10],
                value: this.calculatedValue,
               // backgroundColor: ['#261089', '#4723EB', '#F0EBFD'],
								backgroundColor: ['#f39b04', '#0e8a69', '#006699'],
								borderColor: ['#F4F6F8', '#F4F6F8', '#F4F6F8'],
                borderWidth: 2,
                //borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            rotation: 5/6 * Math.PI,
            circumference: 4/3 * Math.PI,

            animation: {
                animateScale: true,
                animateRotate: true
            },
            needle: {
                radiusPercentage: 3,
                widthPercentage: 5.2,
                lengthPercentage: 10,
                color: '#CCCCCC'
            },
            // Add annotation configuration
            annotation: {
                annotations: [
                    {
                        type: 'text',
                        position: 'center', // This would ideally position it at the center of each segment
                        content: 'Below Range'
                    },
                    {
                        type: 'text',
                        position: 'center',
                        content: 'In Range'
                    },
                    {
                        type: 'text',
                        position: 'center',
                        content: 'Above Range'
                    }
                ]
            }
        }
    });
			this.sliderChange();
}


    
		    randomizeData() {
        if (this.chartInstance) {
            let randomValue = Math.random() * 30; // Generating random value between 0 to 30
            this.chartInstance.data.datasets[0].data = [randomValue];
            this.chartInstance.update();
        }
    }
    handleOpportunityChange(event) {
        this.opportunityValue = event.target.value;
			this.sliderChange();
    }

    handleSliderChange(event) {
        this.targetIncentiveValue = event.target.value;
        this.calculatedValue = this.targetIncentiveValue ;  // your calculation logic
    this.sliderChange();

    }


    handleTargetChange(event) {
        this.targetValue = event.target.value;
        this.sliderChange(); 
    }

    calculateIncentive() {
        // For demonstration purposes, let's assume the incentive is 10% of the amount entered.
        this.calculatedIncentive = this.amount * 0.10;
    }
		
		sliderChange(){
						this.calculateTargetAttainment();
				        if (this.chartInstance) {
            // Update the chart data
            this.chartInstance.data.datasets[0].data = [this.calculatedTargetAttainment, 100- this.calculatedTargetAttainment];
            this.gaugeChartInstance.data.datasets[0].value = this.calculatedValue;
						
            // Refresh the chart to reflect the new data
            this.chartInstance.update();
						this.gaugeChartInstance.update();
						this.calculatedIncentive = this.opportunityValue * this.targetIncentiveValue/100;
        }
		}
		
calculateTargetAttainment(){
    try {
        let value = (this.opportunityValue / this.targetValue) * 100;

        if (value > 100) {
            this.calculatedTargetAttainment = 100;
        } else if (value < 0) {
            this.calculatedTargetAttainment = 0;
        } else {
            this.calculatedTargetAttainment = value;
        }

        console.log('calculateTargetAttainment - Target Attainment Value', this.targetValue);
				console.log('calculateTargetAttainment - Oppurtunity  Value', this.opportunityValue);
				console.log('calculateTargetAttainment - Calculated  Value', this.calculatedTargetAttainment);
    } catch (error) {
        console.error('Error in calculateTargetAttainment:', error.message);
    }
}


		


}