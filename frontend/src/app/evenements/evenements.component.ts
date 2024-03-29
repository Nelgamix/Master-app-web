import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {Evenement} from '../model/ev/Evenement';
import {ModalEvenementsLoginComponent} from '../modal/evenements-login.component';
import {ModalEvenementsEditComponent} from '../modal/evenements-edit.component';

import * as moment from 'moment';
import {MessageService} from '../services/message.service';

// TODO: EDIT: vérif les champs

@Component({
  selector: 'app-evenements',
  templateUrl: './evenements.component.html',
  styleUrls: ['./evenements.component.css']
})
export class EvenementsComponent implements OnInit {
  evenements: Evenement[];
  admin: boolean;
  filtre: any;

  constructor(private http: HttpClient,
              private modalService: NgbModal,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.admin = false;

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

  get(): void {
    this.evenements = [];
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
        this.messageService.showMessage('L\'évènement a bien été ajouté!');
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
        this.messageService.showMessage('L\'évènement a bien été modifié!');
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
        this.messageService.showMessage('L\'évènement a bien été supprimé!');
      }
    });
  }

  open(url): void {
    if (url.length > 0 && !this.admin) {
      window.location.href = url;
    }
  }

  private sendRequest(reqOpt, cb): void {
    let hp = new HttpParams();
    for (const c in reqOpt) {
      if (reqOpt.hasOwnProperty(c)) {
        hp = hp.set(c, reqOpt[c]);
      }
    }

    this.http.get('backend/ev', {params: hp}).subscribe(cb);
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
