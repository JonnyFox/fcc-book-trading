import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { Book, FirebaseLists } from '../shared/models';
import { AngularFireAuth } from 'angularfire2/auth';
import { BookService } from 'app/shared/book.service';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    public filteredBooks: Observable<Book[]>;

    private isAlive = true;

    public searchControl = new FormControl();

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private bookService: BookService
    ) {
    }

    ngOnInit(): void {
        this.filteredBooks = this.searchControl
            .valueChanges
            .takeWhile(() => this.isAlive)
            .debounceTime(250)
            .distinctUntilChanged()
            .switchMap((query: string) => this.bookService.get(query));
    }

    public login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    public logout() {
        this.afAuth.auth.signOut();
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }

}
