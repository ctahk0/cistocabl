import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { MainService } from 'src/app/services/main.service';
import { MessageService } from 'primeng/api';
import { InkasantiService } from '../inkasanti-obrada/inkasanti-obrada.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inkasanti-obrada-izvjestaj',
  templateUrl: './inkasanti-obrada-izvjestaj.component.html',
  styleUrls: ['./inkasanti-obrada-izvjestaj.component.css'],
  providers: [MessageService]
})
export class InkasantiObradaIzvjestajComponent implements OnInit, OnDestroy {

  // @Input() klijent_data: object;
  @Output() izvjestajEvent = new EventEmitter<boolean>();
  private subscription: Subscription;

  klijent_data: object;
  izvjestajControl = new FormControl('', [Validators.required]);
  zakljucakControl = new FormControl('');
  sudske_provjere = [
    '1. nalazi se na adresi'
    , '2. Nepoznat'
    , '3. Preminuo'
    , '4. Teškog materijalno stanja/socijalni slučajevi'
    , '5. Odselio'
    , '7. Ostavinska rasprava'
    , '8. Sporno/nezavršeno'
    , '9. Ostalo'
  ];

  constructor(private mysqlservice: MainService,
    private messageService: MessageService,
    private inkasantiservice: InkasantiService,
    private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    // console.log(this.klijent_data);
    this.getCurrentDetails();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentDetails() {
    this.subscription = this.inkasantiservice.currentDetails.subscribe(details => {
      // this.details = details[0];
      // this.nalog = details['nalog'];
      // this.inkasant = details['inkasant'];
      this.klijent_data = details;
      this.izvjestajControl.setValue(this.klijent_data[0]['izvIzvjestaj']);
      this.zakljucakControl.setValue(this.klijent_data[0]['izvNapomena']);
      console.log('Details received from service:', details);
    });
  }

  onSave() {
    const today = new Date();
    const frm = {
      inkasant_id: this.klijent_data['inkasant'],
      zaduzenje_id: this.klijent_data['nalog'],
      klijent_id: this.klijent_data[0]['klijent_id'],
      ulica_id: this.klijent_data[0]['sifra_ulice'],
      datum_izvjestaja: today,
      izvjestaj: this.izvjestajControl.value,
      napomena: this.zakljucakControl.value,
      status: 1
    };
    // 'inkasant_id,zaduzenje_id,datum_izvjestaja,izvjestaj,napomena,status'
    console.log('frm to save:', frm);

    this.mysqlservice.insertToDbUser(frm).subscribe(resp => {
      console.log(resp);
      if (resp['status'] === 201) {
        this.inkasantiservice.refreshData(this.klijent_data[0]['klijent_id'], this.klijent_data[0]['sifra_ulice'],
          this.klijent_data['nalog'], today, this.izvjestajControl.value, this.zakljucakControl.value);
        this.izvjestajEvent.emit(false);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Izvještaj',
          detail: 'Greška prilikom unosa izvještaja!'
        });
      }
    });
  }

}
