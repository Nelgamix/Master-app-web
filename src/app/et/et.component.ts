import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';

import {ModalEtStatsComponent} from '../modal/et-stats.component';
import {DatesService} from '../services/dates.service';

import * as moment from 'moment';
import {Component, OnInit} from '@angular/core';
import {Exclusion} from '../model/et/Exclusion';
import {ModalEtGestionCoursComponent} from '../modal/et-gestion-cours.component';
import {ModalEtNotesComponent} from '../modal/et-notes.component';
import {EmploiTempsInfoService} from '../services/emploi-temps-info.service';
import {Semaine} from '../model/et/Semaine';

@Component({
  selector: 'app-et-root',
  templateUrl: './et.component.html',
  styleUrls: ['./et.component.css']
})
export class EtComponent implements OnInit {
  vueType = 1;
  loading: any;
  selectedDate: any;
  infoSemaine: any;
  weekProgress: number;
  search: string;
  info: boolean;
  semaine: Semaine;

  chartData: any = [];
  colorScheme: any = {
    domain: ['#0077FF']
  };

  constructor(public etService: EmploiTempsService,
              public etInfoService: EmploiTempsInfoService,
              public datesService: DatesService,
              private modalService: NgbModal) {
    this.search = '';
    this.info = false;
    this.semaine = null;
  }

  ngOnInit(): void {
    this.getDates();
  }

  /**
   * Effectue une requête GET au serveur pour obtenir les semaines disponibles.
   * Ces semaines sont affectées à this.dates, et la semaine la plus proche est sélectionnée (this.selectedDate)
   */
  private getDates(): void {
    this.datesService.updateDates(() => {
      this.selectedDate = this.datesService.semaineProche;
      this.onChangeDate(this.datesService.semaineProche);
    });
  }

  /**
   * Active le loading screen et effectue une requête au serveur pour récupérer les données
   * @param {} date l'objet {year: xxxx, week: xx}
   */
  onChangeDate(date): void {
    this.loading = true;
    this.datesService.semaineSelectionnee = date;
    this.etService.updateData(date.week, date.year, () => {
      this.loading = false;
      this.semaine = this.etService.emploiTemps.getSemaineUnique();
    });
    this.updateWeekProgress();
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
    for (const c of this.semaine.cours) {
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

  private updateWeekProgress(): void {
    const now = moment();
    const first = this.datesService.semaineSelectionnee.debut.clone().add(8, 'h');
    const last = this.datesService.semaineSelectionnee.fin.clone().add(18, 'h');

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

    if (this.datesService.semaineSelectionnee) {
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
    }
  }

  previousWeek() {
    this.datesService.previousWeek();
    this.updateSemaine();
  }
  nextWeek() {
    this.datesService.nextWeek();
    this.updateSemaine();
  }
  nowWeek() {
    this.datesService.nowWeek();
    this.updateSemaine();
  }

  private updateSemaine() {
    this.selectedDate = this.datesService.semaineSelectionnee;
    this.onChangeDate(this.selectedDate);
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent);
    modalRef.componentInstance.stats = this.semaine.stats;
  }

  showInfo() {
    this.etInfoService.updateData(() => {
      const e = {name: 'Cours', series: []};
      this.chartData = [e];
      for (const w of this.etInfoService.data) {
        e.series.push({name: w.year + ' ' + w.week, value: w.cours.length});
      }
    });

    this.info = true;
  }
}
