import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IAccueilData} from '../model/accueil/interfaces';
import {AccueilData} from '../model/accueil/AccueilData';
import {Groupe} from '../model/accueil/Groupe';
import {Lien} from '../model/accueil/Lien';
import {Semestre} from '../model/accueil/Semestre';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AccueilService {
  private _accueilData: AccueilData;

  constructor(private http: HttpClient) {
  }

  getAccueilData(url: string): Observable<AccueilData> {
    return this.http.get<IAccueilData>(url).pipe(
      map(data => this.parseData(data))
    );
  }

  get semestres(): Semestre[] {
    return this.accueilData.semestres;
  }

  get liensPrimaires(): Lien[] {
    return this.accueilData.liensPrimaires;
  }

  get liensSecondaires(): Lien[] {
    return this.accueilData.liensSecondaires;
  }

  get liensPlus(): Groupe[] {
    return this.accueilData.liensPlus;
  }

  get groupesSecondaires(): Groupe[] {
    return this.accueilData.groupesSecondaires;
  }

  get accueilData(): AccueilData {
    return this._accueilData;
  }

  formatData() {
    return this.accueilData.format();
  }

  get currentSemestre(): Semestre {
    const n = moment();

    for (const s of this.accueilData.semestres) {
      if (n.isBetween(s.debut, s.fin)) {
        return s;
      }
    }

    return null;
  }

  private reorderSemestres() {
    this.accueilData.reorderSemestres();
  }

  private parseData(data: IAccueilData): AccueilData {
    this._accueilData = AccueilData.construct(data);
    this.reorderSemestres();

    return this.accueilData;
  }
}
