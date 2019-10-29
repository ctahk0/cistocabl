import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { InkasantiService } from '../inkasanti-obrada/inkasanti-obrada.service';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-inkasanti-dashboard',
  templateUrl: './inkasanti-dashboard.component.html',
  styleUrls: ['./inkasanti-dashboard.component.css']
})
export class InkasantiDashboardComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  isLoading = true;
  taskList = [];
  taskList_zavrseni = [];
  taskList_novi = [];
  obrada = false;
  selected = 0;
  selectedCurrent = 0;

  messageText: string;
  messages: Array<any>;
  socket: SocketIOClient.Socket;
  socketUrl = environment.socket;

  constructor(
    private mysqlservice: MainService,
    private inkasantiservice: InkasantiService) {
    this.socket = io.connect(this.socketUrl);
  }

  ngOnInit() {
    this.messages = new Array();

    this.socket.on('serverMessage', (data: any) => {
      console.log('!!!!!! Refresh request !!!!!', data.msg);
      if (data.msg === 'refresh') {
        this.taskList = [];
        this.taskList_zavrseni = [];
        this.taskList_novi = [];
        this.getData();
      }
      // this.socket.emit('serverMessage', {
      //   msg: 'Yes, its working for me!!'
      // });
    });
    this.getData();
    this.refreshFromService();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshFromService() {
    this.subscription = this.inkasantiservice.currentData.subscribe(refobj => {
      console.log('Refresh nakon obrade, sifra je: ', refobj);
      console.log(this.taskList_novi);
      for (let i = 0; i < this.taskList_novi.length; i++) {
        const el = this.taskList_novi[i];
        // console.log(el.broj);
        if (el.broj === refobj['nalog']) {
          // console.log('Nasao nalog, sad listaj klijente');
          for (let n = 0; n < this.taskList_novi[i].data.length; n++) {
            const kl = this.taskList_novi[i].data[n];
            // console.log(kl.klijent_id);
            if (kl.klijent_id === refobj['klijent_id']) {
              // console.log('Nasao sam ga!, treba update statusa');
              this.taskList_novi[i].data[n]['izvStatus'] = 1;
              this.taskList_novi[i].data[n]['izvDatum'] = refobj['izvDatum'];
              this.taskList_novi[i].data[n]['izvIzvjestaj'] = refobj['izvIzvjestaj'];
              this.taskList_novi[i].data[n]['izvNapomena'] = refobj['izvNapomena'];
            }
          }
        }
      }
    });
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
    // console.log('iz ovog izvuci podatke!', korisnik);
    korisnik.nalog = nl[0].broj;
    korisnik.inkasant = nl[0].inkasantid;
    // korisnik.izvIzvjestaj = korisnik[0].izvIzvjestaj;
    // korisnik.izvNapomena = korisnik[0].izvNapomena;
    // korisnik.izvStatus = korisnik[0].izvStatus;
    console.log('Ovo je selektovani korisnik', korisnik);
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
