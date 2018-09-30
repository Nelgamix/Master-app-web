import {Lien} from './Lien';
import {IUE, UEType} from './interfaces';
import {Utils} from '../../Utils';

export class UE {
  private _initiales: string;
  private _nom: string;
  private _type: UEType;
  private readonly _liens: Lien[];

  static construct(e: IUE) {
    return new UE(
      e.nom,
      e.initiales,
      e.type,
      e.liens.map(Lien.construct)
    );
  }

  constructor(nom: string = '',
              initiales: string = '',
              type: UEType = UEType.GENERAL,
              liens: Lien[] = []) {
    this._liens = liens;
    this._nom = nom;
    this._initiales = initiales;
    this._type = type;
  }

  get initiales(): string {
    return this._initiales;
  }

  get nom(): string {
    return this._nom;
  }

  get type(): UEType {
    return this._type;
  }

  get typeString(): string {
    return this._type.toString();
  }

  get liens(): Lien[] {
    return this._liens;
  }

  set initiales(value: string) {
    this._initiales = value;
  }

  set nom(value: string) {
    this._nom = value;
  }

  set type(value: UEType) {
    this._type = value;
  }

  format() {
    return Utils.bundleMinimalObject({
      nom: this.nom,
      initiales: this.initiales,
      type: this.typeString,
      liens: this.liens.map(e => e.format())
    });
  }
}
