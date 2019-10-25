import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InkasantiService {

  private detailsSource = new BehaviorSubject({});
  currentDetails = this.detailsSource.asObservable();

  private refresh = new Subject<string>();
  currentState = this.refresh.asObservable();

  constructor() { }

  changeMessage(details: object) {
    this.detailsSource.next(details);
  }
  refreshData(fnc: string) {
    this.refresh.next(fnc);
  }
}
