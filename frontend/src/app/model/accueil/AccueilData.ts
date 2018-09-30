import {Lien} from './Lien';
import {Groupe} from './Groupe';
import {Semestre} from './Semestre';
import {IAccueilData} from './interfaces';
import {Utils} from '../../Utils';

export class AccueilData {
  private readonly _liensPrimaires: Lien[];
  private readonly _groupesSecondaires: Groupe[];
  private readonly _liensSecondaires: Lien[];
  private readonly _liensPlus: Groupe[];
  private readonly _semestres: Semestre[];

  static construct(e: IAccueilData) {
    return new AccueilData(
      e.liensPrimaires ? e.liensPrimaires.map(Lien.construct) : [],
      e.groupesSecondaires ? e.groupesSecondaires.map(Groupe.construct) : [],
      e.liensSecondaires ? e.liensSecondaires.map(Lien.construct) : [],
      e.liensPlus ? e.liensPlus.map(Groupe.construct) : [],
      e.semestres ? e.semestres.map(Semestre.construct) : []
    );
  }

  constructor(liensPrimaires: Lien[] = [],
              groupesSecondaires: Groupe[] = [],
              liensSecondaires: Lien[] = [],
              liensPlus: Groupe[] = [],
              semestres: Semestre[] = []) {
    this._liensPrimaires = liensPrimaires;
    this._groupesSecondaires = groupesSecondaires;
    this._liensSecondaires = liensSecondaires;
    this._liensPlus = liensPlus;
    this._semestres = semestres;
  }

  get liensPrimaires(): Lien[] {
    return this._liensPrimaires;
  }

  get groupesSecondaires(): Groupe[] {
    return this._groupesSecondaires;
  }

  get liensSecondaires(): Lien[] {
    return this._liensSecondaires;
  }

  get liensPlus(): Groupe[] {
    return this._liensPlus;
  }

  get semestres(): Semestre[] {
    return this._semestres;
  }

  format() {
    return Utils.bundleMinimalObject({
      liensPrimaires: this.liensPrimaires.map(e => e.format()),
      groupesSecondaires: this.groupesSecondaires.map(e => e.format()),
      liensSecondaires: this.liensSecondaires.map(e => e.format()),
      liensPlus: this.liensPlus.map(e => e.format()),
      semestres: this.semestres.map(e => e.format())
    });
  }

  reorderSemestres() {
    this._semestres.sort((a: Semestre, b: Semestre) => a.numero - b.numero);
  }
}
