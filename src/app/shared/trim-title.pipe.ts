import { Pipe, PipeTransform } from '@angular/core';
import { Book } from './models';

@Pipe({
    name: 'trimtitle'
})
export class TrimTitlePipe implements PipeTransform {
    transform(string: string, args: string): string {
        if (string && string.length > 50) {
            string = string.slice(0, 50);
            string += '...';
        }
        return string;
    }
}
