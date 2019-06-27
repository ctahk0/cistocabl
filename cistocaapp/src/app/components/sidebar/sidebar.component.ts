import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    showMenu = '';
    userIsAuthenticated = false;
    isAdmin = false;
    isContributor = false;
    isSupport = false;
    os = '';
    pushRightClass = 'push-right';
    newMessages = null;

    pending = false;

    private authListenerSubs: Subscription;
    private roleadmin: Subscription;
    constructor(private authService: AuthService) { }

    ngOnInit() {
        const userInfo = this.authService.isUserLogged();
        this.userIsAuthenticated = userInfo.isUserLogged;
        this.isAdmin = userInfo.isAdmin;
        this.os = userInfo.os;

        this.authListenerSubs = this.authService
            .getAuthStatus()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
        this.roleadmin = this.authService
            .getAdminStatus()
            .subscribe(userRole => {
                this.isAdmin = userRole;
                // console.log(userRole);
            });

        // this.mysqlservice.getUnreadEmails();
        // this.newMessagesSubs = this.mysqlservice.unreadmessages.subscribe(total => {
        //     total === 0 ? this.newMessages = null : this.newMessages = total;
        // });
        // this.membersservice.isPending.subscribe(pending => this.pending = pending);
    }

    onMenuClick() {
        // console.log('Click');
        // console.log(el);
        // if (el === 'pending') {
        //     this.membersservice.changePending(true);
        // } else if (el === 'data') {
        //     this.membersservice.changePending(false);
        // }
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    ngOnDestroy() {
        this.authListenerSubs.unsubscribe();
        this.roleadmin.unsubscribe();
    }
}
