import { Component, ViewChild, Input } from '@angular/core';

import { EmploiTemps } from '../model/emploiTemps';
import { Jour } from '../model/jour';

import * as moment from 'moment';

@Component({
	selector: 'et-canvas',
	template: '<canvas #myCanvas [width]="width" [height]="height"></canvas>'
})
export class EtCanvasComponent {
	@ViewChild('myCanvas') canvasRef;
	@Input() data;

	width: number = 800;
	height: number = 400;

	ctx: CanvasRenderingContext2D;

	constructor() { }

	ngAfterViewInit() {
		this.ctx = this.canvasRef.nativeElement.getContext('2d');

		this.drawLegend();
	}

	drawLegend(): void {
		let hspace = 30;
		let wspace = 30;
		let jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

		this.ctx.strokeStyle = "#000";

		this.ctx.beginPath();
		this.ctx.moveTo(this.width, hspace);
		this.ctx.lineTo(wspace, hspace);
		this.ctx.lineTo(wspace, this.height);

		this.ctx.stroke();

		let woo = (this.width - hspace) / jours.length; // width of one
		let wc = woo / 3;
		this.ctx.font = "18px Arial";

		let i = 0;
		for (let j of jours) {
			this.ctx.fillText(j, woo * i++ + wc, hspace - 8); // total width: (width - 20) / 5
		}
	}
}