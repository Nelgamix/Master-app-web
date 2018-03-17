import * as moment from 'moment';

export class Note {
  /** La date à laquelle la note a été créée. */
  dateCreation: any;

  /** La date à laquelle la note a subi sa dernière édition. */
  dateModification: any;

  /** La description de la note. */
  description: any;

  /** Le texte/la note en elle-même. */
  texte: string;

  constructor(dateCreation: any = moment(), dateModification: any = moment(), description: any = '', texte: string = '') {
    this.dateCreation = dateCreation;
    this.dateModification = dateModification;
    this.description = description;
    this.texte = texte;
  }

  copyFrom(n: Note): void {
    this.dateCreation = n.dateCreation;
    this.dateModification = n.dateModification;
    this.description = n.description;
    this.texte = n.texte;
  }

  clone(): Note {
    return new Note(moment(this.dateCreation), moment(this.dateModification), this.description, this.texte);
  }
}
