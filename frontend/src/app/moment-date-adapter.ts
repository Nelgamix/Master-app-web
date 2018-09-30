import {Injectable} from '@angular/core';
import {NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

const isInt = Number.isInteger;

@Injectable()
export class MomentDateAdapter extends NgbDateAdapter<moment.Moment> {
  fromModel(date: moment.Moment): NgbDateStruct {
    if (!date || !moment.isMoment(date)) {
      return null;
    }

    return {
      year: date.year(),
      month: date.month() + 1,
      day: date.date(),
    };
  }

  toModel(date: NgbDateStruct): moment.Moment {
    if (!date || !isInt(date.day) || !isInt(date.day) || !isInt(date.day)) {
      return null;
    }

    return moment(`${date.year}-${date.month}-${date.day}`, 'YYYY-MM-DD');
  }
}
