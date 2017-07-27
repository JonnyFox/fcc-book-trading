import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { Book, FirebaseLists, Identity, SelectableBook, Trade } from '../shared/models';
import { BookService } from 'app/shared/book.service';

import * as firebase from 'firebase/app';
import { IdentityService } from 'app/shared/identity.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: '0', transform: 'scale(0)' }),
                animate('.25s ease-out', style({ opacity: '.6', transform: 'scale(1)'  })),
            ]),
            transition(':leave', [
                style({ opacity: '.6' }),
                animate('.25s ease-out', style({ opacity: '0', transform: 'scale(0)'})),
            ]),
        ]),
        trigger('selected', [
            state('1', style({ transform: 'scale(1.1)', opacity: '1' })),
            transition('* <=> 1', [
                animate('.25s ease-in-out'),
            ]),
        ]),
    ]
})
export class DashboardComponent implements OnInit, OnDestroy {


    private _$selectedBooks = new BehaviorSubject<Book[]>([]);
    private bookOwners: FirebaseListObservable<Identity[]>;
    private requestedBooks = new Array<Book>();
    private isAlive = true;
    private identityId: string;

    public $filteredBooks: Observable<Book[]>;
    public searchControl = new FormControl();
    public filterText = '';
    public $isSelectionMode: Observable<boolean>;
    public isTradingMode: boolean;
    public $filterOwner: Observable<Identity>;
    public $bookOwner: Observable<Identity>;
    public $selectedBooks: Observable<Book[]>;

    constructor(
        private db: AngularFireDatabase,
        private identityService: IdentityService,
        private bookService: BookService
    ) {
        this.$selectedBooks = this._$selectedBooks.asObservable();

        this.bookOwners = <FirebaseListObservable<Identity[]>>db.list(`/${FirebaseLists[FirebaseLists.bookOwners]}`);

        this.identityService.$identity
            .first()
            .subscribe(identity => {
                this.identityId = identity.id;
            });

        this.$isSelectionMode = this.$selectedBooks
            .takeWhile(() => this.isAlive)
            .map(selectedBooks => selectedBooks && !!selectedBooks.length);

        this.$filterOwner = <Observable<Identity>>this.$selectedBooks
            .takeWhile(() => this.isAlive)
            .map(selectedBooks => selectedBooks && !!selectedBooks.length ? selectedBooks[0] : null)
            .switchMap((book: Book) => db.list(`/${FirebaseLists[FirebaseLists.bookOwners]}`, {
                query: {
                    orderByChild: 'id',
                    equalTo: book ? book.ownerId : null
                }
            }))
            .map((identities: Identity[]) => !identities || !identities.length ? null : identities[0]);

        this.$bookOwner = this.$filterOwner
            .filter(owner => !!owner);
    }

    ngOnInit(): void {
        this.searchControl
            .valueChanges
            .takeWhile(() => this.isAlive)
            .debounceTime(250)
            .distinctUntilChanged()
            .subscribe((query: string) => this.filterText = query);

        this.initialize();
    }

    private initialize(): void {
        this.$filteredBooks = <FirebaseListObservable<SelectableBook[]>>this.db.list(`/${FirebaseLists[FirebaseLists.books]}`)
            .map(books => books.filter((book: Book) => book.ownerId !== this.identityId));
        this._$selectedBooks.next([]);
        this.requestedBooks = [];
        this.isTradingMode = false;
    }

    public selectBook(selectedBook: SelectableBook): void {
        selectedBook.isSelected = !selectedBook.isSelected;
        if (selectedBook.isSelected) {
            this._$selectedBooks.next(this._$selectedBooks.value.concat(selectedBook));
        } else {
            this._$selectedBooks.next(this._$selectedBooks.value.filter(b => b.id !== selectedBook.id));
        }
    }

    public tradeBooks(): void {
        if (!this.isTradingMode) {
            this.isTradingMode = true;
            this.requestedBooks = this._$selectedBooks.getValue();
            this._$selectedBooks.next([]);
            this.$filteredBooks = <FirebaseListObservable<SelectableBook[]>>this.db.list(`/${FirebaseLists[FirebaseLists.books]}`, {
                query: {
                    orderByChild: 'ownerId',
                    equalTo: this.identityId
                }
            });
        } else {
            if (this._$selectedBooks.getValue().length) {
                const trades = <FirebaseListObservable<Trade[]>>this.db.list(`/${FirebaseLists[FirebaseLists.trades]}`);
                trades.push(<Trade>{
                    requestToId: this.requestedBooks[0].ownerId,
                    requestedBooks: this.requestedBooks,
                    offerFromId: this.identityId,
                    offeredBooks: this._$selectedBooks.value
                });
            }
            this.initialize();
        }
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }

}
