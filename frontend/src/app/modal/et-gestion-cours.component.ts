import {NgbActiveModal, NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, HostListener, Injectable, Input, OnInit, Output} from '@angular/core';
import {CoursPerso, CoursPersoRecurrence} from '../model/et/CoursPerso';
import * as moment from 'moment';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

enum VueType {
  LISTE,
  DETAILS
}

@Component({
  selector: 'app-modal-et-gestion-cours-cours',
  template:
  `
    <div id="cours" class="row" [@selection]="selected" (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
      <div class="col-12 col-md-6 col-lg-2">
        {{CoursPersoRecurrence[cours.recurrence] | capitalize}}
      </div>
      <div class="col-12 col-md-6 col-lg-1">
        {{cours.type}}
      </div>
      <div class="col-12 col-md-6 col-lg-2">
        {{cours.nom}}
      </div>
      <div class="col-12 col-md-6 col-lg-3 text-truncate">
        {{cours.description}}
      </div>
      <div class="col-12 col-md-6 col-lg-2 text-truncate">
        {{cours.professeur}}
      </div>
      <div class="col-12 col-md-6 col-lg-2">
        {{cours.lieu}}
      </div>
    </div>
  `,
  styles: ['#cours:hover {cursor: pointer}'],
  animations: [
    trigger('selection', [
      state('0', style({
        background: 'inherit',
        borderLeft: 'inherit'
      })),
      state('1', style({
        background: 'linear-gradient(to right, #ffa51e5e, #ceca531f)',
        borderLeft: '5px solid black'
      })),
      transition('0 => 1', animate('200ms')),
      transition('1 => 0', animate('200ms'))
    ])
  ]
})
export class CoursPersoComponent {
  @Input() cours: CoursPerso;
  @Output() onSelect = new EventEmitter<CoursPerso>();

  selected: boolean;

  CoursPersoRecurrence = CoursPersoRecurrence;

  @HostListener('click') onClick() {
    this.onSelect.emit(this.cours);
  }

  onMouseEnter() {
    this.selected = true;
  }

  onMouseLeave() {
    this.selected = false;
  }

  constructor() {
    this.selected = false;
  }
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
export class ModalEtGestionCoursComponent {
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

  close(changeVue: boolean = true): void {
    this.coursSelectionne.debut = +this.heures.debut.heure * 60 + +this.heures.debut.minute;
    this.coursSelectionne.fin = +this.heures.fin.heure * 60 + +this.heures.fin.minute;
    if (changeVue) this.vue = VueType.LISTE;
  }

  new(): void {
    this.cours.push(
      new CoursPerso(
        CoursPersoRecurrence.SEMAINE,
        moment(),
        8 * 60,
        10 * 60,
        'Description',
        'Cours',
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
    if (this.vue === VueType.DETAILS) {
      this.close(false);
    }

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
