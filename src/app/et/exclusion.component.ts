import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Exclusion} from '../model/et/exclusion';

@Component({
  selector: 'app-exclusion',
  templateUrl: './exclusion.component.html',
  styleUrls: ['./exclusion.component.css']
})
export class ExclusionComponent {
  @Input() exclusion: Exclusion;
  @Output() onSuppression = new EventEmitter<Exclusion>();

  suppressionExclusion(): void {
    this.onSuppression.emit(this.exclusion);
  }
}
