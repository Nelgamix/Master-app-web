import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgbModal, NgbTabsetConfig} from '@ng-bootstrap/ng-bootstrap';

import {ModalAccueilInfoComponent} from '../modal/accueil-info.component';

import * as moment from 'moment';
import {Semestre} from '../model/accueil/Semestre';
import {Lien} from '../model/accueil/Lien';
import {Groupe} from '../model/accueil/Groupe';
import {UeType} from '../model/accueil/UEType';
import {UE} from '../model/accueil/UE';

enum VueType {
  ACCUEIL,
  LIENS_PLUS
}

@Component({
  selector: 'app-accueil-root',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  providers: [NgbTabsetConfig]
})
export class AccueilComponent implements OnInit {
  semestres: Semestre[] = [];
  liensPrimaires: Lien[] = [];
  liensSecondaires: Lien[] = [];
  liensPlus: Groupe[] = [];
  groupesSecondaires: Groupe[] = [];

  @ViewChild('tab') tab;

  VueType = VueType;
  vue: VueType;

  constructor(private http: HttpClient,
              private modalService: NgbModal) {
    this.vue = VueType.ACCUEIL;
  }

  private static parseLien(lien: string): Lien {
    return new Lien(lien['nom'], lien['description'], lien['url']);
  }

  ngOnInit(): void {
    this.http.get('assets/data.json').subscribe(data => this.parseData(data));
  }

  openLiensPlus(): void {
    this.vue = VueType.LIENS_PLUS;
  }

  closeLiensPlus(): void {
    this.vue = VueType.ACCUEIL;
    // wow
    setTimeout(() => this.analyseSemestre(), 200);
  }

  onClickOpenModal(semestreData): void {
    const modalRef = this.modalService.open(ModalAccueilInfoComponent);
    modalRef.componentInstance.data = semestreData;
  }

  private analyseSemestre(): void {
    const now = moment();
    if (now.isBefore(moment([2018, 0, 15]))) {
      this.tab.activeId = 'tab7';
    } else if (now.isBefore(moment([2018, 6, 1]))) {
      this.tab.activeId = 'tab8';
    } else if (now.isBefore(moment([2019, 0, 15]))) {
      this.tab.activeId = 'tab9';
    } else {
      this.tab.activeId = 'tab10';
    }
  }

  private parseData(data: any): void {
    const semestres: Semestre[] = [];
    const liensPrimaires: Lien[] = [];
    const liensSecondaires: Lien[] = [];
    const liensPlus: Groupe[] = [];
    const groupesSecondaires: Groupe[] = [];

    for (const g of data['primaire']) { // pour chaque groupe
      for (const l of g) { // pour chaque lien
        liensPrimaires.push(AccueilComponent.parseLien(l));
      }
    }

    let gtmp;
    for (const l of data['secondaire']) { // pour chaque lien
      if (l['liens'] != null) {
        gtmp = new Groupe(l['nom']);
        for (const ll of l['liens']) {
          gtmp.ajoutLien(AccueilComponent.parseLien(ll));
        }

        groupesSecondaires.push(gtmp);
      } else {
        liensSecondaires.push(AccueilComponent.parseLien(l));
      }
    }

    for (const g of data['liens-plus']) {
      gtmp = new Groupe(g['nom']);
      for (const l of g['liens']) {
        gtmp.ajoutLien(new Lien(l['nom'], l['description'], l['lien']));
      }
      liensPlus.push(gtmp);
    }

    let stmp, uetmp, ttmp;
    for (const s of data['semestres']) {
      stmp = new Semestre(s['numero'], s['infos']);
      for (const ue of s['ue']) {
        for (const t in UeType) {
          if (isNaN(Number(t)) && UeType[t] === ue['type']) {
            ttmp = UeType[t];
            break;
          }
        }

        uetmp = new UE(ue['nom'], ue['initiales'], ttmp);
        for (const l of ue['liens']) {
          uetmp.ajoutLien(AccueilComponent.parseLien(l));
        }

        stmp.ajoutUe(uetmp);
      }

      for (const l of s['liens']) {
        stmp.ajoutLien(AccueilComponent.parseLien(l));
      }

      semestres.push(stmp);
    }

    this.semestres = semestres;
    this.liensPrimaires = liensPrimaires;
    this.liensSecondaires = liensSecondaires;
    this.liensPlus = liensPlus;
    this.groupesSecondaires = groupesSecondaires;

    this.analyseSemestre();
  }
}
