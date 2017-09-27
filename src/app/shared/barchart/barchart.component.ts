import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
	selector: 'app-barchart',
	moduleId: module.id,
	templateUrl: 'barchart.component.html',
	styleUrls: ['barchart.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class BarchartComponent implements OnInit, OnChanges {
	@Input() private data: Array<any> = [];
	@ViewChild('chart') private chartContainer: ElementRef;
	@ViewChild('slider') private sliderContainer: ElementRef;

	dataLoaded: boolean = false;

	private chartBars: any;
	private chartLines: any;
	private chartWidth: number;
	private chartHeight: number;
	private barsLenght: number = 20;
	private barsValues: string = 'spend';
	private linesValues: string = 'pareto';
	private currentData: Array<any>;
	private line: any;
	private sliderBar: any;
	private sliderHanlde: any;
	private slidertWidth: number;
	private slidertHeight: number;
	private sliderValue: number = 0;
	private xScale: any;
	private leftScale: any;
	private rightScale: any;
	private leftAxis: any;
	private rightAxis: any;
	
	ngOnInit() {
		this.createChart();
	}

	ngOnChanges() {
		if (this.data.length) {
			this.dataLoaded = true;
			this.createSlider();
			this.onSliderChange();
			this.updateChart(true);
		}
	}

	createChart() {
		let chartElement = this.chartContainer.nativeElement;
		this.chartWidth = chartElement.offsetWidth;
		this.chartHeight = chartElement.offsetHeight;

		let chartSvg = d3.select(chartElement).append('svg')
			.attr('width', this.chartWidth)
			.attr('height', this.chartHeight)
			.on("wheel", () => {
				d3.event.preventDefault();
				this.sliderValue += d3.event.deltaY / 100;
				if (this.sliderValue < 0) {
					this.sliderValue = 0
				}
				if (this.sliderValue > this.data.length - this.barsLenght) {
					this.sliderValue = this.data.length - this.barsLenght;
				}
				this.onSliderChange();
			});

		// chart plot area
		this.chartBars = chartSvg.append('g')
			.attr('class', 'bars');
		this.chartLines = chartSvg.append('g')
			.attr('transform', 'translate(10, 0)')
			.attr('class', 'lines');

		// create scales
		this.xScale = d3.scaleLinear()
			// .padding(0.1)
			.range([0, this.chartWidth]);
		this.leftScale = d3.scaleLinear()
			.range([this.chartHeight, 0]);
		this.rightScale = d3.scaleLinear()
			.range([this.chartHeight, 0]);

		// add lines
		this.chartLines.append("path")
			.attr("class", "line");

		this.line = d3.line()
			.x((d, i) => this.xScale(i))
			.y((d, i) => this.rightScale(Math.max(1, d[this.linesValues])))
			.curve(d3.curveMonotoneX);

		// axis
		this.leftAxis = chartSvg.append('g');
		this.rightAxis = chartSvg.append('g')
			.attr('transform', `translate(${this.chartWidth - 1}, 0)`);
	}

	createSlider() {
		let sliderElement = this.sliderContainer.nativeElement;
		this.slidertWidth = sliderElement.offsetWidth;
		this.slidertHeight = sliderElement.offsetHeight;

		let sliderSvg = d3.select(sliderElement).append('svg')
			.attr('width', this.slidertWidth)
			.attr('height', this.slidertHeight)
			.attr('transform', 'translate(0,-' + this.slidertHeight / 2 + ')');

		// slider plot area
		let slider = sliderSvg.append("g");

		this.sliderBar = d3.scaleLinear()
			.domain([0, this.data.length - this.barsLenght])
			.range([0, this.slidertWidth - this.slidertHeight])
			.clamp(true);

		// create track
		slider.append("rect")
			.attr("class", "track")
			.attr("x", 0)
			.attr("width", this.slidertWidth)
			.attr("height", this.slidertHeight)
			.call(d3.drag()
				.on("start.interrupt", () => slider.interrupt())
				.on("start drag", () => {
					this.sliderValue = Math.round(this.sliderBar.invert(d3.event.x));
					this.onSliderChange();
			}));

		// create handle
		this.sliderHanlde = slider.insert("rect", ".track")
			.attr("class", "handle")
			.attr("x", 0)
			.attr("width", this.slidertHeight)
			.attr("height", this.slidertHeight);
	}

	onSliderChange() {
		let start = this.sliderValue;
		let end = start + this.barsLenght;
		this.currentData = this.data.slice(start, end);
		this.sliderHanlde.attr("x", this.sliderBar(this.sliderValue));
		this.updateChart(false);
	}

	updateChart(state: boolean) {
		// update scales & axis
		this.xScale.domain([0, this.currentData.length]);
		if (state) {
			this.leftScale.domain([0, d3.max(this.data, d => Math.max(1, d[this.barsValues]))]);
			this.rightScale.domain([0, d3.max(this.data, d => Math.max(1, d[this.linesValues]))]);
			this.leftAxis.call(d3.axisRight(this.leftScale));
			this.rightAxis.call(d3.axisLeft(this.rightScale));
		}

		this.chartLines.selectAll('.line')
			.datum(this.currentData)
			.attr("d", this.line);


		let update = this.chartBars.selectAll('.bar')
			.data(this.currentData);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chartBars.selectAll('.bar')
			.attr('x', (d, i) => this.xScale(i))
			.attr('y', d => this.leftScale(Math.max(1, d[this.barsValues])))
			.attr('height', d => this.chartHeight - this.leftScale(Math.max(1, d[this.barsValues])));

		// add new bars
		update
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d, i) => this.xScale(i))
			.attr('y', d => this.leftScale(Math.max(1, d[this.barsValues])))
			.attr('height', d => this.chartHeight - this.leftScale(Math.max(1, d[this.barsValues])));
	}

	constructor() { }
}
