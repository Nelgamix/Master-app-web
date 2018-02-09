import * as moment from 'moment';

/**
 * Représente un cours.
 */
export class Cours {
  static readonly typeCouleurs = {
    'CM': 'crimson',
    'TD': 'dodgerblue',
    'TP': 'seagreen'
  };

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
  salles: any;

  /**
   * Le type des salles.
   */
  salles_types: string[];

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
   * La couleur à afficher pour le cours.
   * Dépend du type du cours.
   */
  couleur: string;

  /**
   * Réprésente le fait que le cours soit caché par l'utilisateur.
   */
  cache: boolean;

  /**
   * Représente le fait que le cours soit supprimé par l'utilisateur.
   */
  supprime: boolean;

  constructor(c) {
    this.type = c.type.split('/');
    this.nom = c.nom;
    this.professeur = c.professeur;
    this.description = c.description;

    // Groupes
    this.groupe = [];
    for (const g of c.groupe.split(', ')) {
      this.groupe.push(g);
    }

    // Analyse la salle (et le batiment)
    this.salles = [];
    const batreg = /(IM2AG|DLST)/g;
    const sallereg = /(FABLAB)|((?:F)?[0-9]{3})/g;
    const stypereg = /(Amphi|TD|TP|PC)/ig;

    const batm = [];
    const sallem = [];
    const stypem = stypereg.exec(c.salle);

    let tmp;
    while ((tmp = sallereg.exec(c.salle)) !== null) {
      if (!sallem.includes(tmp[0])) {
        sallem.push(tmp[0]);
      }
    }
    while ((tmp = batreg.exec(c.salle)) !== null) {
      if (!batm.includes(tmp[0])) {
        batm.push(tmp[0]);
      }
    }

    for (let i = 0; i < sallem.length; i++) {
      this.salles.push({
        salle: sallem[i],
        batiment: i < batm.length ? batm[i] : ''
      });
    }

    this.salles_types = stypem ? Array.from(new Set(stypem)) : []; // remove duplicates

    // Début + fin
    this.debut = moment(c.debut, 'DD-MM-YYYY HH:mm');
    this.fin = moment(c.fin, 'DD-MM-YYYY HH:mm');
    this.duree = moment(c.duree, 'HH:mm');

    // Couleur
    this.couleur = Cours.typeCouleurs[this.type[0]];
    if (!this.couleur) {
      this.couleur = 'black';
    }
    this.cache = false;
    this.supprime = false;

    /*
    Calcule le hash du cours.
    Se base uniquement sur l'heure de début et de fin, ainsi que sur le nom du cours.
    Ainsi, un cours qui a le même nom, ainsi que les mêmes horaires qu'un autre (mais un prof différent par exemple),
    aura le même hashcode. C'est intentionnel, puisqu'on cherche à identifier les cours et non pas ce qui les composent.
     */
    this.hash_id = 0;
    this.hash_id += this.debut.hour() + this.debut.minute() + this.fin.hour() + this.fin.minute();
    for (let i = 0; i < this.nom.length; i++) {
      this.hash_id += this.nom[i].charCodeAt(0);
    }
  }
}
