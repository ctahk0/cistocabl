import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { InkasantiService } from '../inkasanti-obrada/inkasanti-obrada.service';

@Component({
  selector: 'app-inkasanti-dashboard',
  templateUrl: './inkasanti-dashboard.component.html',
  styleUrls: ['./inkasanti-dashboard.component.css']
})
export class InkasantiDashboardComponent implements OnInit {

  isLoading = true;
  taskList = [];
  taskList_zavrseni = [];
  taskList_novi = [];
  obrada = false;
  selected = 0;
  selectedCurrent = 0;
  constructor(
    private mysqlservice: MainService,
    private inkasantiservice: InkasantiService) { }

  ngOnInit() {
    this.inkasantiservice.currentState.subscribe(refresh => {
      console.log('dobili smo refresh!');
      if (refresh === 'refresh') {
        this.getData();
      }
    });
    this.getData();
  }

  getData() {
    this.isLoading = true;
    const fi = '';
    this.mysqlservice.getIncData(fi).subscribe((mydata: any) => {
      console.log('This is received data?', mydata.data);
      const data = mydata.data;

      let tmpArr = [];
      let br = '';
      let n = 0;
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const el = data[key];
          if (el.broj !== br) {
            br = el.broj;
            this.taskList.push({
              broj: el.broj,
              datum: el.datum,
              firstname: el.firstname,
              lastname: el.lastname,
              inkasantid: el.inkasant_id,
              tip_zaduzenja: el.tip_zaduzenja,
              kontrola_opis: el.kontrola_opis,
              opis: el.opis,
              napomena: el.napomena,
              status: el.status
            });
            tmpArr = [];
            for (let i = 0; i < data.length; i++) {
              // console.log('el broj', el.broj, data[i].broj);
              if (el.broj === data[i].broj) {
                tmpArr = [...tmpArr, {
                  klijent_adresa: data[i].klijent_adresa,
                  klijent_id: data[i].klijent_id,
                  klijent_naziv: data[i].klijent_naziv,
                  klijent_status: data[i].klijent_status,
                  klijent_vrsta: data[i].klijent_vrsta,
                  kontrola_opis: data[i].kontrola_opis,
                  izvDatum: data[i].izvDatum,
                  izvIzvjestaj: data[i].izvIzvjestaj,
                  izvKlijent: data[i].izvKlijent,
                  izvNapomena: data[i].izvNapomena,
                  izvStatus: data[i].izvStatus,
                  naziv_ulice: data[i].naziv_ulice,
                  sifra_ulice: data[i].sifra_ulice
                }];
              }
            }
            this.taskList[n].data = tmpArr;
            n++;
          }
        }
      }

      this.taskList_novi = this.taskList.filter(nalog => {
        return nalog.status === 0;
      });
      this.taskList_zavrseni = this.taskList.filter(nalog => {
        return nalog.status === 1;
      });
      this.isLoading = false;
      console.log('Task list novi:', this.taskList_novi);
    });

  }

  onObradaNovi(broj_naloga, klijent_id) {
    const nl = this.taskList_novi.filter(nla => {
      // console.log('ah:', nla.broj, broj_naloga);
      return nla.broj === broj_naloga;
    });
    // console.log('nl', nl);

    const korisnik = nl[0].data.filter(kl => {
      // console.log(kl, klijent_id);
      return kl.klijent_id === klijent_id;
    });
    console.log(nl);
    korisnik.nalog = nl[0].broj;
    korisnik.inkasant = nl[0].inkasantid;
    // console.log('Ovo je selektovani korisnik', korisnik);
    this.selectedCurrent = this.selected;
    this.inkasantiservice.changeMessage(korisnik);
    this.obrada = true;
  }
  onObradaZavrseni(broj_naloga, klijent_id) {
    const nl = this.taskList_zavrseni.filter(nla => {
      return nla.broj === broj_naloga;
    });
    const korisnik = nl[0].data.filter(kl => {
      return kl.klijent_id === klijent_id;
    });
    korisnik.nalog = nl[0].broj;
    korisnik.inkasant = nl[0].inkasantid;
    this.selectedCurrent = this.selected;
    this.inkasantiservice.changeMessage(korisnik);
    this.obrada = true;
  }

  onObradaSvi(broj_naloga, klijent_id) {
    const nl = this.taskList.filter(nla => {
      return nla.broj === broj_naloga;
    });
    const korisnik = nl[0].data.filter(kl => {
      return kl.klijent_id === klijent_id;
    });
    korisnik.nalog = nl[0].broj;
    korisnik.inkasant = nl[0].inkasantid;
    this.selectedCurrent = this.selected;
    this.inkasantiservice.changeMessage(korisnik);
    this.obrada = true;
  }

  receiveClose($event) {
    this.selected = this.selectedCurrent;
    this.obrada = $event;
  }
}
