import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {Evenement} from '../model/evenement';

@Component({
  selector: 'evenement',
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.css']
})
export class EvenementComponent implements AfterViewInit {
  @Input() ev: Evenement;
  @Input() source: any;

  @ViewChild('evRow') evRow: ElementRef;

  limitHeight: boolean;

  ngAfterViewInit() {
    setTimeout(() => this.limitHeight = this.evRow.nativeElement.offsetHeight > 200);
  }
}
