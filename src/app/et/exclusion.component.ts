import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Exclusion} from '../model/et/exclusion';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'app-exclusion',
  templateUrl: './exclusion.component.html',
  styleUrls: ['./exclusion.component.css']
})
export class ExclusionComponent implements OnInit {
  @Input() exclusion: Exclusion;
  @Input() id: number;
  @Input() possibilites: any;
  @Output() onSuppression = new EventEmitter<Exclusion>();

  details: boolean;

  searchNom = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.possibilites.nom.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 6));

  searchType = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.possibilites.type.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 4));

  searchProfesseur = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.possibilites.professeur.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 6));

  searchSalles = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.possibilites.salles.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 6));

  ngOnInit(): void {
    if (this.exclusion.type.length > 0
        || this.exclusion.professeur.length > 0
        || this.exclusion.salle.length > 0) {
      this.details = true;
    } else {
      this.details = false;
    }
  }

  suppressionExclusion(): void {
    this.onSuppression.emit(this.exclusion);
  }
}
