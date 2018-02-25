import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'capitalize',
  pure: false
})
export class Capitalize implements PipeTransform {
  transform(item: string): any {
    if (!item) {
      return '';
    }

    return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
  }
}
