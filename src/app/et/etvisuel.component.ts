import {Component, OnInit} from '@angular/core';

import {EmploiTempsService} from '../services/emploi-temps.service';

@Component({
  selector: 'app-et-visuel',
  templateUrl: './etvisuel.component.html',
  styleUrls: ['./etvisuel.component.css']
})
export class EtVisuelComponent implements OnInit {
  jours: {};

  legendeHeures = {
    debut: 8,
    fin: 20,
    interval: 1,
    legendes: []
  };

  legendeJours = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi'
  ];

  constructor(public et: EmploiTempsService) {
    this.et.registerObserver(this);
    const le = this.legendeHeures;
    for (let i = le.debut; i <= le.fin; i = i + le.interval) {
      le.legendes.push(i);
    }
  }

  ngOnInit() {
    this.analyse();
  }

  changed() {
    this.analyse();
  }

  analyse(): void {
    this.jours = {};
    for (let i = 0; i < this.legendeJours.length; i++) {
      this.jours[i] = [];
      if (this.et.emploiTemps.jours[i]) {
        for (const c of this.et.emploiTemps.jours[i].cours) {
          const debutConverti = (c.debut.hour() * 60 + c.debut.minute()) - this.legendeHeures.debut * 60;
          const dureeConvertie = c.duree.hour() * 60 + c.duree.minute();
          const dureeMax = this.legendeHeures.fin * 60 - this.legendeHeures.debut * 60;
          this.jours[i].push({
            cours: c,
            position: {
              top: (debutConverti / dureeMax) * 100,
              height: (dureeConvertie / dureeMax) * 100
            }
          });
        }
      }
    }
  }
}
