import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'barHeightCap', standalone: true })
export class BarHeightCapPipe implements PipeTransform {
  transform(value: number): number {
    if (isNaN(value)) return 0;
    return Math.max(6, Math.min(100, value));
  }
}
