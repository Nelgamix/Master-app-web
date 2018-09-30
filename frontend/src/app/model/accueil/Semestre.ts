import {UE} from './UE';
import {Lien} from './Lien';
import {ISemestre} from './interfaces';
import * as moment from 'moment';
import {Utils} from '../../Utils';

export class Semestre {
  private _numero: number;
  private _info: string;
  private _debut: moment.Moment;
  private _fin: moment.Moment;
  private readonly _liens: Lien[];
  private readonly _ue: UE[];

  static construct(e: ISemestre) {
    return new Semestre(
      e.numero,
      e.info,
      e.debut ? moment(e.debut) : moment(),
      e.fin ? moment(e.fin) : moment(),
      e.liens ? e.liens.map(Lien.construct) : [],
      e.ue ? e.ue.map(UE.construct) : []
    );
  }

  constructor(numero: number = 0,
              infos: string = '',
              debut: moment.Moment = moment(),
              fin: moment.Moment = moment(),
              liens: Lien[] = [],
              ue: UE[] = []) {
    this._numero = numero;
    this._info = infos;
    this._debut = debut;
    this._fin = fin;
    this._liens = liens;
    this._ue = ue;
  }

  get numero(): number {
    return this._numero;
  }

  get info(): string {
    return this._info;
  }

  get ue(): UE[] {
    return this._ue;
  }

  get liens(): Lien[] {
    return this._liens;
  }

  get debut(): moment.Moment {
    return this._debut;
  }

  get fin(): moment.Moment {
    return this._fin;
  }

  set numero(value: number) {
    this._numero = value;
  }

  set info(value: string) {
    this._info = value;
  }

  set debut(value: moment.Moment) {
    this._debut = value;
  }

  set fin(value: moment.Moment) {
    this._fin = value;
  }

  format() {
    return Utils.bundleMinimalObject({
      numero: this.numero,
      info: this.info,
      debut: this.debut.format('YYYY-MM-DD'),
      fin: this.fin.format('YYYY-MM-DD'),
      liens: this.liens.map(e => e.format()),
      ue: this.ue.map(e => e.format())
    });
  }
}
