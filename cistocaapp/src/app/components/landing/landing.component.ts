import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css'],
    providers: [MessageService]
})
export class LandingComponent implements OnInit, OnDestroy {
    userIsAuthenticated = false;
    isAdmin = false;
    private authListenerSubs: Subscription;
    private messageListener: Subscription;

    showTopMessage = false;

    login = true;
    resetPwd = false;

    paramsLogin: string;
    // constructor(private authService: AuthService,
    //     private messageService: MessageService,
    //     private router: Router,
    //     private activatedRoute: ActivatedRoute) { }

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private activatedRoute: ActivatedRoute) { }

    ngOnInit() {

    }
    resetPassword() {
        this.resetPwd = true;
    }

    onBack() {
        this.resetPwd = false;
    }
    ngOnDestroy() {

    }
    switchLogin() {
        console.log('User is loged in');
        if (this.login === true) {
            this.paramsLogin = 'false';
        }
        this.login = !this.login;
    }
}
