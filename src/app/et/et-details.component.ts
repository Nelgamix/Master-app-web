import {Component, Input, OnChanges} from '@angular/core';
import {PositionTemps} from '../model/et/PositionTemps';
import {ModalEtNotesComponent} from '../modal/et-notes.component';
import {ModalEtGestionCoursComponent} from '../modal/et-gestion-cours.component';
import {ModalEtStatsComponent} from '../modal/et-stats.component';
import {ModalEtExclusionsComponent} from '../modal/et-exclusions.component';
import {Exclusion} from '../model/et/Exclusion';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EmploiTempsService} from '../services/emploi-temps.service';
import {Semaine} from '../model/et/Semaine';
import * as moment from 'moment';

enum VueType {
  TABLE,
  VISUEL
}

@Component({
  selector: 'app-et-details',
  templateUrl: 'et-details.component.html',
  styleUrls: ['et-details.component.css']
})
export class EtDetailsComponent implements OnChanges {
  @Input() semaine: Semaine;

  VueType = VueType;

  infoSemaine: any;
  semaineProgress: number;
  filtre: string;
  vueType: VueType;
  prochainCoursTimer: any;

  constructor(private modalService: NgbModal,
              public etService: EmploiTempsService) {
  }

  ngOnChanges() {
    this.filtre = '';
    this.vueType = VueType.TABLE;
    this.updateWeekProgress();
  }

  openPersonnel() {
    const modalRef = this.modalService.open(ModalEtGestionCoursComponent, {size: 'lg'});
    modalRef.componentInstance.cours = this.etService.coursPersos.map(c => c.clone());
    modalRef.result.then(r => {
      this.etService.setCoursPerso(r);
      this.etService.analyse([this.semaine]);
    }, r => {
    });
  }

  openNotes() {
    this.modalService.open(ModalEtNotesComponent, {size: 'lg'});
  }

  openStats() {
    const modalRef = this.modalService.open(ModalEtStatsComponent, {size: 'lg'});
    modalRef.componentInstance.stats = this.semaine.ensembleCours.setCoursActifs.stats;
  }

  openExclusions() {
    // Cloner toutes les exclusions
    const ne: Exclusion[] = [];
    this.etService.exclusions.forEach(e => ne.push(e.clone()));

    // Créer l'objet possibilités, regroupant les possibilités disponibles.
    const stats = ['noms', 'types', 'professeurs', 'salles'];
    const possibilites = {};

    stats.forEach(s => possibilites[s] = Object.keys(this.semaine.ensembleCours.setCours.getStats()[s].data).sort());

    // Ouvrir modal
    const modalRef = this.modalService.open(ModalEtExclusionsComponent, {size: 'lg'});
    modalRef.componentInstance.exclusions = ne;
    modalRef.componentInstance.possibilites = possibilites;
    modalRef.result.then(
      r => {
        this.etService.setExclusions(r);
        this.etService.analyse([this.semaine]);
      }, r => {
      }
    );
  }

  private updateWeekProgress(): void {
    const now = moment();
    const first = this.semaine.date.dateDebut.clone().add(8, 'h');
    const last = this.semaine.date.dateFin.clone().add(18, 'h');

    this.semaineProgress = -1;
    this.infoSemaine = {
      /*
      -1 = on est avant cette semaine (la semaine arrive) => avant this.emploiTemps.premierJour.premierCours.debut
      0 = on est dans la semaine
      1 = on est après cette semaine => après emploiTemps.jours[5].dernierCours
       */
      placement: PositionTemps.INDEFINI,
      date: null // la date
    };

    // update info semaine
    if (now.isBefore(first)) { // on est avant
      this.infoSemaine.placement = PositionTemps.PASSE;
      this.infoSemaine.date = moment.duration(now.diff(first));
    } else if (now.isAfter(last)) { // on est après
      this.infoSemaine.placement = PositionTemps.FUTUR;
      this.infoSemaine.date = moment.duration(now.diff(last));
    } else { // on est dans la semaine
      this.infoSemaine.placement = PositionTemps.PRESENT;
      this.infoSemaine.date = moment.duration(now.diff(first));
    }

    // update week progress
    if (now.diff(first) < 0) {
      this.semaineProgress = 0;
    } else if (last.diff(now) < 0) {
      this.semaineProgress = 100;
    } else {
      this.semaineProgress = (now.diff(first, 'minutes') / (last.diff(first, 'minutes'))) * 100;
    }

    if (this.semaine.ensembleCours.setCoursActifs.coursSuivant) {
      this.prochainCoursTimer = moment.duration(now.diff(this.semaine.ensembleCours.setCoursActifs.coursSuivant.debut));
    }
  }
}
