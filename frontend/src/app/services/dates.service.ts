import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import {SemaineDate} from '../model/et/Semaine';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';

interface IDate {
  week: string;
  year: string;
  debut: string;
  fin: string;
}

@Injectable()
export class DatesService {
  semaines: SemaineDate[];

  semaineProche: SemaineDate;
  premiereSemaine: SemaineDate;
  derniereSemaine: SemaineDate;

  constructor(private http: HttpClient) {
    this.semaines = [];
  }

  getSemaines(): Observable<SemaineDate[]> {
    return Observable.of(this.semaines);
  }

  getObsDateFromWeekYear(semaine: number, annee: number): Observable<SemaineDate> {
    return this.getSemaines().map(
      semaines => semaines.find(
        (s: SemaineDate) => s.annee === annee && s.semaine === semaine
      )
    );
  }

  nextWeek(semaine: SemaineDate): SemaineDate | null {
    return semaine.equals(this.derniereSemaine) ? null : this.semaines[this.semaines.indexOf(semaine) + 1];
  }

  previousWeek(semaine: SemaineDate): SemaineDate | null {
    return semaine.equals(this.premiereSemaine) ? null : this.semaines[this.semaines.indexOf(semaine) - 1];
  }

  nowWeek(semaine: SemaineDate): SemaineDate | null {
    return !this.semaineProche || semaine.equals(this.semaineProche) ? null : this.semaineProche;
  }

  updateDates(cb?: Function): void {
    this.http.get<IDate[]>('backend/dates').subscribe(data => this.loadDates(data, cb));
  }

  private findClosestDate(): void {
    const now = moment();
    const nowWeekDay = now.weekday();
    const nowWeek = now.week();
    const nowYear = now.year();

    this.premiereSemaine = this.semaines[0]; // première semaine dispo dans les dates
    this.derniereSemaine = this.semaines[this.semaines.length - 1]; // dernière semaine dispo

    if (nowYear < this.premiereSemaine.annee ||
      (nowYear === this.premiereSemaine.annee && nowWeek < this.premiereSemaine.semaine)) { // on est avant
      this.semaineProche = this.premiereSemaine;
    } else if (nowYear > this.derniereSemaine.annee ||
      (nowYear === this.derniereSemaine.annee && nowWeek > this.derniereSemaine.semaine)) { // on est après
      this.semaineProche = this.derniereSemaine;
    } else { // on est dedans
      for (const d of this.semaines) {
        // peut être facto dans une seule cond, mais plus clair ainsi
        if (d.annee > nowYear) { // l'année est après; on doit le sélectionner
          this.semaineProche = d;
          break;
        } else if (d.annee === nowYear && d.semaine === nowWeek && nowWeekDay < 5) { // même semaine, vendredi ou avant
          // si on est dans la même semaine, mais le weekend, on sélectionne celle d'après ('if' suivant)
          this.semaineProche = d;
          break;
        } else if (d.annee === nowYear && d.semaine > nowWeek) { // semaine d'après
          this.semaineProche = d;
          break;
        }
      }
    }
  }

  private loadDates(data: IDate[], cb?: Function): void {
    data.forEach(d => this.semaines.push(new SemaineDate(+d.week, +d.year, d.debut, d.fin)));

    if (this.semaines.length < 1) {
      throw new Error('dates script didn\'t return any year/week json object');
    }

    this.findClosestDate();

    if (cb) {
      cb();
    }
  }
}
