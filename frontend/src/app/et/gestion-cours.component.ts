import {Component, Input, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {Cours} from '../model/et/Cours';

@Component({
  selector: 'app-gestion-cours',
  templateUrl: './gestion-cours.component.html',
  styleUrls: ['./gestion-cours.component.css']
})
export class GestionCoursComponent implements OnInit {
  @Input() cours: Cours;
  @Input() id: number;
  /*@Input() possibilites: any;*/ // Pour les typeahead

  ngOnInit(): void {
  }
}
