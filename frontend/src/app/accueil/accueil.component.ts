import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbTabsetConfig} from '@ng-bootstrap/ng-bootstrap';

import {ModalAccueilInfoComponent} from '../modal/accueil-info.component';

import {Lien} from '../model/accueil/Lien';
import {AccueilService} from './accueil.service';
import {AccueilData} from '../model/accueil/AccueilData';

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
  accueilData: AccueilData;

  @ViewChild('tab') tab;
  tabActiveId;

  VueType = VueType;
  vue: VueType;

  constructor(private accueilService: AccueilService,
              private modalService: NgbModal) {
    this.vue = VueType.ACCUEIL;
  }

  ngOnInit(): void {
    this.accueilService.getAccueilData('assets/data.json').subscribe(data => {
      this.accueilData = data;
      this.analyseSemestre();
    });
  }

  openLiensPlus(): void {
    this.vue = VueType.LIENS_PLUS;
  }

  closeLiensPlus(): void {
    this.vue = VueType.ACCUEIL;
  }

  onClickOpenModal(semestreData): void {
    const modalRef = this.modalService.open(ModalAccueilInfoComponent);
    modalRef.componentInstance.data = semestreData;
  }

  // Doit être la même fonction (adaptée) que celle du code python qui récupère les icones.
  getIconName(l: Lien): string {
    return l.nom.replace(' ', '_').toLowerCase();
  }

  private analyseSemestre(): void {
    if (this.tab) {
      this.tab.activeId = `tab${this.accueilService.currentSemestre.numero}`;
    } else {
      this.tabActiveId = `tab${this.accueilService.currentSemestre.numero}`;
    }
  }
}
