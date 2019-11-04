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

  details = false;
  izvjestaji = [];
  totalRows = 0;
  pageSize = 20;
  pageIndex = 0;
  filter = '';
  selectedRowIndex = -1;

  klijent_details = [];
  klijent_sifra = '';
  klijent_naziv = '';
  klijent_StanjeDuga = '0.00';
  klijent_kolicina = 0;
  klijent_sif_usl = '';
  klijent_adresa = '';
  klijent_vrsta = '';
  klijent_ulica_id = '';
  klijent_naziv_ulice = '';
  klijent_broj_od = '';
  klijent_broj_do = '';
  klijent_status = '';
  klijent_tk = [];

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

  onClientDetails(kl_sifra, ul_sifra) {
    // this.mysqlservice.getKarticaKorisnika(kl_sifra).subscribe(xml => {
    //   console.log(xml);
    // });
    this.details = true;
    this.isLoading = true;
    this.klijent_details = [];
    if (kl_sifra !== '') {
      this.klijent_details = this.izvjestaji.filter(kl => {
        return kl.klijent_id === kl_sifra;
      });
    }
    if (ul_sifra !== '') {
      this.klijent_details = this.izvjestaji.filter(kl => {
        return kl.ulica_id === ul_sifra;
      });
    }
    console.log('Klijent details filtered', this.klijent_details);
    // call pagesize -1 for all rows!
    if (kl_sifra !== '') {
      this.klijent_sifra = kl_sifra;
      this.klijent_naziv = this.klijent_details[0].klijent_naziv;
      this.klijent_vrsta = this.klijent_details[0].klijent_vrsta;
      this.klijent_adresa = this.klijent_details[0].klijent_adresa;

      this.mysqlservice.getCustomerDetailsKorisnikUsl(-1, 0, kl_sifra).subscribe(resp => {
        const det = resp.data.data;
        const tk = resp.data.tk;
        // console.log('---Klijent details:', det);

        for (let i = 0; i < det.length; i++) {
          this.klijent_kolicina = det[i].kolicina;
          this.klijent_sif_usl = det[i].sif_usl;
          this.klijent_status = det[i].status;
          if (det[i].napomena != null && det[i].napomena !== '') {
            this.klijent_details.push({ napomena: det[i].napomena });
          }
        }
        let duguje = 0;
        let potrazuje = 0;

        this.klijent_tk = tk.filter(klijent => {
          return (klijent.sif_kto.trim() === '2010200' || klijent.sif_kto.trim() === '2091200');
        });
        // console.log('tk');
        // console.log(this.klijent_tk);
        for (let i = 0; i < this.klijent_tk.length; i++) {
          duguje += Number(this.klijent_tk[i]['izn_dug']);
          potrazuje += Number(this.klijent_tk[i]['izn_pot']);
        }
        // console.log(duguje, ' - ', potrazuje);
        this.klijent_StanjeDuga = (duguje - potrazuje).toFixed(2);
        this.isLoading = false;
      });
    } else {
      this.klijent_ulica_id = this.klijent_details[0].ulica_id;
      this.klijent_naziv_ulice = this.klijent_details[0].naziv_ulice;
      this.klijent_broj_od = this.klijent_details[0].broj_od;
      this.klijent_broj_do = this.klijent_details[0].broj_do;

      console.log('Ide ulicaaaaa: iiiiii', this.klijent_naziv_ulice);
      this.isLoading = false;
    }
  }

  onCloseInfo() {
    this.details = false;
    this.klijent_sifra = '';
    this.klijent_ulica_id = '';
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
