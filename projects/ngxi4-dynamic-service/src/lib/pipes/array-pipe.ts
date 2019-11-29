import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'count_checked' })
export class ArrayPipe implements PipeTransform {
  transform(inputArr: Array<any>) {
    let selectedItems = inputArr.filter(el=>!el.isChecked);
    return selectedItems.length;
  }
}