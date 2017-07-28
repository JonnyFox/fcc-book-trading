import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import { Identity } from './models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class IdentityService {
    private _$identity: BehaviorSubject<Identity | null> = new BehaviorSubject(null);

    public get $identity(): Observable<Identity> {
        return this._$identity as Observable<Identity>;
    }

    public setIdentity(identity: Identity | null) {
        this._$identity.next(identity);
    }
}
