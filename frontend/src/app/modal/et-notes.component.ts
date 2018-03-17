import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component} from '@angular/core';
import {NotesService} from '../services/notes.service';
import {Note} from '../model/et/Note';

enum Etat {
  LISTE,
  VISUALISATION,
  EDITION_NOUVEAU,
  EDITION_EXISTANT
}

@Component({
  selector: 'app-modal-et-notes',
  templateUrl: './et-notes.component.html',
  styleUrls: ['./et-notes.component.css']
})
export class ModalEtNotesComponent {
  Etat = Etat;

  /**
   * Mode: int représentant le mode actuel.
   * 0 = vue liste,
   * 1 = vue visualisation,
   * 2 = vue édition de note (nouvelle note),
   * 3 = vue édition de note (note existante)
   */
  mode: Etat;

  /** La note acutellement sélectionnée */
  noteActive: Note;

  /** Une copie de la note active, utilisée pour "brouillon" au cas où l'utilisateur annule */
  noteTmp: Note;

  constructor(public activeModal: NgbActiveModal,
              private notesService: NotesService) {
    this.mode = Etat.LISTE;
  }

  nouvelleNote(): Note {
    this.mode = Etat.EDITION_NOUVEAU;
    return (this.noteTmp = new Note());
  }

  enregistrerNote(n: Note): void {
    if (this.mode === Etat.EDITION_NOUVEAU) {
      this.notesService.ajoutNote(n);
    } else if (this.mode === Etat.EDITION_EXISTANT) {
      this.noteActive.copyFrom(n);
      this.notesService.modificationNote(this.noteActive);
    }

    this.mode = 0;
  }

  supprimerNote(n: Note): void {
    this.notesService.suppressionNote(n);
    this.noteActive = null;
  }

  modifierNote(n: Note): void {
    this.mode = Etat.EDITION_EXISTANT;
    this.noteTmp = n.clone();
  }

  getNotes(): Note[] {
    return this.notesService.notes;
  }
}
