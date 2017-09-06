import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

import {Evenement} from '../model/evenement';

@Component({
  selector: 'evenement',
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.css']
})
export class EvenementComponent implements AfterViewInit {
  @Input() ev: Evenement;
  @Input() source: any;

  @ViewChild('evRow') evRow: ElementRef;

  limitHeight: boolean;

  // Extractors: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  static extractHostname(url: string): string {
    let hostname;
    // find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('://') > -1) {
      hostname = url.split('/')[2];
    } else {
      hostname = url.split('/')[0];
    }

    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
  }

  static extractRootDomain(url: string): string {
    let domain = EvenementComponent.extractHostname(url);
    const splitArr = domain.split('.'), arrLen = splitArr.length;

    // extracting the root domain here
    if (arrLen > 2) {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    }

    return domain;
  }

  get urlDomain() {
    return EvenementComponent.extractRootDomain(this.ev.url);
  }

  ngAfterViewInit() {
    setTimeout(() => this.limitHeight = this.evRow.nativeElement.offsetHeight > 200);
  }
}
