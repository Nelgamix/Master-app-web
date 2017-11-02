import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import {GlobalVariable} from '../globals';

@Injectable()
export class DatesService {
  semaines: any = [];
  semaineProche: any;
  semaineSelectionnee: any;

  premiereSemaine: any;
  derniereSemaine: any;

  constructor(private http: HttpClient) {
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

    if (!this.semaineProche) {
      throw new Error('selectedDate could not be find');
    }

    this.semaineSelectionnee = this.semaineProche;
  }

  private loadDates(data, cb) {
    for (const d of data) {
      this.semaines.push({
        debut: moment(d.debut),
        fin: moment(d.fin),
        week: d.week,
        year: d.year
      });
    }

    if (!this.semaines || this.semaines.length < 1) {
      throw new Error('dates script didn\'t return any year/week json object');
    }

    this.findClosestDate();

    if (cb && cb instanceof Function) {
      cb();
    }
  }

  nextWeek(): void {
    if (this.semaineSelectionnee === this.derniereSemaine) {
      return;
    }

    this.semaineSelectionnee = this.semaines[this.semaines.indexOf(this.semaineSelectionnee) + 1];
  }

  previousWeek(): void {
    if (this.semaineSelectionnee === this.premiereSemaine) {
      return;
    }

    this.semaineSelectionnee = this.semaines[this.semaines.indexOf(this.semaineSelectionnee) - 1];
  }

  nowWeek(): void {
    if (this.semaineProche === null) {
      return;
    }

    this.semaineSelectionnee = this.semaineProche;
  }

  updateDates(cb) {
    if (GlobalVariable.LOCAL_DEV) {
      this.http.get('assets/offline/datesServiceTest.json').subscribe(data => this.loadDates(data, cb));
    } else {
      this.http.get('php/dates.php').subscribe(data => this.loadDates(data, cb));
    }
  }
}
