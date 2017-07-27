import { Pipe, PipeTransform } from '@angular/core';
import { Book, Identity } from './models';

@Pipe({
    name: 'filterbyowner'
})
export class FilterByOwnerPipe implements PipeTransform {
    transform(books: Array<Book>, filter: Identity): Array<Book> {
        if (books && !!filter) {
            return books.filter(b => b.ownerId === filter.id);
        }
        return books;
    }
}
