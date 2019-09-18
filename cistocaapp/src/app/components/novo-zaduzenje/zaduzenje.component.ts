import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MainService } from 'src/app/services/main.service';
import { MessageService } from 'primeng/api';
import { ZaduzenjeService } from './zaduzenje.service';

@Component({
    selector: 'app-Zaduzenje',
    templateUrl: './zaduzenje.component.html',
    styleUrls: ['./zaduzenje.component.css'],
    providers: [MessageService]
})

export class ZaduzenjeComponent implements OnInit {

    zaduzenjeForm: FormGroup;
    vrsta = ['Domaćinstva', 'Pravna lica'];
    tip = ['Dostava', 'Kontrola'];
    // klijenti = [{ sif_par: '', naz_par: '' }];
    klijenti = [];
    selected_klijenti = [];
    ulice = [];
    selected_ulice = [];
    kontrole = ['Sudske provjere', 'Kontrola po listingu', 'Kontrole po zahtjevu', 'Kontrole po spisku odjave/prijave', 'APIF'];
    inkasantiList = [];
    isLoading = false;
    customerFilter = '';
    streetFilter = '';
    selectedStreetFilter = '';
    inkasantiNalog = '';

    details: object;
    staticForm = false;

    constructor(private fb: FormBuilder,
        private mysqlservice: MainService,
        private messageService: MessageService,
        private zaduzenjeService: ZaduzenjeService
    ) { }

    ngOnInit() {

        this.zaduzenjeService.currentDetails.subscribe(details => this.details = details);
        console.log('this details:', this.details);
        console.log(Object.keys(this.details).length);
        // !Object.keys(myObject).length
        if (Object.keys(this.details).length !== 0) {
            this.staticForm = true;
            const klarr = this.details['klijent'];
            for (let i = 0; i < klarr.length; i++) {
                this.selected_klijenti.push({ sif_par: klarr[i]['klijent_id'], naz_par: klarr[i]['klijent_naziv'] });
            }
            console.log(this.selected_klijenti);
            const arr = this.details['inkasant'].map(inkasant => inkasant.inkasant_id);
            const fi = arr.join();
            console.log('Fi------:', fi);
            this.zaduzenjeForm = this.fb.group({
                broj: [{ value: this.details['broj'], disabled: true }],
                datum: [{ value: this.details['datum'], disabled: true }],
                opis: [{ value: this.details['opis'], disabled: true }],
                tip_zaduzenja: [{ value: this.details['tip_zaduzenja'], disabled: true }],
                kontrola_opis: [{ value: this.details['kontrola_opis'], disabled: true }],
                napomena: [{ value: this.details['napomena'], disabled: true }]
            });
            this.zaduzenjeService.changeMessage(null);
            // this.filter = '(Age In (' + this.filtAge + '))';
            this.getInkasanti('(id In (' + fi + '))');
        } else {
            this.staticForm = false;
            this.zaduzenjeForm = this.fb.group({
                klijent_filter: '',
                ulica_filter: '',
                broj: '',
                datum: '',
                opis: '',
                klijent: [{ sif_par: '', naz_par: '', vrsta_klijenta: '', uli_bro: '', sif_uli: '', bro_sif: '' }],
                ulice: [],
                inkasanti: ['', [Validators.required]],
                tip_zaduzenja: '',
                kontrola_opis: '',
                napomena: ''
            });
            this.getInkasanti('');
        }
    }

    get inkasanti() {
        return this.zaduzenjeForm.get('inkasanti');
    }

    getInkasanti(fi: string) {
        this.isLoading = true;
        const ps = 50;
        const pi = 0;
        this.mysqlservice.getInkasanti(ps, pi, fi).subscribe((mydata: any) => {
            this.inkasantiList = mydata.data;
            this.isLoading = false;
        });
    }

