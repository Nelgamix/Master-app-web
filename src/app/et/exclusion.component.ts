import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Exclusion} from '../model/et/exclusion';

@Component({
  selector: 'app-exclusion',
  templateUrl: './exclusion.component.html',
  styleUrls: ['./exclusion.component.css']
})
export class ExclusionComponent implements OnInit {
  @Input() exclusion: Exclusion;
  @Input() id: number;
  @Output() onSuppression = new EventEmitter<Exclusion>();

  details: boolean;

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
