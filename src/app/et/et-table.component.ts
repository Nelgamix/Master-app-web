import {Component, Input, ViewChild} from '@angular/core';

import {EmploiTempsService} from '../services/emploi-temps.service';
import {Semaine} from '../model/et/Semaine';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {PositionTemps} from '../model/et/PositionTemps';
import {Cours} from '../model/et/Cours';
import {Exclusion} from '../model/et/Exclusion';

@Component({
  selector: 'app-et-table',
  templateUrl: './et-table.component.html',
  styleUrls: ['./et-table.component.css']
})
export class EtTableComponent {
  @Input() filtre: string;
  @Input() semaine: Semaine;
  @ViewChild(ContextMenuComponent) public menu: ContextMenuComponent;

  PositionTemps = PositionTemps;

  constructor(public etService: EmploiTempsService) {
  }

  cacher(cours: Cours, type: number): void {
    this.ajouterExclusion(cours, type, false);
  }

  exclure(cours: Cours, type: number): void {
    this.ajouterExclusion(cours, type, true);
  }

  isNotCache(item: any): boolean {
    return !item.cache;
  }

  private ajouterExclusion(cours: Cours, type: number, supprimer: boolean): void {
    let e;
    switch (type) {
      case 0: // exclure uniquement le nom.
        e = new Exclusion('', cours.nom, '', '', supprimer, false);
        break;
      case 1:
        e = new Exclusion('', cours.nom, cours.professeur, '', supprimer, false);
        break;
    }

    if (e !== null) {
      this.etService.exclure(e);
    }
  }
}
