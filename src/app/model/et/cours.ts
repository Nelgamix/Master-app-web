import * as moment from 'moment';

export class Cours {
  static readonly typeCouleurs = {
    'Cours': 'crimson',
    'TD': 'dodgerblue',
    'TP': 'seagreen'
  };

  type: string;
  nom: string;
  professeur: string;
  description: string;
  groupe: string[];

  salles: any;
  salles_types: string[];

  debut: any;
  fin: any;
  duree: any;

  couleur: string;
  cache: boolean;
  supprime: boolean;

  constructor(c) {
    this.type = c.type;
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
    const sallereg = /((?:F)?[0-9]{3})/g;
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
    this.couleur = Cours.typeCouleurs[this.type];
    if (!this.couleur) {
      this.couleur = 'black';
    }
    this.cache = false;
    this.supprime = false;
  }
}
