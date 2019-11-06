import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './components/auth/auth.guard';
import { AdminGuard } from './components/auth/admin.guard';
import { ZaduzenjeComponent } from './components/novo-zaduzenje/zaduzenje.component';
import { InkasantiDashboardComponent } from './components/inkasanti-dashboard/inkasanti-dashboard.component';
import { PretragaKorisnikaComponent } from './components/pretraga-korisnika/pretraga-korisnika.component';
import { NoviKorisnikComponent } from './components/novi-korisnik/novi-korisnik.component';
import { IzvjestajiComponent } from './components/izvjestaji/izvjestaji.component';
import { IzvjestajiInkasantiComponent } from './components/izvjestaji-inkasanti/izvjestaji-inkasanti.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'zaduzenje', component: ZaduzenjeComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'inkasanti', component: InkasantiDashboardComponent, canActivate: [AuthGuard] },
  { path: 'pretraga', component: PretragaKorisnikaComponent, canActivate: [AuthGuard] },
  { path: 'novikorisnik', component: NoviKorisnikComponent, canActivate: [AuthGuard] },
  { path: 'izvjestaji', component: IzvjestajiComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'inkasantiizv', component: IzvjestajiInkasantiComponent, canActivate: [AuthGuard, AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AdminGuard]
})

export class AppRoutingModule { }
