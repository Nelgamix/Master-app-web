import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-et-settings',
  templateUrl: 'et-settings.component.html',
  styleUrls: ['et-settings.component.css']
})

export class EtSettingsComponent implements OnInit {
  @Output() onClose = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  close(): void {
    this.onClose.emit();
  }
}
