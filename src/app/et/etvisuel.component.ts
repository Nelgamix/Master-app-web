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
    // Analyse et création des listes
    const js = [];
    for (let i = 0; i < this.legendeJours.length; i++) {
      const j = this.et.emploiTemps.jours[i];
      const lists = [];
      lists.push([]); // Liste initiale
      if (!j) {
        js[i] = lists;
        continue;
      }

      for (const c of j.cours) {
        if (c.supprime) {
          continue;
        }

        let placed = false;

        // On tente de placer le cours dans les listes qui existent.
        for (const list of lists) {
          // On essaye de savoir si la fin du dernier cours ajouté dans la liste est avant le début du cours courant
          if (list.length === 0 || list[list.length - 1].fin.isBefore(c.debut)) {
            // On ajoute le cours à cette liste
            list.push(c);
            // On set placed
            placed = true;
            // On arrête le parcours des listes
            break;
          }
        }

        // On ne l'a pas placé.
        if (!placed) {
          // On ajoute une nouvelle liste avec le cours.
          lists.push([c]);
        }
      }

      js[i] = lists;
    }

    // Analyse pour le placement HTML
    this.jours = {};
    for (let i = 0; i < this.legendeJours.length; i++) {
      this.jours[i] = [];
      if (this.et.emploiTemps.jours[i]) {
        for (const c of js[i][0]) {
          const debutConverti = (c.debut.hour() * 60 + c.debut.minute()) - this.legendeHeures.debut * 60;
          const dureeConvertie = c.duree.asMinutes();
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
