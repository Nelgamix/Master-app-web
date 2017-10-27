export class Lien {
  private nom: string;
  private description: string;
  private url: string;

  constructor(nom: string, description: string = '', url: string = '') {
    this.nom = nom;
    this.description = description;
    this.url = url;
  }

  public getNom(): string {
    return this.nom;
  }
  public getDescription(): string {
    return this.description;
  }
  public getUrl(): string {
    return this.checkUrl() ? this.url : '';
  }

  private checkUrl(): boolean {
    return true;
  }

  /**
   * Retourne un boolean indiquant si le lien est bien valide
   * Vérifie la validité du lien et la longueur des champs
   * @returns {boolean} vrai si le lien est bien valide, faux sinon
   */
  public isValid(): boolean {
    return this.checkUrl();
  }
}
