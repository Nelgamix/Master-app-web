import {NgbActiveModal, NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {CoursPerso, CoursPersoRecurrence} from '../model/et/CoursPerso';
import * as moment from 'moment';

enum VueType {
  LISTE,
  DETAILS
}

@Injectable()
export class NgbDateMomentAdapter extends NgbDateAdapter<moment.Moment> {
  fromModel(date: moment.Moment): NgbDateStruct {
    return date ? {year: date.year(), month: date.month() + 1, day: date.date()} : null;
  }

  toModel(date: NgbDateStruct): moment.Moment {
    return date ? moment({year: date.year, month: date.month - 1, day: date.day}) : null;
  }
}

@Component({
  selector: 'app-modal-et-gestion-cours',
  templateUrl: './et-gestion-cours.component.html',
  providers: [{provide: NgbDateAdapter, useClass: NgbDateMomentAdapter}]
})
export class ModalEtGestionCoursComponent implements OnInit {
  @Input() cours: CoursPerso[];
  @Output() out = new EventEmitter();

  VueType = VueType;
  vue: VueType = VueType.LISTE;
  coursSelectionne: CoursPerso;

  heures: {
    debut: {
      heure: number,
      minute: number
    },
    fin: {
      heure: number,
      minute: number
    }
  };

  CoursPersoRecurrence = CoursPersoRecurrence;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
  }

  open(cours: CoursPerso): void {
    this.coursSelectionne = cours;
    this.heures = {
      debut: {
        heure: Math.floor(cours.debut / 60),
        minute: cours.debut % 60
      },
      fin: {
        heure: Math.floor(cours.fin / 60),
        minute: cours.fin % 60
      }
    };
    this.vue = VueType.DETAILS;
  }

  close(): void {
    this.coursSelectionne.debut = +this.heures.debut.heure * 60 + +this.heures.debut.minute;
    this.coursSelectionne.fin = +this.heures.fin.heure * 60 + +this.heures.fin.minute;
    this.vue = VueType.LISTE;
  }

  new(): void {
    this.cours.push(
      new CoursPerso(
        CoursPersoRecurrence.SEMAINE,
        moment(),
        8 * 60,
        10 * 60,
        'Nouveau cours perso',
        'NM',
        'Autre',
        '',
        ''
      )
    );
  }

  delete(cours: CoursPerso): void {
    const i = this.cours.indexOf(cours);
    if (i >= 0) {
      this.cours.splice(i, 1);
    }
  }

  valider(): void {
    let i = 0;
    while (i < this.cours.length) {
      const e = this.cours[i];
      if (e.estVide()) {
        this.cours.splice(i, 1);
      } else {
        i++;
      }
    }
    this.activeModal.close(this.cours);
  }
}
