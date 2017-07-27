import { TradesComponent } from './trades/trades.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LibraryComponent } from './library/library.component';
import { IdentityService } from './shared/identity.service';
import { CanActivateAuthGuard } from './can-activate-auth-guard';

const appRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'library', component: LibraryComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'trades', component: TradesComponent, canActivate: [CanActivateAuthGuard] },
    { path: '', component: DashboardComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    providers: [
        IdentityService
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
