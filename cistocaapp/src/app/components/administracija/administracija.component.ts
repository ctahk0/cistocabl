import { Component, OnInit, ViewChild } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { MatTableDataSource, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-administracija',
  templateUrl: './administracija.component.html',
  styleUrls: ['./administracija.component.css'],
  providers: [MessageService]
})
export class AdministracijaComponent implements OnInit {

  displayedColumns: string[] = [
    'id',
    'username',
    'firstname',
    'lastname',
    'blocked',
    'isInkasant', 'isSuperAdmin',
    'Save button'];
  // addNew = false;
  // deleteMember = false;
  isLoading = false;

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  userslist = [];
  totalRows = 0;
  pageSize = 20;
  pageIndex = 0;
  filter = '';
  selectedRowIndex = -1;

  // username = '';
  // firstname = '';
  // lastname = '';

  showNew = false;

  constructor
    (private mysqlservice: MainService, private messageservice: MessageService) { }

  ngOnInit() {
    this.showUsers();
  }

  onNew() {
    this.showNew = true;
  }

  onSave(element) {
    console.log(element);
    this.mysqlservice.updateUser(element, 'admin/regusers')
      .subscribe((res: any) => {
        this.messageservice.add({
          severity: 'info',
          summary: 'Inkasanti',
          detail: 'Promjene su sačuvane!'
        });
      },
        (err => {
          this.messageservice.add({
            severity: 'error',
            summary: 'Greška!',
            detail: 'Greška prilikom snimanja!'
          });
          console.log(err);
        }));
  }

  showUsers() {
    this.isLoading = true;
    this.mysqlservice.getRegisteredUsers(this.pageSize, this.pageIndex, this.filter)
      .subscribe((mydata: any) => {
        console.log('From users Show:', mydata);
        // if (mydata.message === 'Authorization failed!') {
        //   this.router.navigate(['']);
        // }
        this.totalRows = mydata.totalRec;
        this.userslist = mydata.data;
        this.dataSource = new MatTableDataSource(this.userslist);
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        // this.dataSource.paginator = this.paginator;
      });
  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.showUsers();
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onChangedPage(pageData: PageEvent) {
    this.pageSize = pageData.pageSize;
    this.pageIndex = pageData.pageIndex;
    this.showUsers();
  }


}