    getCustomer() {
        this.isLoading = true;
        const ps = 200;
        const pi = 0;
        console.log(this.selectedStreetFilter);
        this.mysqlservice.getCustomer(ps, pi, this.customerFilter, this.selectedStreetFilter, 1, 2)
            .subscribe((mydata: any) => {
                // console.log(mydata.data);
                mydata.data.map(klijent => {
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
                this.klijenti = mydata.data;
                for (let i = 0; i < this.klijenti.length; i++) {
                    for (let n = 0; n < this.selected_klijenti.length; n++) {
                        const sel = this.selected_klijenti[n].sif_par;
                        if (sel === this.klijenti[i].sif_par) {
                            this.klijenti[i].selected = 1;
                        }
                    }
                }
                // console.log(this.klijenti);
                this.isLoading = false;
                // this.dataSource.paginator = this.paginator;
            });
    }

    getStreet() {
        this.isLoading = true;
        const ps = 200;
        const pi = 0;
        this.mysqlservice.getStreet(ps, pi, this.streetFilter)
            .subscribe((streetdata: any) => {
                // console.log(streetdata.data);
                this.ulice = streetdata.data;
                // console.log
                for (let i = 0; i < this.ulice.length; i++) {
                    this.ulice[i].selected = 0;
                    this.ulice[i].broj_od = '';
                    this.ulice[i].broj_do = '';
                    for (let n = 0; n < this.selected_ulice.length; n++) {
                        const sel = this.selected_ulice[n].sif_uli;
                        // console.log('-----');
                        // console.log(this.selected_ulice[n].sif_uli, sel);
                        if (sel === this.ulice[i].sif_uli) {
                            this.ulice[i].selected = 1;
                            this.ulice[i].broj_od = this.selected_ulice[n].broj_od;
                            this.ulice[i].broj_do = this.selected_ulice[n].broj_do;
                        }
                    }
                }
                // console.log(this.ulice);
                this.isLoading = false;
            });
    }

    get tip_zaduzenja() {
        return this.zaduzenjeForm.get('tip_zaduzenja');
    }

    onRemoveKlijent(e) {
        this.selected_klijenti = this.selected_klijenti.filter(el => el.sif_par !== e);
        for (let i = 0; i < this.klijenti.length; i++) {
            if (e === this.klijenti[i].sif_par) {
                this.klijenti[i].selected = 0;
            }
        }
        this.zaduzenjeForm.controls['klijent'].patchValue(this.selected_klijenti);
        this.getCustomer();
    }

    onSelectClient(e) {
        if (e.option._selected) {
            this.selected_klijenti.push(e.option.value);
            // this.form.controls['dept'].patchValue(selected.id);
            this.zaduzenjeForm.controls['klijent'].patchValue(this.selected_klijenti);
            // this.zaduzenjeForm.setValue({klijent: this.selected_klijenti});
        } else {
            this.selected_klijenti = this.selected_klijenti.filter(el => el.sif_par !== e.option.value.sif_par);
        }
    }

    onRemoveUlica(e) {
        this.selected_ulice = this.selected_ulice.filter(el => el.sif_uli !== e);
        for (let i = 0; i < this.ulice.length; i++) {
            if (e === this.ulice[i].sif_uli) {
                this.ulice[i].selected = 0;
            }
        }
        // this.zaduzenjeForm.controls['klijent'].patchValue(this.selected_ulice);
        this.getStreet();
    }

    onSelectUlica(e, ulica) {
        console.log(this.selected_ulice);
        if (e.checked) {
            ulica.selected = 1;
            this.selected_ulice.push(ulica);
        } else {
            ulica.selected = 0;
            this.selected_ulice = this.selected_ulice.filter(el => el.sif_uli !== ulica.sif_uli);
        }

        const arrUlice = [];
        for (const i in this.selected_ulice) {
            if (this.selected_ulice.hasOwnProperty(i)) {
                arrUlice.push(this.selected_ulice[i].sif_uli);
            }
        }
        // tslint:disable-next-line: quotemark
        this.selectedStreetFilter = "'" + arrUlice.join("','") + "'";
        // console.log(this.selectedStreetFilter);
        this.getCustomer();
    }

    // onChange(e) {
    //     console.log('Change!', e);
    //     console.log(this.zaduzenjeForm.controls.tip_zaduzenja);
    // }

    onSaveNalog() {
        console.log('SUBMITTING FORM!');
        this.zaduzenjeForm.controls['ulice'].patchValue(this.selected_ulice);
        console.log(this.zaduzenjeForm.value);
        if (!this.zaduzenjeForm.invalid) {
            this.mysqlservice.insertToDb(this.zaduzenjeForm.value).subscribe(resp => {
                console.log(resp);
                if (resp['status'] === 201) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Kreiranje naloga',
                        detail: 'Nalog uspješno kreiran!'
                    });
                    this.customerFilter = '';
                    this.streetFilter = '';
                    this.klijenti = null;
                    this.ulice = null;
                    this.selected_klijenti = [];
                    this.selected_ulice = [];
                    this.zaduzenjeForm.reset();
                }
            });
        }
    }

    applyCustomerFilter(filterValue: string) {
        // console.log(this.selected);
        this.customerFilter = filterValue.trim().toLowerCase();
        this.getCustomer();
    }
    applyStreetFilter(filterValue: string) {
        // console.log(this.selected);
        this.streetFilter = filterValue.trim().toLowerCase();
        this.getStreet();
    }
}
