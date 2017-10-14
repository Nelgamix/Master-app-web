import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';

@Injectable()
export class DatesService {
  dates: any;
  dateProche: any;

  constructor(private http: HttpClient) {
  }

  private findClosestDate() {
    const now = moment();
    const nowWeekDay = now.weekday();
    const nowWeek = now.week();
    const nowYear = now.year();

    const first = this.dates[0]; // première semaine dispo dans les dates
    const last = this.dates[this.dates.length - 1]; // dernière semaine dispo

    if (nowYear < first.year || (nowYear === first.year && nowWeek < first.nowWeek)) { // on est avant
      this.dateProche = first;
    } else if (nowYear > last.year || (nowYear === last.year && nowWeek > last.nowWeek)) { // on est après
      this.dateProche = last;
    } else { // on est dedans
      for (const d of this.dates) {
        // peut être facto dans une seule cond, mais plus clair ainsi
        if (d.year > nowYear) { // l'année est après; on doit le sélectionner
          this.dateProche = d;
          break;
        } else if (d.year === nowYear && d.week === nowWeek && nowWeekDay < 5) { // même semaine, vendredi ou avant
          // si on est dans la même semaine, mais le weekend, on sélectionne celle d'après ('if' suivant)
          this.dateProche = d;
          break;
        } else if (d.year === nowYear && d.week > nowWeek) { // semaine d'après
          this.dateProche = d;
          break;
        }
      }
    }

    if (!this.dateProche) {
      throw new Error('selectedDate could not be find');
    }
  }

  private loadDates(data, cb) {
    this.dates = data; // il faut que ce soit dans l'ordre (trié...) eg 2017-35, 2017-36, ...

    if (!this.dates || this.dates.length < 1) {
      throw new Error('dates script didn\'t return any year/week json object');
    }

    this.findClosestDate();

    if (cb && cb instanceof Function) {
      cb();
    }
  }

  updateDates(cb) {
    const local = 0;
    if (local) {
      this.http.get('assets/datesServiceTest.json').subscribe(data => this.loadDates(data, cb));
    } else {
      this.http.get('php/dates.php').subscribe(data => this.loadDates(data, cb));
    }
  }
}
