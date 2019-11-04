import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-izvjestaji',
  templateUrl: './izvjestaji.component.html',
  styleUrls: ['./izvjestaji.component.css']
})
export class IzvjestajiComponent implements OnInit {

  isLoading = false;

  displayedColumns: string[] = [
    'inkasant',
    'nalBroj',
    'nalDatum',
    'nalTip_zaduzenja',
    'nalKontrola_opis',
    'izvDatum',
    'klijent_id',
    'klijent_naziv',
    'naziv_ulice',
    'Details button'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  izvjestaji = [];
  totalRows = 0;
  pageSize = 20;
  pageIndex = 0;
  filter = '';
  selectedRowIndex = -1;
  // expandedElement: PeriodicElement | null;

  constructor(private mysqlservice: MainService) { }

  ngOnInit() {
    this.showList();
  }

  showList() {
    this.isLoading = true;
    this.mysqlservice.getIzvjestaji(this.pageSize, this.pageIndex, this.filter)
      .subscribe((mydata: any) => {
        console.log(mydata);
        this.totalRows = mydata.totalRec;
        this.izvjestaji = mydata.data;
        this.dataSource = new MatTableDataSource(this.izvjestaji);
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        // this.dataSource.paginator = this.paginator;
      });
  }

  applyFilter(e) {
    console.log(e);
    // this.filter = filterValue.trim().toLowerCase();
    // this.showList();
    // this.pageIndex = 0;
    // this.paginator.firstPage();
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onChangedPage(pageData: PageEvent) {
    this.pageSize = pageData.pageSize;
    this.pageIndex = pageData.pageIndex;
    this.showList();
  }


}
