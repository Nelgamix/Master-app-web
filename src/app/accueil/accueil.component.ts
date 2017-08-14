import {Component, ViewChild} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {NgbdModalAccueilInfo} from '../modal/accueil.info.component';

import * as moment from 'moment';
import * as tinycolor from 'tinycolor2';

@Component({
  selector: 'accueil-root',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
  quickLinks: any;
  otherLinks: any;
  semestres: any;

  openInNewTab: boolean;

  @ViewChild('tab') tab;

  constructor(private http: HttpClient, private modalService: NgbModal) {
    this.openInNewTab = false;
  }

  ngOnInit(): void {
    this.http.get('assets/data.json').subscribe(data => {
      this.quickLinks = data['quickLinks'];
      this.otherLinks = data['otherLinks'];
      this.semestres = data['semestres'];

      const now = moment();
      if (now < moment([2018, 1, 15])) {
        this.tab.activeId = 'tab7';
      } else if (now < moment([2018, 7, 1])) {
        this.tab.activeId = 'tab8';
      } else if (now < moment([2019, 1, 15])) {
        this.tab.activeId = 'tab9';
      } else {
        this.tab.activeId = 'tab10';
      }
    });
  }

  openWeb(lien): void {
    if (!this.openInNewTab) {
      // Ouvrir directement (comme un <a>)
      window.location.href = lien;
    } else {
      // Ouvrir nouvel onglet
      window.open(lien);
    }
  }

  getCouleur(raw): void {
    return tinycolor(raw).lighten().toHexString();
  }

  onClickOpenModal(semestreData): void {
    const modalRef = this.modalService.open(NgbdModalAccueilInfo);
    modalRef.componentInstance.data = semestreData;
  }

  typeCheckArray(val) {
    return val instanceof Array;
  }
}
