import { animate, style, transition, trigger } from '@angular/animations';
import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { FirebaseLists, Trade } from '../shared/models';
import { IdentityService } from '../shared/identity.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss'],
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
export class TradesComponent implements OnInit, OnDestroy {

    private isAlive = true;

    public $incomingTrades: FirebaseListObservable<Trade[]>;
    public $outgoingTrades: FirebaseListObservable<Trade[]>;

    private incomingTrades: Trade[];
    private outgoingTrades: Trade[];

    constructor(
        private db: AngularFireDatabase,
        private identityService: IdentityService,
    ) {
        this.identityService.$identity
            .takeWhile(() => this.isAlive)
            .subscribe(identity => {
                this.$incomingTrades = <FirebaseListObservable<Trade[]>>this.db.list(`/${FirebaseLists[FirebaseLists.trades]}`, {
                    query: {
                        orderByChild: 'requestTo/id',
                        equalTo: identity.id
                    }
                }).takeWhile(() => this.isAlive);

                this.$outgoingTrades = <FirebaseListObservable<Trade[]>>this.db.list(`/${FirebaseLists[FirebaseLists.trades]}`, {
                    query: {
                        orderByChild: 'offerFrom/id',
                        equalTo: identity.id
                    }
                }).takeWhile(() => this.isAlive);
            });

        this.$incomingTrades
            .takeWhile(() => this.isAlive)
            .subscribe((incoming: Trade[]) => this.incomingTrades = incoming);

        this.$outgoingTrades
            .takeWhile(() => this.isAlive)
            .subscribe((outgoing: Trade[]) => this.outgoingTrades = outgoing);
    }

    public cancelTrade(trade: Trade) {
        const updates: { [key: string]: any } = {};
        updates[`/${FirebaseLists[FirebaseLists.trades]}/${trade.$key}`] = null;
        this.db.database.ref().update(updates);
    }

    public confirmTrade(trade: Trade) {
        const updates: { [key: string]: any } = {};
        updates[`/${FirebaseLists[FirebaseLists.trades]}/${trade.$key}`] = null;

        const canceledOutgoing = this.outgoingTrades
            .filter(outTrade => trade.requestedBooks
                .some(reqBook => outTrade.offeredBooks
                    .some(offBook => offBook.id === reqBook.id)));

        const canceledIncoming = this.incomingTrades
            .filter(inTrade => trade.requestedBooks
                .some(reqBook => inTrade.requestedBooks
                    .some(req2Book => req2Book.id === reqBook.id)));

        canceledOutgoing.forEach(co => updates[`/${FirebaseLists[FirebaseLists.trades]}/${co.$key}`] = null);
        canceledIncoming.forEach(ci => updates[`/${FirebaseLists[FirebaseLists.trades]}/${ci.$key}`] = null);

        trade.requestedBooks.forEach(rb => updates[`/${FirebaseLists[FirebaseLists.books]}/${rb.id}/ownerId`] = trade.offerFrom.id);
        trade.offeredBooks.forEach(ob => updates[`/${FirebaseLists[FirebaseLists.books]}/${ob.id}/ownerId`] = trade.requestTo.id);

        this.db.database.ref().update(updates);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.isAlive = false;
    }

}
