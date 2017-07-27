import { Pipe, PipeTransform } from '@angular/core';
import { Book } from './models';

@Pipe({
    name: 'filterbytitle'
})
export class FilterByTitlePipe implements PipeTransform {
    transform(books: Array<Book>, filter: string): Array<Book> {
        if (books) {
            const regexp = new RegExp(`.*${filter}.*`, 'i');
            return books.filter(b => regexp.test(b.volumeInfo.title));
        }
        return books;
    }
}
