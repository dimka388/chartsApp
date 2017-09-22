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
	@Input() private data: Array<any>;
	@ViewChild('chart') private chartContainer: ElementRef;
	@ViewChild('slider') private sliderContainer: ElementRef;
	private chartBars: any;
	private chartLines: any;
	private chartWidth: number;
	private chartHeight: number;
	private barsLenght: number = 20;
	private currentData: Array<any>;
	private slider: any;
	private sliderX: any;
	private sliderHanlde: any;
	private slidertWidth: number;
	private slidertHeight: number;
	private sliderValue: number = 0;
	private barScaleX: any;
	private barScaleY: any;
	private lineScaleX: any;
	private lineScaleY: any;
	
	ngOnInit() {
		this.createChart();
		if (this.data) {
			if (this.data.length > this.barsLenght) {
				this.createSlider();
				this.onSliderChange();
			} else {
				this.currentData = this.data;
			}
			this.updateChart();
		}
	}

	ngOnChanges() {
		if (this.chartBars) {
			this.updateChart();
		}
	}

	createChart() {
		let chartElement = this.chartContainer.nativeElement;
		this.chartWidth = chartElement.offsetWidth;
		this.chartHeight = chartElement.offsetHeight;

		let chartSvg = d3.select(chartElement).append('svg')
			.attr('width', this.chartWidth)
			.attr('height', this.chartHeight);

		// chart plot area
		this.chartBars = chartSvg.append('g')
			.attr('class', 'bars');
		this.chartLines = chartSvg.append('g')
			.attr('class', 'lines');

		// define X & Y domains
		let xDomain = this.data.map(d => d.name);
		let yDomain = [0, d3.max(this.data, d => d.speed)];
		let lineDomainX = [0, this.data.length];
		let lineDomainY = [0, d3.max(this.data, d => d.pareto)];

		// create scales
		this.barScaleX = d3.scaleBand()
			.padding(0.1)
			.domain(xDomain)
			.rangeRound([0, this.chartWidth]);
		this.barScaleY = d3.scaleLinear()
			.domain(yDomain)
			.range([this.chartHeight, 0]);
		this.lineScaleX = d3.scaleLinear()
			.domain(lineDomainX)
			.range([0, this.chartWidth]);
		this.lineScaleY = d3.scaleLinear()
			.domain(lineDomainY)
			.range([this.chartHeight, 0]);
	}

	createSlider() {
		let sliderElement = this.sliderContainer.nativeElement;
		this.slidertWidth = sliderElement.offsetWidth;
		this.slidertHeight = sliderElement.offsetHeight;

		let sliderSvg = d3.select(sliderElement).append('svg')
			.attr('width', this.slidertWidth)
			.attr('height', this.slidertHeight)
			.attr("transform", "translate(0,-" + this.slidertHeight / 2 + ")");

		// slider plot area
		this.slider = sliderSvg.append("g");
	
		// define x domain
		this.sliderX = d3.scaleLinear()
			.domain([0, this.data.length - this.barsLenght])
			.range([0, this.slidertWidth - this.slidertHeight])
			.clamp(true);

		// create track
		this.slider.append("rect")
			.attr("class", "track")
			.attr("x", 0)
			.attr("width", this.slidertWidth)
			.attr("height", this.slidertHeight)
			.call(d3.drag()
				.on("start.interrupt", () => this.slider.interrupt())
				.on("start drag", () => {
					this.sliderValue = Math.round(this.sliderX.invert(d3.event.x));
					this.onSliderChange();
			}));

		// create handle
		this.sliderHanlde = this.slider.insert("rect", ".track")
			.attr("class", "handle")
			.attr("x", 0)
			.attr("width", this.slidertHeight)
			.attr("height", this.slidertHeight);
	}

	onSliderChange() {
		let start = this.sliderValue;
		let end = start + this.barsLenght;
		this.currentData = this.data.slice(start, end);
		this.updateChart();
		this.sliderHanlde.attr("x", this.sliderX(this.sliderValue));
	}

	updateChart() {
		// update scales & axis
		this.barScaleX.domain(this.currentData.map(d => d.name));
		this.barScaleY.domain([0, d3.max(this.currentData, d => d.speed)]);

		let update = this.chartBars.selectAll('.bar')
			.data(this.currentData);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chartBars.selectAll('.bar')
			.attr('x', d => this.barScaleX(d.name))
			.attr('y', d => this.barScaleY(d.speed))
			.attr('width', d => this.barScaleX.bandwidth())
			.attr('height', d => this.chartHeight - this.barScaleY(d.speed));

		// add new bars
		update
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', d => this.barScaleX(d.name))
			.attr('y', d => this.barScaleY(d.speed))
			.style('fill', 'rgb(244, 178, 122)')
			.attr('width', d => this.barScaleX.bandwidth())
			.attr('height', d => this.chartHeight - this.barScaleY(d.speed));

		var line = d3.line()
			.x((d, i) => this.lineScaleX(i))
			.y((d, i) => this.lineScaleY(i))
			.curve(d3.curveMonotoneX);
		
		this.chartLines.append("path")
			.datum(this.currentData)
			.attr("class", "line")
			.attr("d", line);

	}

	constructor() { }
}
