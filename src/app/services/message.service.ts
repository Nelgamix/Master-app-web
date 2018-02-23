import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class MessageService {
  messages$: EventEmitter<string>;
  loading$: EventEmitter<boolean>;

  showMessage(message: string): void {
    this.messages$.emit(message);
  }

  showLoading(): void {
    this.loading$.emit(true);
  }

  closeLoading(): void {
    this.loading$.emit(false);
  }

  getMessagesEmitter(): EventEmitter<string> {
    if (!this.messages$) {
      this.messages$ = new EventEmitter<string>();
    }

    return this.messages$;
  }

  getLoadingsEmitter(): EventEmitter<boolean> {
    if (!this.loading$) {
      this.loading$ = new EventEmitter<boolean>();
    }

    return this.loading$;
  }
}
