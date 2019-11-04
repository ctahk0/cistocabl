import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MatTableDataSource, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import { ZaduzenjeService } from '../novo-zaduzenje/zaduzenje.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

    userIsAuthenticated = false;
    isAdmin = false;
    os = '';
    isLoading = false;

    displayedColumns: string[] = [
        'broj',
        'datum',
        'tip_zaduzenja',
        'kontrola_opis',
        'napomena',
        'status',
        'Details button'];

    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    zaduzenja = [];
    totalRows = 0;
    pageSize = 20;
    pageIndex = 0;
    filter = '';
    selectedRowIndex = -1;

    details: object;

    private authListenerSubs: Subscription;
    private zaduzenjeServiceSubs: Subscription;

    constructor(private authService: AuthService,
        private mysqlservice: MainService,
        private zaduzenjeService: ZaduzenjeService,
        private router: Router) { }

    ngOnInit() {
        const userInfo = this.authService.isUserLogged();
        this.userIsAuthenticated = userInfo.isUserLogged;
        this.isAdmin = userInfo.isUserLogged;
        this.os = userInfo.os;

        this.showList();
        this.authListenerSubs = this.authService
            .getAuthStatus()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });

        this.zaduzenjeServiceSubs = this.zaduzenjeService.currentDetails.subscribe(details => this.details = details);
    }

    showList() {
        this.isLoading = true;
        this.mysqlservice.getZaduzenja(this.pageSize, this.pageIndex, this.filter)
            .subscribe((mydata: any) => {
                this.totalRows = mydata.totalRec;
                this.zaduzenja = mydata.data;
                this.dataSource = new MatTableDataSource(this.zaduzenja);
                this.dataSource.sort = this.sort;
                this.isLoading = false;
                // this.dataSource.paginator = this.paginator;
            });
    }

    applyFilter(filterValue: string) {
        this.filter = filterValue.trim().toLowerCase();
        this.showList();
        this.pageIndex = 0;
        this.paginator.firstPage();
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onChangedPage(pageData: PageEvent) {
        this.pageSize = pageData.pageSize;
        this.pageIndex = pageData.pageIndex;
        this.showList();
    }

    sendMemberMessage(row: object, idx: number): void {
        this.selectedRowIndex = idx;  // just for highlight
    }

    onNovoZaduzenje() {
        this.router.navigate(['/zaduzenje']);
    }

    onSwitchDetails(e) {
        // console.log(e);
        this.details = e;
        // console.log(e.broj);
        this.mysqlservice.getZaduzenjeKlijenti(1000, 0, e.broj).subscribe((mydata: any) => {
            // console.log('------------');
            // console.log(mydata);
            this.details['klijent'] = mydata.klijenti;
            this.details['inkasant'] = mydata.inkasanti;
            this.zaduzenjeService.changeMessage(this.details);
            this.router.navigate(['/zaduzenje']);
        });
    }

    ngOnDestroy() {
        this.authListenerSubs.unsubscribe();
        this.zaduzenjeServiceSubs.unsubscribe();
    }
}
