import { animate, style, transition, trigger } from '@angular/animations';
import { BookService } from '../shared/book.service';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Book } from 'app/shared/models';
import { MdDialogRef } from '@angular/material';

@Component({
    templateUrl: './library-dialog.component.html',
    styleUrls: ['./library-dialog.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: '0' }),
                animate('.25s ease-out', style({ opacity: '.6' })),
            ]),
            transition(':leave', [
                style({ opacity: '.6' }),
                animate('.25s ease-out', style({ opacity: '0' })),
            ]),
        ])]
})
export class LibraryDialogComponent implements OnInit, OnDestroy {

    private isAlive = true;

    public filteredBooks: Observable<Book[]>;

    public searchControl = new FormControl();

    constructor(private bookService: BookService, public dialogRef: MdDialogRef<LibraryDialogComponent>) { }

    ngOnInit(): void {
        this.filteredBooks = this.searchControl
            .valueChanges
            .takeWhile(() => this.isAlive)
            .debounceTime(250)
            .distinctUntilChanged()
            .switchMap((query: string) => this.bookService.get(query));
    }

    public selectBook(book: Book) {
        this.dialogRef.close(book);
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
