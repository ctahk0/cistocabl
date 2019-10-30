import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { ErrorService } from '../../error/error.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
    isLoading = false;

    message = '';
    messageType = '';
    messageduration = 0;

    private errorStatus: Subscription;

    constructor(private authService: AuthService,
        private errorService: ErrorService
    ) { }

    ngOnInit() {
            this.errorStatus = this.errorService.getErrorListener().subscribe(err => {
                if (err === null) {
                    this.isLoading = false;
                }
            });
    }

    onLogin(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.isLoading = true;
        this.authService.loginUser(form.value.username, form.value.password, 'user/login');

    }

    ngOnDestroy() {
            this.errorStatus.unsubscribe();
    }
}
