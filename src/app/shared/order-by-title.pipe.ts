import { Pipe, PipeTransform } from '@angular/core';
import { Book } from './models';

@Pipe({
    name: 'orderbytitle'
})
export class OrderByTitlePipe implements PipeTransform {
    transform(books: Array<Book>, args: string): Array<Book> {
        if (books) {
            books.sort((a: Book, b: Book) => {
                if (!a && !b) {
                    return 0;
                } else if (!a && b) {
                    return -1;
                } else if (a && !b) {
                    return 1;
                }
                return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
            });
        }
        return books;
    }
}
