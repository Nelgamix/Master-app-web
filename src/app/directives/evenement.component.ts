import {Evenement} from '../model/evenement';

import {Component, Input} from '@angular/core';

@Component({
  selector: 'evenement',
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.css']
})
export class EvenementComponent {
  @Input() ev: Evenement;
  @Input() source: any;
}
