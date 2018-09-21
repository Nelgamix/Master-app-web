import {Component, Input, OnInit} from '@angular/core';
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
