import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {NgbModal, NgbTabsetConfig} from '@ng-bootstrap/ng-bootstrap';

import {ModalAccueilInfoComponent} from '../modal/accueil-info.component';

import * as moment from 'moment';
import {Semestre} from '../model/accueil/semestre';
import {Lien} from '../model/accueil/lien';
import {Groupe} from '../model/accueil/groupe';
import {UeType} from '../model/accueil/ueType';
import {UE} from '../model/accueil/ue';

@Component({
  selector: 'app-accueil-root',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  providers: [NgbTabsetConfig]
})
export class AccueilComponent implements OnInit, OnDestroy {
  semestres: Array<Semestre> = [];
  liensPrimaires: Array<Lien> = [];
  liensSecondaires: Array<Lien> = [];
  groupesSecondaires: Array<Groupe> = [];

  @ViewChild('tab') tab;

  constructor(private http: HttpClient,
              private modalService: NgbModal,
              private cookiesService: CookieService,
              private tabConfig: NgbTabsetConfig) {
    tabConfig.justify = 'fill';
    tabConfig.type = 'pills';
  }

  private static parseLien(lien: string): Lien {
    return new Lien(lien['nom'], lien['description'], lien['url']);
  }

  ngOnInit(): void {
    this.http.get('assets/data.json').subscribe(data => {
      this.parseData(data);

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
    });
  }

  ngOnDestroy() {
  }

  private parseData(data: any): void {
    const semestres: Array<Semestre> = [];
    const liensPrimaires: Array<Lien> = [];
    const liensSecondaires: Array<Lien> = [];
    const groupesSecondaires: Array<Groupe> = [];

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
    this.groupesSecondaires = groupesSecondaires;
  }

  onClickOpenModal(semestreData): void {
    const modalRef = this.modalService.open(ModalAccueilInfoComponent);
    modalRef.componentInstance.data = semestreData;
  }
}
