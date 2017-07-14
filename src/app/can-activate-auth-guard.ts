import { IdentityService } from './shared/identity.service';

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CanActivateAuthGuard implements CanActivate {

    constructor(private router: Router, private identityService: IdentityService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.identityService.$identity
            .map(v => v != null)
            .do(v => {
                if (!v) this.router.navigate(['/']);
            });
    }
}
