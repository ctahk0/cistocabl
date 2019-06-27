import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-Zaduzenje',
    templateUrl: './zaduzenje.component.html',
    styleUrls: ['./zaduzenje.component.css']
})

export class ZaduzenjeComponent implements OnInit {

    zaduzenjeForm: FormGroup;
    vrsta = ['Domaćinstva', 'Pravna lica'];
    tip = ['Dostava', 'Kontrola'];
    kontrole = ['Sudske provjere', 'Kontrola po listingu', 'Kontrole po zahtjevu', 'Kontrole po spisku odjave/prijave', 'APIF'];

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.zaduzenjeForm = this.fb.group({
            broj: '',
            datum: '',
            opis: '',
            vrsta_klijenta: '',
            tip_zaduzenja: '',
            kontrola_opis: '',
            napomena: ''
        });
    }

    get tip_zaduzenja() {
        return this.zaduzenjeForm.get('tip_zaduzenja');
    }

    onChange(e) {
        console.log('Change!', e);
        console.log(this.zaduzenjeForm.controls.tip_zaduzenja);
    }

    onSubmit() {
        console.log(this.zaduzenjeForm.value);
    }

}
