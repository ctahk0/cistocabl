import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | Observable<boolean> | Promise<boolean> {
        const isAuth = this.authService.isUserLogged();
        // console.log('Admin guard! is admin? ', isAuth.isAdmin);
        // console.log('Admin guard! is logged?', isAuth.isUserLogged);
        if (!isAuth.isUserLogged) {
            this.router.navigate(['/login']);
        }
        if (!isAuth.isAdmin) {
            this.router.navigate(['/dashboard']);
        }
        return isAuth.isAdmin;
    }
}
