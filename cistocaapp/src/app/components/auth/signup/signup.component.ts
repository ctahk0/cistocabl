import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
// import { MessageService } from '../../appmsg/message.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorService } from '../../error/error.service';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    providers: [MessageService]
})

export class SignupComponent implements OnInit, OnDestroy {
    isLoading = false;
    private errorStatus: Subscription;
    passwordMatch = false;

    constructor(private authService: AuthService,
        private messageService: MessageService,
        private errorService: ErrorService) { }

    ngOnInit() {

        this.errorStatus = this.errorService.getErrorListener().subscribe(err => {
            if (err === null) {
                this.isLoading = false;
            }
        });
    }

    onSignup(form: NgForm) {
        console.log('Sign up');
        if (form.invalid) {
            console.log('Invalid form');
            return;
        }
        // if (!this.passwordMatch) {
        //     return;
        // }
        this.isLoading = true;
        // let lastname = form.value.firstname.split(' ');
        // console.log('From signup component', this.contributor);
        this.authService.createUser(form.value.username,
            form.value.password,
            form.value.firstname,
            form.value.lastname,
            'user/signup')
            .subscribe((res: any) => {
                // console.log(res);
                // TODO: user created successfully, redirect to login page.
                // this.router.navigate(['/login']);
                // const mess = { message: 'Account created, login to continue!', alert: true, type: 'msg_info', duration: 5 };
                // this.sendMessage(mess);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Novi nalog',
                    detail: 'Nalog je kreiran!'
                });
                this.isLoading = false;
            });
    }
    onConfirmPassword(form: NgForm) {
        if (form.value.password !== form.value.passwordconf) {
            this.passwordMatch = false;
        } else {
            this.passwordMatch = true;
        }

    }
    // sendMessage(message): void {
    //     // send message to subscribers via observable subject
    //     this.messageService.sendMessage(message);
    // }

    // clearMessage(): void {
    //     // clear message
    //     this.messageService.clearMessage();
    // }

    ngOnDestroy() {
        this.errorStatus.unsubscribe();
    }
}
