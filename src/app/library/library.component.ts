import { LibraryDialogComponent } from '../library-dialog/library-dialog.component';
import { IdentityService } from '../shared/identity.service';
import { Book, FirebaseLists } from '../shared/models';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdDialog } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-library',
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnDestroy {

    private isAlive = true;

    public books: FirebaseListObservable<Book[]>;

    private identityId: string;

    constructor(
        private db: AngularFireDatabase,
        private identityService: IdentityService,
        public dialog: MdDialog
    ) {
        this.identityService.$identity
            .takeWhile(() => this.isAlive)
            .subscribe(identity => {
                this.identityId = identity.id;
                this.books = <FirebaseListObservable<Book[]>>db.list(`/${FirebaseLists[FirebaseLists.books]}`, {
                    query: {
                        orderByChild: 'ownerId',
                        equalTo: this.identityId
                    }
                });
            });

    }

    public addBook(book: Book) {
        const dialogRef = this.dialog.open(LibraryDialogComponent, {
            width: '80%',
            height: '50%'
        });
        dialogRef.afterClosed()
            .subscribe((result: Book) => {
                result.ownerId = this.identityId;
                this.books.push(result);
            });
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
