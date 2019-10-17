import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    userLogged = false;
    isAdmin = false;
    isInkasant = false;
    os = '';    // user OS

    private tokenTimer: any;
    private token: string;
    private authStatus = new Subject<boolean>();
    private adminStatus = new Subject<boolean>();
    private inkasantStatus = new Subject<boolean>();

    _url = environment.apiBase;
    // _url = 'http://japauto.parts:8000/api/';

    constructor(private _http: HttpClient, private router: Router) { }

    isUserLogged() {
        return {
            isUserLogged: this.userLogged,
            isAdmin: this.isAdmin,
            isInkasant: this.isInkasant,
            os: this.os
        };
    }
    getAuthStatus() {
        return this.authStatus.asObservable();
    }
    getAdminStatus() {
        return this.adminStatus.asObservable();
    }
    getInkasantStatus() {
        return this.inkasantStatus.asObservable();
    }
    getToken() {
        return this.token;
    }

    /** Send email to reset password */
    resetPassword(email: string, route: string) {
        const emailObj = { email: email };
        return this._http.post(
            this._url + route, emailObj
        );
    }

    /** Check token and set new password */
    setNewPassword(token: string, password: string, route: string) {
        const tkn = {
            token: token,
            password: password
        };
        return this._http.post(
            this._url + route, tkn
        );
    }

    /** INSERT/CREATE User */
    createUser(email: string, password: string, firstname: string, lastname: string, route: string) {
        // console.log('From service', contributor);
        const authData: AuthData = {
            email: email,
            password: password,
            firstname: firstname,
            lastname: lastname,
            admin: false,
            blocked: false
        };
        return this._http.post(
            this._url + route, authData
        );
    }

    /** Login User */
    loginUser(email: string, password: string, route: string) {
        const authLogin = { email: email, password: password };
        // console.log(authLogin);
        this._http.post<{ token: string, expiresIn: number, isAdmin: number }>(this._url + route, authLogin)
            .subscribe(response => {
                if (response.token) {
                    this.token = (response.token);
                    const tokenExpiresIn = response.expiresIn;
                    // decode token
                    // console.log('Token expires in ', tokenExpiresIn);
                    // console.log('Detoken: ', this.deToken(this.token));

                    const role = this.deToken(this.token);
                    console.log(role);
                    if (role['rauth'] === 1) {
                        this.isAdmin = true;
                    }
                    if (role['cauth'] === 1) {
                        this.isInkasant = true;
                    }
                    this.os = role['os'];
                    this.userLogged = true;

                    this.tokenTimer = setTimeout(() => {
                        console.log('Session expired - logout', this.tokenTimer, tokenExpiresIn);
                        this.logout();
                    }, tokenExpiresIn * 1000);
                    this.authStatus.next(true);
                    this.adminStatus.next(this.isAdmin);
                    this.inkasantStatus.next(this.isInkasant);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + tokenExpiresIn * 1000);
                    this.saveAuth(this.token, expirationDate);
                    // console.log(this.token, expirationDate);
                    // TODO: Check if user is admin, redirecd to admin or user area!
                    if (this.isAdmin) {
                        this.router.navigate(['dashboard']);
                    } else {
                        this.router.navigate(['zaduzenje']);
                    }
                }
            });
    }

    autoAuth() {
        const authInfo = this.getAuth();
        if (!authInfo) {
            return;
        }
        const now = new Date();

        const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authInfo.token;
            const role = this.deToken(this.token);
            // console.log(role);
            if (role['rauth'] === 1) {
                this.isAdmin = true;
            }
            if (role['cauth'] === 1) {
                this.isInkasant = true;
            }
            this.os = role['os'];
            this.userLogged = true;
            // this.tokenTimer = Math.round((expiresIn / 1000));
            // console.log('Session ...', this.tokenTimer, expiresIn);
            const newTime = Math.round((expiresIn / 1000));
            // console.log('Expire in ...', newTime);
            this.tokenTimer = setTimeout(() => {
                this.logout();
            }, newTime * 1000);
            this.authStatus.next(true);
        }
    }

    logout() {
        this.token = null;
        this.userLogged = false;
        this.isAdmin = false;
        this.isInkasant = false;
        this.authStatus.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuth();
        this.router.navigate(['/']);
    }

    saveAuth(token: string, expireDate: Date) {
        localStorage.setItem('auth', token);
        localStorage.setItem('expired', expireDate.toISOString());
    }

    clearAuth() {
        localStorage.removeItem('auth');
        localStorage.removeItem('expired');
    }

    private getAuth() {
        const token = localStorage.getItem('auth');
        const expiresIn = localStorage.getItem('expired');
        if (!token || !expiresIn) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expiresIn)
        };
    }

    private deToken(token: string) {
        if (!token) {
            return 0;
        }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const role = JSON.parse(window.atob(base64));
        // console.log(role);

        return ({ rauth: role.rauth, cauth: role.cauth, os: role.os });
        // return false;
    }
}
