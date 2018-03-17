import {Component, EventEmitter, OnInit} from '@angular/core';
import {MessageService} from '../services/message.service';

import {
  trigger,
  state,
  query,
  animateChild,
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
      transition(':enter', [
        style({backgroundColor: '#0f0', width: '100%'}),
        animate(5000, style({backgroundColor: '#f00', width: '0%'}))
      ])
    ]),
    trigger('fade', [
      transition(':enter', [
        style({opacity: 0}),
        animate(250, style({opacity: 1})),
        query('@*', [animateChild()], {optional: true})
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate(250, style({opacity: 0}))
      ])
    ])
  ]
})
export class MessageComponent implements OnInit {
  infoBox: {show: boolean, message: string};
  loading: boolean;

  // Events
  messages$: EventEmitter<string>;
  loadings$: EventEmitter<boolean>;

  constructor(public messageService: MessageService) {
  }

  ngOnInit() {
    this.infoBox = {
      show: false,
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
      show: true,
      message: message
    };

    setTimeout(() => {
      this.closeInfoBox();
    }, 5250);
  }

  closeInfoBox(): void {
    this.infoBox.show = false;
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
