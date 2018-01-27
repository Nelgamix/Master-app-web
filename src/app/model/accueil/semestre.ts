import {UE} from './ue';
import {Lien} from './lien';

export class Semestre {
  private numero: number;
  private infos: string;
  private ue: Array<UE>;
  private liens: Array<Lien>;

  constructor(numero: number, infos: string = '') {
    this.ue = [];
    this.liens = [];
    this.infos = infos;
    this.numero = numero;
  }

  public getNumero(): number {
    return this.numero;
  }

  public getInfos(): string {
    return this.infos;
  }

  public getUe(): Array<UE> {
    return this.ue;
  }

  public getLiens(): Array<Lien> {
    return this.liens;
  }

  public ajoutUe(ue: UE): boolean {
    const l = this.ue.length;
    return l + 1 === this.ue.push(ue);
  }

  public ajoutLien(lien: Lien) {
    const l = this.liens.length;
    return l + 1 === this.liens.push(lien);
  }
}