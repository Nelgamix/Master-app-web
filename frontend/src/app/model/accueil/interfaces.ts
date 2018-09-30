export interface ILien {
  nom?: string;
  description?: string;
  url?: string;
}

export interface IGroupe {
  nom?: string;
  liens?: ILien[];
}

export interface ISemestre {
  numero?: number;
  info?: string;
  debut?: string;
  fin?: string;
  liens?: ILien[];
  ue?: IUE[];
}

export enum UEType {
  GENERAL = 'Général',
  BASE_DE_DONNEE = 'Base de données',
  PROGRAMMATION = 'Programmation',
  CONCEPTION = 'Conception',
  SECURITE = 'Sécurité',
  RESEAUX = 'Réseaux',
  PROJET = 'Projet',
  IHM = 'IHM'
}

export interface IUE {
  initiales?: string;
  nom?: string;
  type?: UEType;
  liens?: ILien[];
}

export interface IAccueilData {
  liensPrimaires?: ILien[];
  groupesSecondaires?: IGroupe[];
  liensSecondaires?: ILien[];
  liensPlus?: IGroupe[];
  semestres?: ISemestre[];
}
