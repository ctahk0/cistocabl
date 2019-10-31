import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InkasantiService {

  private detailsSource = new BehaviorSubject({});
  currentDetails = this.detailsSource.asObservable();

  private refresh = new Subject<object>();
  currentData = this.refresh.asObservable();

  constructor() { }

  changeMessage(details: object) {
    this.detailsSource.next(details);
  }
  refreshData(klijent_id: string, ulica_id: string, nalog: string, izvDatum: Date, izvIzvjestaj: string, izvNapomena: string) {
    this.refresh.next({
      klijent_id: klijent_id,
      ulica_id: ulica_id,
      nalog: nalog,
      izvDatum: izvDatum,
      izvIzvjestaj: izvIzvjestaj,
      izvNapomena: izvNapomena
    });
  }
}
