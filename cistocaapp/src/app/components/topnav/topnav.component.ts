import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topnav',
    templateUrl: './topnav.component.html',
    styleUrls: ['./topnav.component.css']
})
export class TopnavComponent implements OnInit, OnDestroy {
    pushRightClass = 'push-right';
    userCredit = 0;
    userIsAuthenticated = false;
    isAdmin = false;
    private authListenerSubs: Subscription;
    private roleListenerSubs: Subscription;
    private userCreditSubs: Subscription;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        const userInfo = this.authService.isUserLogged();
        this.userIsAuthenticated = userInfo.isUserLogged;
        this.isAdmin = userInfo.isAdmin;
        this.authListenerSubs = this.authService
            .getAuthStatus()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
        this.roleListenerSubs = this.authService
            .getAdminStatus()
            .subscribe(userRole => {
                this.isAdmin = userRole;
            });
    }

    ngOnDestroy() {
        this.authListenerSubs.unsubscribe();
        this.roleListenerSubs.unsubscribe();
        this.userCreditSubs.unsubscribe();
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    onLoggedout() {
        this.authService.logout();
        // localStorage.removeItem('isLoggedin');
        // this.router.navigate(['/login']);
    }
    onDlHistory() {
        this.router.navigate(['usersdownload']);
    }
    onProfile() {
        this.router.navigate(['profile']);
    }

    changeLang(language: string) {
        // this.translate.use(language);
    }
}
