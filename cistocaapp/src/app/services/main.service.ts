import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class MainService {

  // _url = 'http://localhost:8000/api/';
  _url = environment.apiBase;


  constructor(private _http: HttpClient) { }
  getKarticaKorisnika(korisnik_id: string) {
    const url = `http://10.10.20.11:8080/StanjeKupca/services/Service.ServiceHttpSoap11Endpoint/getKartica1?sifPar=${korisnik_id}`;
    return this._http.get(url);
  }
  /** ==================== KLIJENT LIST ================================================= */
  // tslint:disable-next-line: max-line-length
  getCustomer(pageSize: number, pageIndex: number, filter: string, streets: string, streetsid: string, brod: number, brdo: number): Observable<any> {
    // console.log('Get customer');
    // tslint:disable-next-line: max-line-length
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}&streets=${streets}&streetsid=${streetsid}&brod=${brod}&brdo=${brdo}`;
    return this._http.get(this._url + 'user/customer' + queryParams, httpOptions);
  }

  /** ==================== KLIJENT DETAILS - korisnik_usl ================================ */
  getCustomerDetailsKorisnikUsl(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    // console.log('Get customer');
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'user/customer-details-usl' + queryParams, httpOptions);
  }

  /** ==================== KLIJENT LIST ================================================= */
  getZaduzenjeKlijenti(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    // console.log('Get customer');
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'admin/zaduzenjeklijenti' + queryParams, httpOptions);
  }

  /** ==================== PODACI ZA INKASANTA - LIST NALOGA I ZADUZENJA ================= */
  getIncData(filter: string): Observable<any> {
    // console.log('Get customer');
    const queryParams = `?filter=${filter}`;
    return this._http.get(this._url + 'user/incview' + queryParams, httpOptions);
  }

  getStreet(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    // console.log('Get street');
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'user/street' + queryParams, httpOptions);
  }

  /** ==================== ZADUZENJA LIST =============================================== */
  getZaduzenja(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'admin/zaduzenja' + queryParams, httpOptions);
  }

  /** ==================== MAX BROJ ZADUZENJA =========================================== */
  getMaxBrojZaduzenja(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'admin/zaduzenjebroj' + queryParams, httpOptions);
  }

  /** ==================== INKASANTI LIST =============================================== */
  getInkasanti(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'admin/inkasanti' + queryParams, httpOptions);
  }

  /** ====================INSERT TO DB FUNCTION CALL ==================================== */
  insertToDb(formObj: object) {
    return this._http.post(this._url + 'admin/zaduzenja', formObj, httpOptions);
  }

  insertToDbUser(formObj: object) {
    return this._http.post(this._url + 'user/writenewuser', formObj, httpOptions);
  }

  // Edit/Save SMS Account
  saveSmsAccountDetails(username: string, password: string) {
    return this._http.post(
      // this._url + 'admin/members',
      this._url + 'user/smsaccount', { 'username': username, 'pwd': password }, httpOptions);
  }


  /** INSERT / EDIT Member/User */
  sendForm(frm, route: string) {
    return this._http.post(
      // this._url + 'admin/members',
      this._url + route,
      frm,
      httpOptions
    );
  }

  /** DELETE Nalog*/
  DeleteNalog(id: string) {
    return this._http.delete(this._url + 'admin/zaduzenje/', { params: { id: id } });
  }


  /** UPDATE User */
  updateUser(frm, route: string) {
    return this._http.patch(
      // this._url + 'admin/members',
      this._url + route,
      frm,
      httpOptions
    );
  }

}
