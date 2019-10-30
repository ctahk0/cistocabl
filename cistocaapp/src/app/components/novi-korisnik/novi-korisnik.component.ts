import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MainService } from 'src/app/services/main.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-novi-korisnik',
  templateUrl: './novi-korisnik.component.html',
  styleUrls: ['./novi-korisnik.component.css'],
  providers: [MessageService]
})
export class NoviKorisnikComponent implements OnInit {

  isLoading = false;
  vrsta = '';
  ime = '';
  prezime = '';
  adresa = '';
  kolicina: number;
  napomena = '';

  vrste_korisnika = [
    'Preduzeća'
    , 'Domaćinstva'
    , 'Seoska domaćinstva'
    , 'Preduzetnici'
  ];

  constructor(private mysqlservice: MainService, private messageService: MessageService) { }

  ngOnInit() {
  }

  onSave(userForm: NgForm) {
    const frm = {
      vrsta: this.vrsta,
      ime: this.ime,
      prezime: this.prezime,
      adresa: this.adresa,
      kolicina: this.kolicina,
      napomena: this.napomena
    };

    this.isLoading = true;
    this.mysqlservice.insertToDbUser(frm).subscribe(resp => {
      if (resp['status'] === 201) {
        this.messageService.add({
          severity: 'info',
          summary: 'Novi korisnik',
          detail: 'Novi korisnik je uspješno dodan u bazu!'
        });
        userForm.reset();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška!',
          detail: 'Greška prilikom unosa novog korisnika!'
        });
      }
      this.isLoading = false;
    });

  }
}
