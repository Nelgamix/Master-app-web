import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';

@Injectable()
export class DatesService {
  semaines: any[] = [];
  semaineProche: any;

  premiereSemaine: any;
  derniereSemaine: any;

  constructor(private http: HttpClient) {
  }

  getSemaines(): Observable<any> {
    return Observable.of(this.semaines);
  }

  getObsDateFromWeekYear(date): any {
    return this.getSemaines().map(semaines => semaines.find(s => s.year === date.year && s.week === date.week));
  }

  nextWeek(semaine: any): any | null {
    if (this.semaineEquals(semaine, this.derniereSemaine)) {
      return null;
    }

    return this.semaines[this.semaines.indexOf(semaine) + 1];
  }

  previousWeek(semaine: any): any | null {
    if (this.semaineEquals(semaine, this.premiereSemaine)) {
      return null;
    }

    return this.semaines[this.semaines.indexOf(semaine) - 1];
  }

  nowWeek(semaine: any): any | null {
    if (!this.semaineProche || this.semaineEquals(semaine, this.semaineProche)) {
      return null;
    }

    return this.semaineProche;
  }

  updateDates(cb?: Function) {
    this.http.get('php/dates.php').subscribe(data => this.loadDates(data, cb));
  }

  private semaineEquals(semaine1: any, semaine2: any): boolean {
    return semaine1.year === semaine2.year && semaine1.week === semaine2.week;
  }

  private findClosestDate() {
    const now = moment();
    const nowWeekDay = now.weekday();
    const nowWeek = now.week();
    const nowYear = now.year();

    this.premiereSemaine = this.semaines[0]; // première semaine dispo dans les dates
    this.derniereSemaine = this.semaines[this.semaines.length - 1]; // dernière semaine dispo

    if (nowYear < this.premiereSemaine.year ||
      (nowYear === this.premiereSemaine.year && nowWeek < this.premiereSemaine.week)) { // on est avant
      this.semaineProche = this.premiereSemaine;
    } else if (nowYear > this.derniereSemaine.year ||
      (nowYear === this.derniereSemaine.year && nowWeek > this.derniereSemaine.week)) { // on est après
      this.semaineProche = this.derniereSemaine;
    } else { // on est dedans
      for (const d of this.semaines) {
        // peut être facto dans une seule cond, mais plus clair ainsi
        if (d.year > nowYear) { // l'année est après; on doit le sélectionner
          this.semaineProche = d;
          break;
        } else if (d.year === nowYear && d.week === nowWeek && nowWeekDay < 5) { // même semaine, vendredi ou avant
          // si on est dans la même semaine, mais le weekend, on sélectionne celle d'après ('if' suivant)
          this.semaineProche = d;
          break;
        } else if (d.year === nowYear && d.week > nowWeek) { // semaine d'après
          this.semaineProche = d;
          break;
        }
      }
    }
  }

  private loadDates(data, cb?: Function) {
    for (const d of data) {
      this.semaines.push({
        debut: moment(d.debut),
        fin: moment(d.fin),
        week: parseInt(d.week, 10),
        year: parseInt(d.year, 10)
      });
    }

    if (!this.semaines || this.semaines.length < 1) {
      throw new Error('dates script didn\'t return any year/week json object');
    }

    this.findClosestDate();

    if (cb) {
      cb();
    }
  }
}
