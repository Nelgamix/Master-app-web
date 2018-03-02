import {UeType} from './UEType';
import {Lien} from './Lien';

export class UE {
  private initiales: string;
  private nom: string;
  private type: UeType;
  private liens: Lien[];

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

  public getLiens(): Lien[] {
    return this.liens;
  }

  public ajoutLien(lien: Lien): boolean {
    const l = this.liens.length;
    return l + 1 === this.liens.push(lien);
  }
}
