import {ILien} from './interfaces';
import {Utils} from '../../Utils';

export class Lien {
  // Validate URL (@diegoperini)
  static readonly VALID_URL = new RegExp(
    '^' +
    // protocol identifier
    '(?:(?:https?|ftp)://)' +
    // user:pass authentication
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
    '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // host name
    '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
    // domain name
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
    // TLD identifier
    '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
    // TLD may end with dot
    '\\.?' +
    ')' +
    // port number
    '(?::\\d{2,5})?' +
    // resource path
    '(?:[/?#]\\S*)?' +
    '$', 'i'
  );

  private _nom: string;
  private _description: string;
  private _url: string;

  static construct(e: ILien) {
    return new Lien(
      e.nom,
      e.description,
      e.url
    );
  }

  /**
   * Retourne un boolean indiquant si le lien est bien valide
   * @returns {boolean} vrai si le lien est bien valide, faux sinon
   */
  private static checkUrl(url: string): boolean {
    return Lien.VALID_URL.test(url);
  }

  constructor(nom: string = '',
              description: string = '',
              url: string = '') {
    this._nom = nom;
    this._description = description;

    if (url === '' || url === '#' || Lien.checkUrl(url)) {
      this._url = url;
    } else {
      throw new Error('Lien invalide: ' + url);
    }
  }

  get nom(): string {
    return this._nom;
  }

  get description(): string {
    return this._description;
  }

  get url(): string {
    return this._url;
  }

  set nom(value: string) {
    this._nom = value;
  }

  set description(value: string) {
    this._description = value;
  }

  set url(value: string) {
    this._url = value;
  }

  format() {
    return Utils.bundleMinimalObject({
      nom: this.nom,
      url: this.url,
      description: this.description
    });
  }
}
