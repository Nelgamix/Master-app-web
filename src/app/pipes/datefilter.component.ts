import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'datefilter',
    pure: false
})
export class DateFilter implements PipeTransform {
    transform(items: any[], arg: any, minDays: number, maxDays: number): any {
        if (!items || !arg) {
            return items;
        }

        if (!minDays) minDays = 0;
        if (!maxDays) maxDays = 365;

        let now = moment();
        let diff;
        let dateToComp;
        let actif;
        switch (parseInt(arg.temporel)) {
            case 0:
                return items.filter(item => {
                    for (let f of arg.type) {
                        if (f.type == item.type) {
                            actif = f.actif;
                            break;
                        }
                    }

                    dateToComp = item.timable ? item.fin : item.debut;
                    diff = dateToComp.diff(now, 'days', true);
                    return actif && diff <= (-1 * minDays) && diff > (-1 * maxDays);
                });
            case 1:
                return items.filter(item => {
                    for (let f of arg.type) {
                        if (f.type == item.type) {
                            actif = f.actif;
                            break;
                        }
                    }

                    dateToComp = item.timable ? item.fin : item.debut;
                    if (now.year() == arg.date.year && now.month() == arg.date.month-1 && now.date() == arg.date.day) {
                        diff = dateToComp.diff(now, 'days', true);
                    } else {
                        diff = dateToComp.diff([arg.date.year, arg.date.month-1, arg.date.day], 'days', true);
                    }

                    return actif && diff >= minDays && diff < maxDays;
                });
            default:
                return items;
        }
    }
}