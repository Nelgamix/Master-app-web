import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, Input} from '@angular/core';
import * as moment from 'moment';
import {Duree} from '../pipes/duree.pipe';

@Component({
  selector: 'app-modal-et-stats',
  templateUrl: './et-stats.component.html'
})
export class ModalEtStatsComponent {
  @Input() stats: any[];

  constructor(public activeModal: NgbActiveModal) {
  }

  toString(val): string {
    if (!val) {
      return 'Invalid';
    }

    if (typeof val === 'string') {
      return val;
    }

    if (typeof val === 'number') {
      return val.toString();
    }

    if (moment.isDuration(val)) {
      return new Duree().transform(val);
    }

    return 'Unrecognized (' + typeof val + ')';
  }
}
