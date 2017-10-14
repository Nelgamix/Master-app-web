import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ModalAccueilInfoComponent} from '../modal/accueil-info.component';

import * as moment from 'moment';
import * as tinycolor from 'tinycolor2';

@Component({
  selector: 'app-accueil-root',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {
  readonly openInNewTabCookie = 'accueil-oint';

  quickLinks: any;
  otherLinks: any;
  semestres: any;

  openInNewTab: boolean;

  @ViewChild('tab') tab;

  constructor(private http: HttpClient, private modalService: NgbModal, private cookiesService: CookieService) {
    this.openInNewTab = false;
  }

  ngOnInit(): void {
    if (this.cookiesService.check(this.openInNewTabCookie)) {
      this.openInNewTab = JSON.parse(this.cookiesService.get(this.openInNewTabCookie));
    }

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

  ngOnDestroy() {
    this.cookiesService.set(this.openInNewTabCookie, JSON.stringify(this.openInNewTab));
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

  onClickOpenModal(semestreData): void {
    const modalRef = this.modalService.open(ModalAccueilInfoComponent);
    modalRef.componentInstance.data = semestreData;
  }

  typeCheckArray(val) {
    return val instanceof Array;
  }
}
