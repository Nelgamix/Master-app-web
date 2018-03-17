import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'objet', pure: false})
export class Objet implements PipeTransform {
  transform(value): any {
    const keys = [];

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push({key: key, value: value[key]});
      }
    }

    return keys;
  }
}
