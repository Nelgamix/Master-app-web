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
    console.log('exec');
    const n = moment();

    for (const s of this.accueilData.semestres) {
      if (n.isBetween(s.debut, s.fin)) {
        console.log('s', s);
        return s;
      }
    }

    console.log('null');

    return null;
  }

  private reorderSemestres() {
    this.accueilData.reorderSemestres();
  }

  private parseData(data: IAccueilData): AccueilData {
    this._accueilData = AccueilData.construct(data);
    this.reorderSemestres();

    return this.accueilData;

    /*const semestres: Semestre[] = [];
    const liensPrimaires: Lien[] = [];
    const liensSecondaires: Lien[] = [];
    const liensPlus: Groupe[] = [];
    const groupesSecondaires: Groupe[] = [];

    for (const g of data['primaire']) { // pour chaque groupe
      for (const l of g) { // pour chaque lien
        liensPrimaires.push(this.parseLien(l));
      }
    }

    let gtmp;
    for (const l of data['secondaire']) { // pour chaque lien
      if (l['liens'] != null) {
        gtmp = new Groupe(l['nom']);
        for (const ll of l['liens']) {
          gtmp.ajoutLien(this.parseLien(ll));
        }

        groupesSecondaires.push(gtmp);
      } else {
        liensSecondaires.push(this.parseLien(l));
      }
    }

    for (const g of data['liens-plus']) {
      gtmp = new Groupe(g['nom']);
      for (const l of g['liens']) {
        gtmp.ajoutLien(new Lien(l['nom'], l['description'], l['lien']));
      }
      liensPlus.push(gtmp);
    }

    let stmp, uetmp, ttmp;
    for (const s of data['semestres']) {
      stmp = new Semestre(s['numero'], s['infos']);
      for (const ue of s['ue']) {
        for (const t in UEType) {
          if (isNaN(Number(t)) && UEType[t] === ue['type']) {
            ttmp = UEType[t];
            break;
          }
        }

        uetmp = new UE(ue['nom'], ue['initiales'], ttmp);
        for (const l of ue['liens']) {
          uetmp.ajoutLien(this.parseLien(l));
        }

        stmp.ajoutUe(uetmp);
      }

      for (const l of s['liens']) {
        stmp.ajoutLien(this.parseLien(l));
      }

      semestres.push(stmp);
    }

    this._semestres = semestres;
    this._liensPrimaires = liensPrimaires;
    this._liensSecondaires = liensSecondaires;
    this._liensPlus = liensPlus;
    this._groupesSecondaires = groupesSecondaires;*/
  }
}
