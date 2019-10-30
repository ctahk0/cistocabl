import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-pretraga-korisnika',
  templateUrl: './pretraga-korisnika.component.html',
  styleUrls: ['./pretraga-korisnika.component.css'],
  providers: [MessageService]
})
export class PretragaKorisnikaComponent implements OnInit {

  isLoading = false;

  customerFilter = '';
  streetFilter = '';
  klijenti = [];
  klijent_details = [];
  klijent_tk = [];

  klijent_StanjeDuga = '0.00';
  klijent_kolicina = 0;
  klijent_sif_usl = '';
  klijent_status = '';

  constructor(private mysqlservice: MainService) { }

  ngOnInit() {
  }

  getCustomer() {
    this.isLoading = true;
    const ps = 10;
    const pi = 0;

    this.mysqlservice.getCustomer(ps, pi, this.customerFilter, this.streetFilter, 1, 1)
      .subscribe((mydata: any) => {
        console.log(mydata.data);
        mydata.data.data.map(klijent => {
          if (klijent.sif_par.trim().startsWith('0')) {
            klijent.vrsta_klijenta = 'Preduzeća';
          } else if (klijent.sif_par.trim().startsWith('1')) {
            klijent.vrsta_klijenta = 'Domaćinstva';
          } else if (klijent.sif_par.trim().startsWith('3')) {
            klijent.vrsta_klijenta = 'Seoska domaćinstva';
          } else if (klijent.sif_par.trim().startsWith('4')) {
            klijent.vrsta_klijenta = 'Preduzetnici';
          }
        });
        this.klijenti = mydata.data.data;

        this.isLoading = false;
      });
  }

  onOpen(kl) {
    this.onClientDetails(kl);
  }
  onClientDetails(kl_sifra) {
    // this.mysqlservice.getKarticaKorisnika(kl_sifra).subscribe(xml => {
    //   console.log(xml);
    // });
    this.isLoading = true;
    this.klijent_details = [];
    // call pagesize -1 for all rows!
    this.mysqlservice.getCustomerDetailsKorisnikUsl(-1, 0, kl_sifra).subscribe(resp => {
      const det = resp.data.data;
      const tk = resp.data.tk;
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
  }

  applyCustomerFilter(filterValue: string) {
    // console.log(this.selected);
    this.customerFilter = filterValue.trim().toLowerCase();
    this.getCustomer();
  }
  applyStreetFilter(filterValue: string) {
    // console.log(this.selected);
    this.streetFilter = filterValue.trim().toLowerCase();
    this.getCustomer();
  }
}
