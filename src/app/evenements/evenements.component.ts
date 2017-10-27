import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {Evenement} from '../model/ev/evenement';
import {ModalEvenementsLoginComponent} from '../modal/evenements-login.component';
import {ModalEvenementsEditComponent} from '../modal/evenements-edit.component';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import * as moment from 'moment';

/*
TODO:
  * EDIT: vérif les champs
  * EDIT: montrer le loading
  * LOGIN: montrer le loading
 */

@Component({
  selector: 'app-evenements',
  templateUrl: './evenements.component.html',
  styleUrls: ['./evenements.component.css'],
  animations: [
    trigger('infoBoxState', [
      state('inactive', style({
        backgroundColor: '#0f7',
        width: '100%'
      })),
      state('active', style({
        backgroundColor: '#f00',
        width: '0%'
      })),
      transition('inactive => active', animate(5000))
    ])
  ]
})
export class EvenementsComponent implements OnInit {
  evenements: Evenement[];
  admin: boolean;
  filtre: any;

  infoBox: any;

  constructor(private http: HttpClient, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.admin = false;
    this.infoBox = {
      state: 'inactive',
      message: 'Info-box'
    };

    const now = moment();
    this.filtre = {
      temporel: 1, // 1 = futurs, 0 = passés
      date: {year: now.year(), month: now.month() + 1, day: now.date()},
      type: Evenement.defCouleurs
    };

    for (const f of this.filtre.type) {
      f.actif = true;
    }

    this.get();
  }

  showInfoBox(message): void {
    this.infoBox = {
      state: 'active',
      message: message
    };
    setTimeout(() => {
      this.infoBox.state = 'inactive';
    }, 5000);
  }

  get(): void {
    this.evenements = [];
    const test = false;
    if (!test) {
      this.sendRequest({req: 'get'}, data => {
        if (data && data.success) {
          if (data.success) {
            for (const e of data.data) {
              this.evenements.push(new Evenement(e));
            }

            this.sortDates(false);
          }

          this.admin = data['admin'];
        }
      });
    } else {
      this.admin = true;
      this.evenements.push(new Evenement({
        id: 0,
        debut: '2017-08-05 18:00',
        fin: '2017-08-10 18:00',
        info: 'Info ici',
        type: 'Vie de la filière',
        url: ''
      }));
      this.evenements.push(new Evenement({
        id: 0,
        debut: '2017-08-05 11:00',
        fin: '2017-08-07 13:00',
        info: 'Info ici',
        type: 'Examens',
        url: ''
      }));
      this.evenements.push(new Evenement({
        id: 0,
        debut: '2017-08-15 11:00',
        fin: '2017-08-15 13:00',
        info: 'Info ici',
        type: 'Devoirs à rendre',
        url: ''
      }));
      this.evenements.push(new Evenement({
        id: 0,
        debut: '2017-08-25 11:00',
        fin: '',
        info: 'Info ici',
        type: 'Vie étudiante',
        url: ''
      }));
      this.evenements.push(new Evenement({
        id: 0,
        debut: '2017-09-09 11:00',
        fin: '2017-09-09 13:00',
        info: 'Info ici',
        type: 'Autres',
        url: ''
      }));
      this.sortDates(false);
    }
  }

  sortDates(invert): void {
    this.evenements.sort(function (left, right) {
      if (invert) {
        return right.debut.diff(left.debut);
      } else {
        return left.debut.diff(right.debut);
      }
    });
  }

  insert(ev): void {
    this.sendRequest({
      req: 'insert',
      debut: ev.getDebutFormat(),
      fin: ev.getFinFormat(),
      info: ev.getInfo(),
      type: ev.getType(),
      url: ev.getUrl()
    }, data => {
      if (data && data.success) {
        this.get(); // il faut récup l'id (de l'objet inséré) pour pouvoir update, sinon on ne l'a pas
        this.showInfoBox('L\'évènement a bien été ajouté!');
      }
    });
  }

  update(ev): void {
    this.sendRequest({
      req: 'update',
      id: ev.id,
      debut: ev.getDebutFormat(),
      fin: ev.getFinFormat(),
      info: ev.getInfo(),
      type: ev.getType(),
      url: ev.getUrl()
    }, data => {
      if (data && data.success) {
        this.showInfoBox('L\'évènement a bien été modifié!');
      }
    });
  }

  delete(ev): void {
    this.sendRequest({
      req: 'delete',
      id: ev.id
    }, data => {
      if (data && data.success) {
        this.evenements.splice(this.evenements.indexOf(ev), 1);
        this.showInfoBox('L\'évènement a bien été supprimé!');
      }
    });
  }

  open(url): void {
    if (url.length > 0 && !this.admin) {
      window.location.href = url;
    }
  }

  sendRequest(reqOpt, cb): void {
    let hp = new HttpParams();
    for (const c in reqOpt) {
      if (reqOpt.hasOwnProperty(c)) {
        hp = hp.set(c, reqOpt[c]);
      }
    }

    this.http.get('php/ev.php', {params: hp}).subscribe(cb);
  }

  openLogin(): void {
    const modalRefLogin = this.modalService.open(ModalEvenementsLoginComponent);
    modalRefLogin.componentInstance.inObj = this;
  }

  openAjout(): void {
    const ev = new Evenement();
    if (ev.debut.minutes() % 15 !== 0) {
      ev.debut.add(15 - (ev.debut.minutes() % 15), 'minutes');
    }

    this.openEdit(0, ev);
  }

  openMod(ev): void {
    this.openEdit(1, ev);
  }

  openEdit(type: number, ev: Evenement): void {
    const modalRefEdit = this.modalService.open(ModalEvenementsEditComponent, {size: 'lg'});
    modalRefEdit.componentInstance.data = {
      source: this,
      ev: ev,
      type: type
    };
  }

  openDelete(ev): void {
    if (window.confirm('Voulez-vous vraiment supprimer cet évènement?')) {
      this.delete(ev);
    }
  }
}
