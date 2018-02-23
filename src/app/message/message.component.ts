import {Component, EventEmitter, OnInit} from '@angular/core';
import {MessageService} from '../services/message.service';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.css'],
  animations: [
    trigger('infoBoxState', [
      state('inactive', style({
        backgroundColor: '#0f7',
        width: '100%'
      })),
      state('active', style({
        backgroundColor: '#f00',
        width: '0%'
      })),
      transition('inactive => active', animate(5000))
    ]),
    trigger('loading', [
      transition(':enter', [
        style({opacity: 0}),
        animate(250, style({opacity: 1}))
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate(250, style({opacity: 0}))
      ])
    ])
  ]
})
export class MessageComponent implements OnInit {
  infoBox: {state: string, message: string};
  loading: boolean;

  // Events
  messages$: EventEmitter<string>;
  loadings$: EventEmitter<boolean>;

  constructor(public messageService: MessageService) {
  }

  ngOnInit() {
    this.infoBox = {
      state: 'inactive',
      message: 'Info-box'
    };
    this.loading = false;

    this.messages$ = this.messageService.getMessagesEmitter();
    this.messages$.subscribe((m: string) => this.showInfoBox(m));

    this.loadings$ = this.messageService.getLoadingsEmitter();
    this.loadings$.subscribe((b: boolean) => this.showLoading(b));
  }

  showInfoBox(message): void {
    this.infoBox = {
      state: 'active',
      message: message
    };

    setTimeout(() => {
      this.closeInfoBox();
    }, 5000);
  }

  closeInfoBox(): void {
    this.infoBox.state = 'inactive';
  }

  showLoading(b: boolean): void {
    if (b) {
      this.loading = true;
    } else {
      this.closeLoading();
    }
  }

  closeLoading(): void {
    this.loading = false;
  }
}
