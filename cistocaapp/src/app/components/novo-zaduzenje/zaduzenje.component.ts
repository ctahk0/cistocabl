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

    maxBroj = 0;
    maxBrojStr = 'NA-0000/00';

    details: object;
    staticForm = false;
    display_details = false;

    klijent_details = [];
    klijent_sifra = '';
    klijent_naziv = '';
    klijent_StanjeDuga = '0.00';
    klijent_kolicina = 0;
    klijent_sif_usl = '';
    klijent_adresa = '';
    klijent_vrsta = '';
    klijent_Status = '';
    klijent_tk = [];

    // public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    // [/[A-Z]/i, /\d/, /[A-Z]/i, ' ', /\d/, /[A-Z]/i, /\d/]
    // yy = new Date().getFullYear().toString().substr(-2);
    // public mask = ['N', 'A', '-', /\d/, /\d/, /\d/, /\d/, '/', this.yy];

    today = new Date();
    yy = this.today.getFullYear().toString().substr(-2);
    // mtoday = momen
    // mm = this.today.getMonth() + 1;  // 10
    // dd = this.today.getDate();     // 30
    // yyyy = this.today.getFullYear(); // 2010

    constructor(private fb: FormBuilder,
        private mysqlservice: MainService,
        private messageService: MessageService,
        private zaduzenjeService: ZaduzenjeService
    ) { }

    ngOnInit() {

        this.zaduzenjeService.currentDetails.subscribe(details => this.details = details);
        console.log('this details:', this.details);
        if (this.details !== null && Object.keys(this.details).length !== 0) {
            this.staticForm = true;
            const klarr = this.details['klijent'];
            for (let i = 0; i < klarr.length; i++) {
                this.selected_klijenti.push({
                    sif_par: klarr[i]['klijent_id'],
                    naz_par: klarr[i]['klijent_naziv'],
                    uli_bro: klarr[i]['klijent_adresa'],
                    vrsta_klijenta: klarr[i]['klijent_vrsta']
                });
            }
            console.log(this.selected_klijenti);
            const arr = this.details['inkasant'].map(inkasant => inkasant.inkasant_id);
            const fi = arr.join();
            console.log('Fi------:', fi);
            // this.zaduzenjeForm = this.fb.group({
            //     broj: [{ value: this.details['broj'], disabled: true }],
            //     datum: [{ value: this.details['datum'], disabled: true }],
            //     opis: [{ value: this.details['opis'], disabled: true }],
            //     tip_zaduzenja: [{ value: this.details['tip_zaduzenja'], disabled: true }],
            //     kontrola_opis: [{ value: this.details['kontrola_opis'], disabled: true }],
            //     napomena: [{ value: this.details['napomena'], disabled: true }]
            // });
            this.zaduzenjeForm = this.fb.group({
                broj: this.details['broj'],
                datum: this.details['datum'],
                opis: this.details['opis'],
                tip_zaduzenja: this.details['tip_zaduzenja'],
                kontrola_opis: this.details['kontrola_opis'],
                napomena: this.details['napomena']
            });

            // this.zaduzenjeForm.disable();
            this.zaduzenjeService.changeMessage(null);
            // this.filter = '(Age In (' + this.filtAge + '))';
            this.getInkasanti('(id In (' + fi + '))');
        } else {
            this.staticForm = false;
            this.zaduzenjeForm = this.fb.group({
                klijent_filter: '',
                ulica_filter: '',
                broj: this.maxBrojStr,
                datum: [this.today, Validators.compose([
                    Validators.required,
                    // this.validateDate
                ])],
                opis: '',
                klijent: [{ sif_par: '', naz_par: '', vrsta_klijenta: '', uli_bro: '', sif_uli: '', bro_sif: '' }],
                ulice: [],
                inkasanti: ['', [Validators.required]],
                tip_zaduzenja: '',
                kontrola_opis: '',
                napomena: ''
            });
            this.getMaxBrojZaduzenja('');
            this.getInkasanti('');
        }
    }

    get inkasanti() {
        return this.zaduzenjeForm.get('inkasanti');
    }

    // ** Za  dodavanje nula ispred */
    zfill(num, len) { return (Array(len).join('0') + num).slice(-len); }


    validateDate(controls) {
        // tslint:disable-next-line: max-line-length
        const regExp = new RegExp(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/);
        //  if (regExp.test(controls.value)) {
        //    return null;
        //  } else {
        //    return { 'validateDate': true }
        //  }
        return regExp.test(controls.value) ? null : { 'validateDate': true };
    }
    // Prevent no number type input, valid characters in input are numbers only
    _keyPress(event: any) {
        const pattern = /^[0-9]*$/;
        const inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar)) {
            // invalid character, prevent input
            event.preventDefault();
        }
    }


    getMaxBrojZaduzenja(fi: string) {
        this.isLoading = true;
        const ps = 1;
        const pi = 0;
        this.mysqlservice.getMaxBrojZaduzenja(ps, pi, fi).subscribe((mydata: any) => {
            // console.log(mydata.data);
            // Provjera  da li je prazno
            if (mydata.data[0]['MAX(SUBSTR(broj, 4, 4))'] === null) {
                this.maxBroj = 0;
            } else {
                this.maxBroj = mydata.data;
            }
            this.maxBroj++;
            this.maxBrojStr = `NA-${this.zfill(this.maxBroj, 4)}/${this.yy}`;
            this.isLoading = false;
            this.zaduzenjeForm.controls['broj'].setValue(this.maxBrojStr);
            // this.zaduzenjeForm.controls['broj'].patchValue(this.maxBrojStr);
        });
    }

    getInkasanti(fi: string) {
        this.isLoading = true;
        const ps = 50;
        const pi = 0;
        this.mysqlservice.getInkasanti(ps, pi, fi).subscribe((mydata: any) => {
            console.log(mydata);
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
                this.ulice = streetdata.data.data;
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
    onNewNalog() {
        this.zaduzenjeForm.reset();
        // this.zaduzenjeForm.enable();
        // this.zaduzenjeService.changeMessage(null);
        this.customerFilter = '';
        this.streetFilter = '';
        this.klijenti = null;
        this.ulice = null;
        this.selected_klijenti = [];
        this.selected_ulice = [];

        this.zaduzenjeForm = this.fb.group({
            klijent_filter: '',
            ulica_filter: '',
            broj: this.maxBrojStr,
            datum: this.today,
            opis: '',
            klijent: [{ sif_par: '', naz_par: '', vrsta_klijenta: '', uli_bro: '', sif_uli: '', bro_sif: '' }],
            ulice: [],
            inkasanti: ['', [Validators.required]],
            tip_zaduzenja: '',
            kontrola_opis: '',
            napomena: ''
        });
        this.staticForm = false;
        this.getMaxBrojZaduzenja('');
    }

    onSaveNalog() {
        console.log('SUBMITTING FORM!');
        this.zaduzenjeForm.controls['ulice'].patchValue(this.selected_ulice);
        // this.zaduzenjeForm.controls['datum'].setValue(tmp);
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
        } else {
            console.log('Invalid form!');
        }
    }

    onClientDetails(kl_sifra, kl_naziv) {

        // sif_par
        // dat_poc_vaz
        // sif_vrs_ce
        // sif_usl
        // kolicina
        // status
        // datum_promene
        // sif_par
        // napomena
        this.klijent_details = [];

        this.klijent_details = this.selected_klijenti.filter(function (klijent) {
            return klijent.sif_par === kl_sifra;
        });
        this.klijent_adresa = this.klijent_details[0]['uli_bro'];
        this.klijent_vrsta = this.klijent_details[0]['vrsta_klijenta'];

        this.display_details = true;
        this.klijent_details = [];
        // call pagesize -1 for all rows!
        this.mysqlservice.getCustomerDetailsKorisnikUsl(-1, 0, kl_sifra).subscribe(resp => {
            console.log('------------ovaj response', resp.data);
            const det = resp.data.data;
            const tk = resp.data.tk;
            this.klijent_sifra = kl_sifra;
            this.klijent_naziv = kl_naziv;
            for (let i = 0; i < det.length; i++) {
                this.klijent_kolicina = det[i].kolicina;
                this.klijent_sif_usl = det[i].sif_usl;
                this.klijent_Status = det[i].status;
                if (det[i].napomena != null && det[i].napomena !== '') {
                    this.klijent_details.push({ napomena: det[i].napomena });
                }
            }
            let duguje = 0;
            let potrazuje = 0;

            this.klijent_tk = tk.filter(function (klijent) {
                return klijent.sif_kto.trim() === '2010200';
            });
            // console.log('klijent tk:', this.klijent_tk);
            // console.log(this.klijent_tk.length);
            for (let i = 0; i < this.klijent_tk.length; i++) {
                duguje += Number(this.klijent_tk[i]['izn_dug']);
                potrazuje += Number(this.klijent_tk[i]['izn_pot']);
            }
            this.klijent_StanjeDuga = (duguje - potrazuje).toFixed(2);
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
        this.getStreet();
    }
}
