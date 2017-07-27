import { IdentityService } from './shared/identity.service';
import { Book, Identity, FirebaseLists, Trade } from './shared/models';
import { States } from './shared/states';

import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { Observable } from 'rxjs/Rx';

declare var gapi: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, AfterViewInit {

    private isAlive = true;

    public identity: Identity;

    public googleLoginButtonId = 'google-login-button';

    public $booksCount: Observable<number>;
    public $incomingTradesCount: Observable<number>;
    public $outgoingTradesCount: Observable<number>;

    constructor(
        private router: Router,
        private identityService: IdentityService,
        private zone: NgZone,
        private identitySvc: IdentityService,
        private db: AngularFireDatabase
    ) {
        this.identityService.$identity
            .takeWhile(() => this.isAlive)
            .subscribe(identity => {
                if (identity) {
                    this.identity = identity;

                    this.$booksCount = db.list(`/${FirebaseLists[FirebaseLists.books]}`, {
                        query: {
                            orderByChild: 'ownerId',
                            equalTo: this.identity.id
                        }
                    }).map((books: Array<Book>) => !!books ? books.length : 0);


                    this.$incomingTradesCount = db.list(`/${FirebaseLists[FirebaseLists.trades]}`, {
                        query: {
                            orderByChild: 'requestTo/id',
                            equalTo: this.identity.id
                        }
                    }).map((trades: Trade[]) => !!trades ? trades.length : 0);

                    this.$outgoingTradesCount = db.list(`/${FirebaseLists[FirebaseLists.trades]}`, {
                        query: {
                            orderByChild: 'offerFrom/id',
                            equalTo: this.identity.id
                        }
                    }).map((trades: Trade[]) => !!trades ? trades.length : 0);
                }
            });
    }

    ngAfterViewInit() {
        // Converts the Google login button stub to an actual button.
        gapi.signin2.render(
            this.googleLoginButtonId,
            {
                'onSuccess': (loggedInUser: any) => this.setLoggedUser(loggedInUser),
                'scope': 'profile',
                'theme': 'dark'
            });
    }

    private setLoggedUser(loggedInUser: any) {
        this.zone.run(() => {
            const profile = loggedInUser.getBasicProfile();
            this.identitySvc.setIdentity({
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl()
            });
            this.router.navigate([`/${States[States.dashboard]}`]);
        });
    }

    ngOnDestroy(): void {
        this.isAlive = false;
    }
}
