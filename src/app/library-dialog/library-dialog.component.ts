import { BookService } from '../shared/book.service';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Book } from 'app/shared/models';
import { MdDialogRef } from '@angular/material';

@Component({
    selector: 'app-library-dialog',
    templateUrl: './library-dialog.component.html',
    styleUrls: ['./library-dialog.component.scss']
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
