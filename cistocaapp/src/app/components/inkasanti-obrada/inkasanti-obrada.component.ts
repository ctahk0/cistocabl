import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { InkasantiService } from './inkasanti-obrada.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inkasanti-obrada',
  templateUrl: './inkasanti-obrada.component.html',
  styleUrls: ['./inkasanti-obrada.component.css'],
  providers: [MessageService]
})
export class InkasantiObradaComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  isLoading = false;
  details: object;
  nalog: string;
  inkasant: number;

  klijent_details = [];
  klijent_sifra = '';
  klijent_naziv = '';
  klijent_StanjeDuga = '0.00';
  klijent_kolicina = 0;
  klijent_sif_usl = '';
  klijent_adresa = '';
  klijent_vrsta = '';
  klijent_status = '';
  klijent_tk = [];
  izvStatus = 0;

  izvjestaj = false;

  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(private mysqlservice: MainService, private inkasantiservice: InkasantiService, private messageService: MessageService) { }

  ngOnInit() {
    this.getCurrentDetails();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentDetails() {
    this.subscription = this.inkasantiservice.currentDetails.subscribe(details => {
      this.details = details[0];
      this.nalog = details['nalog'];
      this.inkasant = details['inkasant'];
      console.log('Details received:', details);
      // console.log('Details nalog received:', this.nalog);
      this.onClientDetails(this.details['klijent_id']);
    });
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
      this.klijent_sifra = kl_sifra;
      this.klijent_naziv = this.details['klijent_naziv'];
      this.klijent_vrsta = this.details['klijent_vrsta'];
      this.klijent_adresa = this.details['klijent_adresa'];

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

  onIzvjestaj() {
    this.izvjestaj = true;
  }
  onCloseInfo() {
    this.closeEvent.emit(false);
  }
  receiveIzvjestaj($event) {
    console.log('Izvjestaj zavrsen!', this.klijent_sifra);
    this.izvjestaj = $event;
    this.messageService.add({
      severity: 'info',
      summary: 'Izvještaj',
      detail: 'Izvještaj je uspješno sačuvan!'
    });
  }
}
