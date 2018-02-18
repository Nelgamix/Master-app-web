import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class EmploiTempsInfoService {
  /** Le récap de ce qui est en BD. ({year: number, week: number, stats: null|any, updated: string, cours: any[]}[]) */
  data: any;

  constructor(private http: HttpClient) {
    this.data = [];
  }

  updateData(cb): void {
    this.http.get('php/ical.php?info=true').subscribe(data => {
      this.data = data;
      this.sortData(this.data);
      if (cb && cb instanceof Function) {
        cb();
      }
    });
  }

  private sortData(data: any): void {
    data.sort((e1, e2) => {
      const y1 = parseInt(e1['year']);
      const y2 = parseInt(e2['year']);
      const w1 = parseInt(e1['week']);
      const w2 = parseInt(e2['week']);

      if (y1 < y2) return -1;
      if (y1 > y2) return 1;

      if (w1 < w2) return -1;
      if (w1 > w2) return 1;

      return 0;
    });
  }
}
