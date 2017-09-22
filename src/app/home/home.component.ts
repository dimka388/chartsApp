import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-home',
	moduleId: module.id,
	templateUrl: 'home.component.html',
	styleUrls: ['home.component.scss']
})

export class HomeComponent {
	private src: string = 'https://59c4b5fed201270011552fec.mockapi.io/items';
	private barChartData: Array<any>;
	
	getItems(): Observable <any> {
		return this.http.get(this.src)
			.map((res:any) => res.json());
	}

	constructor(private http:Http) {
		this.getItems().subscribe(data => this.barChartData = data);
	}
}
