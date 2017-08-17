import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'duree', pure: false})
export class Duree implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    return value.hours() + ':' + (value.minutes() >= 10 ? value.minutes() : '0' + value.minutes());
  }
}
