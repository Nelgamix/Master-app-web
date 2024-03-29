import {PositionTemps} from './PositionTemps';
import * as moment from 'moment';

export enum EtatCours {
  ACTIF,
  CACHE,
  SUPPRIME
}

/**
 * Représente un cours.
 */
export class Cours {
  /**
   * L'id unique du cours.
   * Se base uniquement sur l'heure de début et de fin, ainsi que sur le nom du cours.
   * Ainsi, un cours qui a le même nom, ainsi que les mêmes horaires qu'un autre (mais un prof différent par exemple),
   * aura le même hashcode. C'est intentionnel, puisqu'on cherche à identifier les cours et non pas ce qui les composent.
   */
  hash_id: number;

  /**
   * Indique si le cours est ajouté par l'utilisateur, ou bien récupéré depuis l'emploi du temps.
   */
  prive: boolean;

  /**
   * Les types qui composent ce cours.
   * Par exemple: 'TD', 'TP'.
   * C'est forcément des strings qui incluent: 'CM', 'TD', ou 'TP'
   */
  type: string[];

  /**
   * Le nom du cours.
   * Ex: 'GEONUM' ou 'Intro to cryptology & coding'
   */
  nom: string;

  /**
   * Le professeur qui dispense le cours.
   * Ex: 'ROUSSET Marie-Christine'
   */
  professeur: string;

  /**
   * La description associée au cours.
   */
  description: string;

  /**
   * Un array qui contient tous les groupes concernés par le cours.
   */
  groupe: string[];

  /**
   * Les salles dans lesquelles se déroule le cours.
   */
  salles: any[];

  /**
   * Le type des salles.
   */
  sallesTypes: string[];

  /**
   * Date de début.
   */
  debut: any;

  /**
   * Date de fin du cours
   */
  fin: any;

  /**
   * Durée du cours: fin - début. Sous forme de moment.duration().
   */
  duree: any;

  etat: EtatCours;

  /**
   * Donne la position dans le temps par rapport au moment de l'analyse.
   */
  positionTemps: PositionTemps;

  constructor(o: any) {
    // On check les pré-requis
    const needed = ['nom', 'debut', 'fin'];
    for (const n of needed) {
      if (!o.hasOwnProperty(n)) {
        throw new Error('Construction de cours impossible: il manque une propriété (' + n + ')');
      }
    }

    this.type = [];
    this.professeur = '';
    this.description = '';
    this.groupe = [];
    this.salles = [];
    this.sallesTypes = [];
    this.prive = false;

    for (const p in o) {
      if (o.hasOwnProperty(p) && o[p] !== null) {
        this[p] = o[p];
      }
    }

    this.etat = EtatCours.ACTIF;
    this.positionTemps = PositionTemps.INDEFINI;
    this.duree = moment.duration(this.fin.diff(this.debut));
  }

  static initFromIcal(c: any): Cours {
    const debut = moment(c.debut, 'DD-MM-YYYY HH:mm');
    const fin = moment(c.fin, 'DD-MM-YYYY HH:mm');
    const groupe = this.analyseGroupe(c.groupe);
    const type = this.analyseType(c.type);

    const tmp = this.analyseSalle(c.salle);
    const salles: any[] = tmp[0];
    const salles_types: any[] = tmp[1];

    let descr =
      debut.format('HH:mm')
      + ' -> '
      + fin.format('HH:mm')
      + ': '
      + c.nom
      + ' avec '
      + c.professeur
      + ' en ';
    salles.forEach((s: {salle: string, batiment: string}) => descr += ' ' + s.salle);

    return new Cours({
      nom: c.nom,
      professeur: c.professeur,
      description: descr,
      debut: debut,
      fin: fin,
      groupe: groupe,
      type: type,
      salles: salles,
      salles_types: salles_types,
      prive: false
    });
  }

  private static analyseGroupe(groupe: string): any[] {
    if (groupe.length === 0) {
      return [];
    }

    return groupe.split(', ');
  }

  private static analyseType(type: string): any[] {
    if (type.length === 0) {
      return [];
    }

    return type.split('/');
  }

  private static analyseSalle(salle: string): [string[], string[]] {
    const salles = [];

    // On définit les regex.
    const batreg = /(IM2AG|DLST)/g; // IM2AG ou DLST
    const sallereg = /(CIME)|(FABLAB)|((?:F)?[0-9]{3})/g; // une salle
    const stypereg = /(Amphi|TD|TP|PC)/ig; // le type associé à la salle

    // Liste des batiments, et des salles trouvées
    const batm = new Set();
    const sallem = new Set();

    // Parse les types de salle.
    const stypem = stypereg.exec(salle);
    const salles_types = stypem ? Array.from(new Set(stypem)) : []; // remove duplicates

    // Traitement des salles.
    let tmp;
    while ((tmp = sallereg.exec(salle)) !== null) {
      sallem.add(tmp[0]);
    }

    // Traitement des batiments.
    while ((tmp = batreg.exec(salle)) !== null) {
      batm.add(tmp[0]);
    }

    // Créer l'objet final associant les bâtiments aux salles.
    const sallema = Array.from(sallem);
    const batma = Array.from(batm);
    for (let i = 0; i < sallema.length; i++) {
      salles.push({
        salle: sallema[i],
        batiment: i < batma.length ? batma[i] : ''
      });
    }

    return [salles, salles_types];
  }

  preAnalyse(now: any): void {
    this.analysePositionTemps(now);
  }

  analyse(opt?: any): void {
    this.calculeHash();
  }

  private analysePositionTemps(now: any): void {
    this.positionTemps = (this.fin.isBefore(now) ?
      PositionTemps.PASSE :
      (this.debut.isAfter(now) ?
        PositionTemps.FUTUR :
        PositionTemps.PRESENT
      )
    );
  }

  private calculeHash(): boolean {
    if (this.debut === null || this.fin === null || this.nom === null || this.nom.length === 0) {
      return;
    }

    this.hash_id = 0;
    this.hash_id += this.debut.hour() + this.debut.minute() + this.fin.hour() + this.fin.minute();
    for (let i = 0; i < this.nom.length; i++) {
      this.hash_id += this.nom[i].charCodeAt(0);
    }

    return true;
  }
}
