import { BehaviorSubject } from 'rxjs/Rx';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { switchMap } from 'rxjs/operator/switchMap';
import { LibraryDialogComponent } from '../library-dialog/library-dialog.component';
import { IdentityService } from '../shared/identity.service';
import { Book, FirebaseLists, Identity, SelectableBook } from '../shared/models';

import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdDialog } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { Observable } from 'rxjs/Observable';

@Component({
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.scss'],
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
        ]),
        trigger('selected', [
            state('1', style({ transform: 'scale(1.1)', opacity: 1 })),
            transition('* <=> 1',
                animate('.25s ease-in-out', )
            ),
        ]),
        trigger('spinned', [
            state('1', style({ transform: 'rotate(180deg)' })),
            transition('* <=> 1', [
                animate('.25s ease-in-out')
            ])
        ])
    ]
})
export class LibraryComponent implements OnDestroy {

    private isAlive = true;
    private bookOwners: FirebaseListObservable<Identity[]>;
    private _$selectedBooks = new BehaviorSubject<Book[]>([]);

    public $selectedBooks: Observable<Book[]>;
    public $isSelectionMode: Observable<boolean>;
    public identity: Identity;
    public books: FirebaseListObservable<SelectableBook[]>;
    public isSelectionMode: boolean;

    constructor(
        private db: AngularFireDatabase,
        private identityService: IdentityService,
        public dialog: MdDialog
    ) {
        this.$selectedBooks = this._$selectedBooks.asObservable();

        this.identityService.$identity
            .takeWhile(() => this.isAlive)
            .subscribe(identity => {
                this.identity = identity;
                this.books = <FirebaseListObservable<SelectableBook[]>>db.list(`/${FirebaseLists[FirebaseLists.books]}`, {
                    query: {
                        orderByChild: 'ownerId',
                        equalTo: this.identity.id
                    }
                });
            });

        this.$isSelectionMode = this.$selectedBooks
            .takeWhile(() => this.isAlive)
            .map(selectedBooks => selectedBooks && !!selectedBooks.length);

        this.bookOwners = <FirebaseListObservable<Identity[]>>db.list(`/${FirebaseLists[FirebaseLists.bookOwners]}`);
    }

    public fabClick(): void {
        if (!this.isSelectionMode) {
            this.addBook();
        } else {
            this.removeBooks();
        }
    }

    private addBook() {
        const dialogRef = this.dialog.open(LibraryDialogComponent, {
            width: '80%',
            height: '50%'
        });
        dialogRef.afterClosed()
            .takeWhile(() => this.isAlive)
            .do((result: Book) => result.ownerId = this.identity.id)
            .subscribe((result: Book) => {
                this.db.database.ref(`/${FirebaseLists[FirebaseLists.books]}/${result.id}`).set(result);
                this.bookOwners
                    .subscribe(owners => {
                        if (!owners.some(o => o.id === this.identity.id)) {
                            this.db.database.ref(`/${FirebaseLists[FirebaseLists.bookOwners]}/${this.identity.id}`).set(this.identity);
                        }
                    });
            });
    }

    private removeBooks(): void {
        const updates: { [key: string]: any } = {};
        this._$selectedBooks.value.forEach(b => updates[`/${FirebaseLists[FirebaseLists.books]}/${b.id}`] = null);
        this.db.database.ref()
            .update(updates)
            .then(() => this._$selectedBooks.next([]));
    }

    public spinDone(event: AnimationEvent): void {
        this.isSelectionMode = this._$selectedBooks.value.length > 0;
    }

    public selectBook(selectedBook: SelectableBook): void {
        selectedBook.isSelected = !selectedBook.isSelected;
        if (selectedBook.isSelected) {
            this._$selectedBooks.next(this._$selectedBooks.value.concat(selectedBook));
        } else {
            this._$selectedBooks.next(this._$selectedBooks.value.filter(b => b.id !== selectedBook.id));
        }
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
