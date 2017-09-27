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
    private barChartData: Array<any> = [];
    getItems(): Observable <any> {
		return this.http.get('https://59cb9ad4a4bf0b0011118636.mockapi.io/rowData')
			.map((res:any) => res.json());
    }

	constructor(private http:Http) {
		this.getItems().subscribe(data => this.barChartData = data);
	}
}
