import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { MainService } from 'src/app/services/main.service';
import { MessageService } from 'primeng/api';
import { ZaduzenjeService } from '../novo-zaduzenje/zaduzenje.service';

@Component({
  selector: 'app-inkasanti-obrada-izvjestaj',
  templateUrl: './inkasanti-obrada-izvjestaj.component.html',
  styleUrls: ['./inkasanti-obrada-izvjestaj.component.css'],
  providers: [MessageService]
})
export class InkasantiObradaIzvjestajComponent implements OnInit {

  @Input() klijent_data: object;
  @Output() izvjestajEvent = new EventEmitter<boolean>();

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
    private zaduzenjeService: ZaduzenjeService,
    private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    console.log(this.klijent_data);
  }

  onSave() {
    const today = new Date();
    const frm = {
      inkasant_id: this.klijent_data['inkasant_id'],
      zaduzenje_id: this.klijent_data['nalog'],
      klijent_id: this.klijent_data['klijent_id'],
      datum_izvjestaja: today,
      izvjestaj: this.izvjestajControl.value,
      napomena: this.zakljucakControl.value,
      status: 1
    };
    // 'inkasant_id,zaduzenje_id,datum_izvjestaja,izvjestaj,napomena,status'
    console.log(frm);

    this.mysqlservice.insertToDbUser(frm).subscribe(resp => {
      console.log(resp);
      if (resp['status'] === 201) {
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
