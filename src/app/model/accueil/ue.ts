import {UeType} from './ueType';
import {Lien} from './lien';

export class UE {
  private initiales: string;
  private nom: string;
  private type: UeType;
  private liens: Array<Lien>;

  constructor(nom: string, initiales: string = '', type: UeType = UeType.GENERAL) {
    this.liens = [];
    this.nom = nom;
    this.initiales = initiales;
    this.type = type;
  }

  public getNom(): string {
    return this.nom;
  }

  public getInitiales(): string {
    return this.initiales;
  }

  public getType(): UeType {
    return this.type;
  }

  public getTypeS(): string {
    return this.type.toString();
  }

  public getLiens(): Array<Lien> {
    return this.liens;
  }

  public ajoutLien(lien: Lien): boolean {
    const l = this.liens.length;
    return lien.isValid() && l + 1 === this.liens.push(lien);
  }
}
