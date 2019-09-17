import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZaduzenjeService {

  private detailsSource = new BehaviorSubject({});
  currentDetails = this.detailsSource.asObservable();

  constructor() { }

  changeMessage(details: object) {
    this.detailsSource.next(details);
  }

}
