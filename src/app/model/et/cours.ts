import * as moment from 'moment';

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
   * Durée du cours: fin - début.
   */
  duree: any;

  /**
   * Réprésente le fait que le cours soit caché par l'utilisateur.
   */
  cache: boolean;

  /**
   * Représente le fait que le cours soit supprimé par l'utilisateur.
   */
  supprime: boolean;

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

    for (const p in o) {
      if (o.hasOwnProperty(p)) {
        this[p] = o[p];
      }
    }

    this.cache = false;
    this.supprime = false;
    this.prive = this.prive || true;
    this.duree = moment.duration(this.fin.diff(this.debut));

    this.calculeHash();
  }

  static initFromIcal(c: any): Cours {
    const debut = moment(c.debut, 'DD-MM-YYYY HH:mm');
    const fin = moment(c.fin, 'DD-MM-YYYY HH:mm');
    const groupe = this.analyseGroupe(c.groupe);
    const type = this.analyseType(c.type);

    const tmp = this.analyseSalle(c.salle);
    const salles = tmp[0];
    const salles_types = tmp[1];

    return new Cours({
      nom: c.nom,
      professeur: c.professeur,
      description: c.description,
      debut: debut,
      fin: fin,
      groupe: groupe,
      type: type,
      salles: salles,
      salles_types: salles_types,
      prive: false
    });
  }

  static analyseGroupe(groupe: string): any[] | null {
    if (groupe.length === 0) {
      return null;
    }

    const a = [];
    for (const g of groupe.split(', ')) {
      a.push(g);
    }

    return a;
  }

  static analyseType(type: string): any[] | null {
    if (type.length === 0) {
      // Si type n'a pas de type, alors le type est invalide.
      return null;
    }

    return type.split('/');
  }

  static analyseSalle(salle: string): [string[], string[]] | null {
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

  print(): void {
    console.log(this);
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
