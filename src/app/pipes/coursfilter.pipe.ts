import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'coursfilter',
  pure: false
})
export class CoursFilter implements PipeTransform {
  transform(input: any, f: string): any {
    return input.filter(item => item.nom.toLowerCase().includes(f.toLowerCase()));
  }
}
