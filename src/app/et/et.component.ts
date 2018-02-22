import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';

import {ModalEtStatsComponent} from '../modal/et-stats.component';
import {DatesService} from '../services/dates.service';

import {Component, OnInit} from '@angular/core';
import {Exclusion} from '../model/et/Exclusion';
import {ModalEtGestionCoursComponent} from '../modal/et-gestion-cours.component';
import {ModalEtNotesComponent} from '../modal/et-notes.component';
import {Semaine} from '../model/et/Semaine';
import {CoursPerso, CoursPersoRecurrence} from '../model/et/CoursPerso';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import * as moment from 'moment';

@Component({
  selector: 'app-et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  semaine$: Observable<Semaine>;
  semaine: Semaine;
  date$: Observable<any>;
  date: any;

  vueType = 1;
  loading: boolean;
  infoSemaine: any;
  weekProgress: number;
  search: string;
  info: boolean;

  /**
   * Countdown avant le prochain cours.
   */
  prochainCoursTimer: any;

  constructor(public etService: EmploiTempsService,
              public datesService: DatesService,
              private modalService: NgbModal,
              private route: ActivatedRoute,
              private router: Router) {
    this.search = '';
    this.info = false;
    this.semaine = null;
  }

  ngOnInit(): void {

    this.datesService.updateDates(() => {
      if (this.route.snapshot.paramMap.has('year') && this.route.snapshot.paramMap.has('week')) {
        this.semaine$ = this.route.paramMap.switchMap((params: ParamMap) => {
          this.loading = true;
          return this.etService.updateSingleWeek({year: +params.get('year'), week: +params.get('week')});
        });

        this.semaine$.subscribe((s: Semaine) => {
          this.semaine = s;
          this.updateWeekProgress();
          this.loading = false;
        });

        this.date$ = this.route.paramMap.switchMap((params: ParamMap) => {
          return this.datesService.getObsDateFromWeekYear({year: +params.get('year'), week: +params.get('week')});
        });

        this.date$.subscribe(d => this.date = d);
      } else {
        this.navigateToWeek(this.datesService.semaineProche);
      }
    });
  }

  /**
   * Active le loading screen et effectue une requête au serveur pour récupérer les données
   * @param {} date l'objet {year: xxxx, week: xx}
   */
  navigateToWeek(date): void {
    /*this.router.navigate(['et', {year: date.year, week: date.week}]);*/
    this.router.navigate(['et', date.year, date.week]);
  }

  openExclusions() {
    // Cloner toutes les exclusions
    const ne: Exclusion[] = [];
    for (const e of this.etService.exclusions) {
      ne.push(e.clone());
    }

    // Créer l'objet possibilités, regroupant les possibilités disponibles.
    const possibilites = {
      nom: [],
      type: ['CM', 'TD', 'TP', 'TD/TP'],
      professeur: [],
      salles: []
    };

    for (const c of this.semaine.setCours.cours) {
      // Nom
      if (possibilites.nom.indexOf(c.nom) < 0) {
        possibilites.nom.push(c.nom);
      }

      // Professeur
      if (possibilites.professeur.indexOf(c.professeur) < 0) {
        possibilites.professeur.push(c.professeur);
      }

      // Salles
      for (const s of c.salles) {
        if (possibilites.salles.indexOf(s.salle) < 0) {
          possibilites.salles.push(s.salle);
        }
      }
    }

    // Sort
    possibilites.professeur.sort();
    possibilites.salles.sort();

    // Ouvrir modal
    const modalRef = this.modalService.open(ModalEtExclusionsComponent, {size: 'lg'});
    modalRef.componentInstance.exclusions = ne;
    modalRef.componentInstance.possibilites = possibilites;
    modalRef.result.then(r => {
      this.etService.filterExclusions(r);
    }, r => {
    });
  }

  openPersonnel() {
    const modalRef = this.modalService.open(ModalEtGestionCoursComponent, {size: 'lg'});
    /*modalRef.componentInstance.cours = this.etService.emploiTemps.coursPrives;*/
    modalRef.result.then(r => {
    }, r => {
    });
  }

  openNotes() {
    const modalRef = this.modalService.open(ModalEtNotesComponent, {size: 'lg'});
    modalRef.result.then(r => {
    }, r => {
    });
  }

  previousWeek() {
    const pw = this.datesService.previousWeek(this.date);
    if (pw) {
      this.navigateToWeek(pw);
    }
  }

  nextWeek() {
    const pw = this.datesService.nextWeek(this.date);
    if (pw) {
      this.navigateToWeek(pw);
    }
  }

  nowWeek() {
    const pw = this.datesService.nowWeek(this.date);
    if (pw) {
      this.navigateToWeek(pw);
    }
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent, {size: 'lg'});
    modalRef.componentInstance.stats = this.semaine.stats;
  }

  showInfo() {
    this.info = true;
  }

  closeInfo() {
    this.info = false;
  }

  boutonMagique(id: number) {
    // Indiquer que fait chaque id.
    switch (id) {
      case 0: // test cours perso
        const cp = new CoursPerso(
          CoursPersoRecurrence.SEMAINE, moment(), 9 * 60, 11 * 60 + 30, 'TER', 'TER', 'TP', 'DEMEURE Alexandre', 'IMAG'
        );

        this.etService.ajoutCoursPerso([cp]);
        break;
      case 1: // Test navigation
        this.navigateToWeek({year: 2018, week: 10});
        break;
    }
  }

  private updateWeekProgress(): void {
    const now = moment();
    const first = this.date.debut.clone().add(8, 'h');
    const last = this.date.fin.clone().add(18, 'h');

    this.weekProgress = -1;
    this.infoSemaine = {
      /*
      -1 = on est avant cette semaine (la semaine arrive) => avant this.emploiTemps.premierJour.premierCours.debut
      0 = on est dans la semaine
      1 = on est après cette semaine => après emploiTemps.jours[5].dernierCours
       */
      placement: 0,
      date: null // la date
    };

    // update info semaine
    if (now.isBefore(first)) { // on est avant
      this.infoSemaine.placement = -1;
      this.infoSemaine.date = moment.duration(now.diff(first));
    } else if (now.isAfter(last)) { // on est après
      this.infoSemaine.placement = 1;
      this.infoSemaine.date = moment.duration(now.diff(last));
    } else { // on est dans la semaine
      this.infoSemaine.placement = 0;
      this.infoSemaine.date = moment.duration(now.diff(first));
    }

    // update week progress
    if (now.diff(first) < 0) {
      this.weekProgress = 0;
    } else if (last.diff(now) < 0) {
      this.weekProgress = 100;
    } else {
      this.weekProgress = (now.diff(first, 'minutes') / (last.diff(first, 'minutes'))) * 100;
    }

    // TODO
    if (this.semaine.setCours.coursSuivant) {
      this.prochainCoursTimer = moment.duration(now.diff(this.semaine.setCours.coursSuivant.debut));
    }
  }
}
