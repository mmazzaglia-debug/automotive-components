import { LightningElement, wire, api, track } from 'lwc';
//import chartjs from '@salesforce/resourceUrl/FSL__ChartJS';canChartJS
import chartjs from '@salesforce/resourceUrl/canChartJS';
import { loadScript } from 'lightning/platformResourceLoader';

export default class ChartJs extends LightningElement {

    chart 
    @api _chartPoints = [] ;
    @api
    get chartPoints() {
            return this._chartPoints ; 
    }
    set chartPoints(newchartPoints){
        this._chartPoints = String(newchartPoints).split(',') ; 
    } 
		
    @api pointLabels    
    @api testParam
    @api isStepped
    @api _isSteppedBoolean
    @api hideVerticalAxis

    @api
    get isSteppedBoolean() {
        return this._isSteppedBoolean ; 
    }
    set isSteppedBoolean(isStepped) {
        this._isSteppedBoolean = (isStepped === 'true')
    }

    error;
    
    chartjsInitialized = false;

    data = {
        labels: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
        datasets: [{
            label: 'charge',
            data: this.chartPoints,
            borderColor: '#4723EB',
            pointStyle: false,
            //steppedLine: this._isSteppedBoolean,
            stepped: this._isSteppedBoolean,
            tension: (this._isSteppedBoolean ? 0 : 0.1)
        }]
    };

    configLine = {
        type: 'line',
        data: this.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            }, 
            scales: {
                xAxes: [{
                  type: 'time',
                }],
                yAxes: [{
                }]
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                filler: {
                    propagate: false,
                }
            },
            layout: {
                padding: 0
            },

            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    renderedCallback() {
        if (this.chartjsInitialized) {
            console.log('🇫🇷 Chart js has been initialized')
            return;
        }

        Promise.all([loadScript(this, chartjs)])
        .then(() => {

            // Set chart js as initialized to prevent from multiple loadings
            this.chartjsInitialized = true;

            // Getting chart canvas from HTML
            const ctx = this.template.querySelector('canvas.chart').getContext('2d');

            // Setting chartpoints and config
            this.data.datasets[0].data =  this.chartPoints;
            this.configLine.data = this.data ;

            // Creating chart object
            this.chart = new window.Chart(ctx, this.configLine);
        })
        .catch((error) => {
            this.error = error;
        });
    }

    @api
    handleUpdateChart(newChartPoints, newLabels) {

        console.log('🇫🇷 updating chart...') ;

        // Setting new points
        this.chartPoints = newChartPoints
        this.data.datasets[0].data =  this.chartPoints;

        // Setting new labels
        this.pointLabels = newLabels
        this.data.labels = this.pointLabels

        // Updating configLine object with new points and labels
        this.configLine.data = this.data ;

        // For stepped charts
        this.isSteppedBoolean = this.isStepped
        this.data.datasets[0].stepped = this.isSteppedBoolean
        //this.data.datasets[0].steppedLine = this.isSteppedBoolean

        // Hiding vertical axis (optional)
        if (this.hideVerticalAxis === 'true') {
            let yAxeConfig = [{
                gridLines: {
                  drawBorder: false,
                  tickMarkLength: 0,
                  color: "rgba(0, 0, 0, 0)"
                },
                ticks: {
                    //min: 0,
                    //max: 1.1,
                    //stepsize: 1,
                    display: false
                }
              }];
            this.configLine.options.scales.yAxes = yAxeConfig
        }

        // Redraw chart
        this.chart.update();

    }
}