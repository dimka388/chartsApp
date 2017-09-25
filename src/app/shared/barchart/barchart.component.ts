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

	private chartBars: any;
	private chartLines: any;
	private chartWidth: number;
	private chartHeight: number;
	private barsLenght: number = 55;
	private barWidth: number = 20;
	private currentData: Array<any>;
	private slider: any;
	private sliderX: any;
	private sliderHanlde: any;
	private slidertWidth: number;
	private slidertHeight: number;
	private sliderValue: number = 0;
	private barScaleX: any;
	private barScaleY: any;
	private line: any;
	private lineScaleX: any;
	private lineScaleY: any;
	private xAxis: any;
	private yAxis: any;
	private rightAxis: any;
	
	
	ngOnInit() {
		this.createChart();
	}

	ngOnChanges() {
		if (this.data.length) {
			if (this.data.length > this.barsLenght) {
				this.createSlider();
				this.onSliderChange();
			} else {
				this.currentData = this.data;
			}
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
			.attr('transform', `translate(10, 0)`)
			.attr('class', 'lines');

		// create scales
		this.barScaleX = d3.scaleLinear()
			.range([0, this.chartWidth]);
		this.barScaleY = d3.scaleLinear()
			.range([this.chartHeight, 0]);

		this.lineScaleX = d3.scaleLinear()
			.range([0, this.chartWidth]);
		this.lineScaleY = d3.scaleLinear()
			.range([this.chartHeight, 0]);
		
		this.chartLines.append("path")
			.attr("class", "line");
		this.line = d3.line()
			.x((d, i) => this.lineScaleX(i))
			.y((d, i) => this.lineScaleY(Math.max(1, d['Apax Currency Spend'])))
			.curve(d3.curveCatmullRom);

		// axis
		this.yAxis = chartSvg.append('g')
			// .attr('transform', `translate(0, 0)`)
			.call(d3.axisRight(this.barScaleY));
		this.rightAxis = chartSvg.append('g')
			.attr('transform', `translate(${this.chartWidth - 1}, 0)`)
			.call(d3.axisLeft(this.lineScaleY));
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
		this.barScaleX.domain([0, this.currentData.length]);
		this.barScaleY.domain([0, d3.max(this.currentData, d => Math.max(1, d['Apax Currency Spend']))]);
		this.lineScaleX.domain([0, this.currentData.length]);
		this.lineScaleY.domain([0, d3.max(this.currentData, d => Math.max(1, d['Apax Currency Spend']))]);

		this.chartLines.selectAll('.line')
			.datum(this.currentData)
			.attr("d", this.line);

		this.yAxis.call(d3.axisRight(this.barScaleY));
		this.rightAxis.call(d3.axisRight(this.lineScaleY));

		let update = this.chartBars.selectAll('.bar')
			.data(this.currentData);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chartBars.selectAll('.bar')
			// .attr('x', d => this.barScaleX(d['Vendor Name']))
			.attr('x', (d, i) => this.barScaleX(i))
			.attr('y', d => this.barScaleY(Math.max(1, d['Apax Currency Spend'])))
			.attr('width', this.barWidth)
			.attr('height', d => this.chartHeight - this.barScaleY(Math.max(1, d['Apax Currency Spend'])));

		// add new bars
		update
			.enter()
			.append('rect')
			.attr('class', 'bar')
			// .attr('x', d => this.barScaleX(d['Vendor Name']))
			.attr('x', (d, i) => this.barScaleX(i))
			.attr('y', d => this.barScaleY(Math.max(1, d['Apax Currency Spend'])))
			.style('fill', 'rgb(244, 178, 122)')
			.attr('width', this.barWidth)
			.attr('height', d => this.chartHeight - this.barScaleY(Math.max(1, d['Apax Currency Spend'])));
	}

	constructor() { }
}
