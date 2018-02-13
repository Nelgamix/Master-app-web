import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Note} from '../model/et/Note';
import * as moment from 'moment';

@Injectable()
export class NotesService {
  readonly notesCookie = 'et-notes';

  notes: Note[];

  constructor(private cookieService: CookieService) {
    this.initFromCookies();
  }

  initFromCookies(): Note[] {
    this.notes = [];

    if (this.cookieService.check(this.notesCookie)) {
      const eJson = JSON.parse(this.cookieService.get(this.notesCookie));
      if (eJson && eJson instanceof Array) {
        for (const o of eJson) {
          this.notes.push(new Note(o['dateCreation'], o['dateModification'], o['description'], o['texte']));
        }
      }
    }

    return this.notes;
  }

  ajoutNote(n: Note): void {
    n.dateCreation = moment();
    this.notes.push(n);
    this.sauvegardeCookies();
  }

  modificationNote(n: Note): boolean {
    const i = this.notes.indexOf(n);
    if (i >= 0) {
      n.dateModification = moment();
      this.sauvegardeCookies();
      return true;
    } else {
      return false;
    }
  }

  suppressionNote(n: Note): boolean {
    const i = this.notes.indexOf(n);
    if (i >= 0) {
      this.notes.splice(i, 1);
      this.sauvegardeCookies();
      return true;
    } else {
      return false;
    }
  }

  private sauvegardeCookies(): void {
    this.cookieService.set(this.notesCookie, JSON.stringify(this.notes));
  }
}
