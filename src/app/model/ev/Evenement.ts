import * as moment from 'moment';
/**
 * La classe Evenement représente un évènement qui commence à une date de début,
 * et se finit à une date de fin. Cet évènement possède des info, un type et éventuellement
 * un url. Sa couleur est définie en fonction de son type.
 */
export class Evenement {
  /**
   * Les couleurs en fonction des types
   * @type {Array}
   */
  static readonly defCouleurs = [
    {
      type: 'Vie de la filière',
      couleur: '#91FF5A'
    },
    {
      type: 'Examens',
      couleur: '#E8A94E'
    },
    {
      type: 'Devoirs à rendre',
      couleur: '#FF6269'
    },
    {
      type: 'Vie étudiante',
      couleur: '#894EE8'
    },
    {
      type: 'Autres',
      couleur: '#62D5FF'
    }
  ];

  /**
   * La couleur qui sera donnée par défaut si aucune autre n'est trouvée
   * @type {Object}
   */
  static readonly defautCouleur = {
    couleur: '#000'
  };

  /**
   * L'id de l'évènement en BD
   * @type {number}
   */
  id: number;

  /**
   * La date de début
   * @type {moment}
   */
  debut: any;

  /**
   * La date de fin
   * @type {moment}
   */
  fin: any;

  /**
   * Indique si l'évènement a une fin définie ou pas
   * @type {boolean}
   */
  timable: boolean;

  /**
   * Les info concernant l'évènement
   * @type {string}
   */
  info: string;

  /**
   * Le type d'évènement
   * @type {string}
   */
  type: string;

  /**
   * L'url d'information pour cet évènement
   * @type {string}
   */
  url: string;

  /**
   * La couleur affectée au type d'évènement
   * @type {string}
   */
  couleur: string;

  constructor(e?) {
    if (e) {
      this.init(e);
    } else {
      this.init({
        id: 0,
        debut: moment().format(),
        fin: '',
        info: '',
        type: '',
        url: ''
      });
    }
  }

  init(e): void {
    this.id = e.id;

    this.setDebut(e.debut);
    this.setFin(e.fin);

    this.setInfo(e.info);
    this.setType(e.type);
    this.setUrl(e.url);
  }

  getDebutFormat(): string {
    return this.debut ? this.debut.format('YYYY-MM-DD HH:mm:ss') : '';
  }

  getFinFormat(): string {
    return this.timable && this.fin ? this.fin.format('YYYY-MM-DD HH:mm:ss') : '';
  }

  getTimable(): boolean {
    return this.timable ? this.timable : false;
  }

  getInfo(): string {
    return this.info ? this.info : '';
  }

  getType(): string {
    return this.type ? this.type : '';
  }

  getUrl(): string {
    return this.url ? this.url : '';
  }

  setType(str): void {
    this.type = str ? str : '';

    this.initCouleur();
  }

  setInfo(str): void {
    this.info = str ? str : '';
  }

  setTimable(bool): void {
    this.timable = bool ? bool : false;
  }

  /**
   * Set l'url de l'évènement, uniquement si celle-ci commence par http://
   * @param {string} str l'url à set
   */
  setUrl(str): void {
    const patt = /^http(s)?:\/\//;
    if (!str || str.length === 0 || patt.test(str)) {
      this.url = str ? str : '';
    } else {
      console.error('Cannot set the url, because it\'s not an url.');
    }
  }

  /**
   * Set le début de l'évènement
   * @param {string} string la date de début de l'évènement
   */
  setDebut(string): void {
    if (string && string.length > 0) {
      this.debut = moment(string);

      if (this.debut.isValid()) {
        if (this.timable && this.fin.diff(this.debut) < 0) {
          this.setFin('');
        }
      } else {
        this.debut = null;
        console.error('Date de début invalide');
      }
    }
  }

  /**
   * Set la fin de l'évènement.
   * @param {string} string la date de fin de l'évènement
   */
  setFin(string): void {
    if (!string || string.length === 0) {
      this.timable = false;
    } else {
      this.fin = moment(string);

      if (this.fin.isValid() && this.fin.diff(this.debut) > 0) {
        this.timable = true;
      } else {
        this.fin = null;
        this.timable = false;
      }
    }
  }

  /**
   * Initialise la couleur à partir du type de l'évènement
   */
  private initCouleur(): void {
    for (const c of Evenement.defCouleurs) {
      if (c.type === this.type) {
        this.couleur = c.couleur;
        break;
      }
    }

    if (!this.couleur) {
      this.couleur = Evenement.defautCouleur.couleur;
    }
  }
}
