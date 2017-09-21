import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
	moduleId: module.id,
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  private barChartData: Array<any>;

  constructor() {}

  ngOnInit() {
    // give everything a chance to get loaded before starting the animation to reduce choppiness
    this.generateData();
    setTimeout(() => {
      this.generateData();

      // change the data periodically
      setInterval(() => this.generateData(), 3000);
    }, 1000);
  }

  generateData() {
    this.barChartData = [];
    for (let i = 0; i < 20; i++) {
      this.barChartData.push([
        `${i+1}`,
        Math.floor(Math.random() * 100),
        2000 - 100 * i
      ]);
    }
    // this.barChartData.sort((a, b) => b[1] - a[1]);
  }
}
