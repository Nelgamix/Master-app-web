import {Component, EventEmitter, Output} from '@angular/core';
import {EmploiTempsService} from '../services/emploi-temps.service';

@Component({
  selector: 'app-et-settings',
  templateUrl: 'et-settings.component.html',
  styleUrls: ['et-settings.component.css']
})

export class EtSettingsComponent {
  @Output() onClose = new EventEmitter();

  options: any;
  couleur: any;

  constructor(private etService: EmploiTempsService) {
    this.options = etService.options;
    this.couleur = etService.options.couleur;
  }

  close(): void {
    this.etService.sauvegardeOptionsToCookies();
    this.onClose.emit();
  }
}
