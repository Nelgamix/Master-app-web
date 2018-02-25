import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'enumKeys', pure: false})
export class EnumKeysPipe implements PipeTransform {
  transform(value: any): any {
    const items: any[] = [];

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const isValueProperty = parseInt(key, 10) >= 0;

        if (!isValueProperty) {
          continue;
        }

        items.push({key: key, value: value[key]});
      }
    }

    return items;
  }
}
