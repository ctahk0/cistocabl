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

  /** ==================== KLIJENT LIST ================================================= */
  getCustomer(pageSize: number, pageIndex: number, filter: string, streets: string): Observable<any> {
    // console.log('Get customer');
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}&streets=${streets}`;
    return this._http.get(this._url + 'user/customer' + queryParams, httpOptions);
  }

  /** ==================== KLIJENT LIST ================================================= */
  getZaduzenjeKlijenti(pageSize: number, pageIndex: number, filter: string, streets: string): Observable<any> {
    // console.log('Get customer');
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}&streets=${streets}`;
    return this._http.get(this._url + 'admin/zaduzenjeklijenti' + queryParams, httpOptions);
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

  /** ==================== INKASANTI LIST =============================================== */
  getInkasanti(pageSize: number, pageIndex: number, filter: string): Observable<any> {
    const queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}&filter=${filter}`;
    return this._http.get(this._url + 'admin/inkasanti' + queryParams, httpOptions);
  }

  /** ====================INSERT TO DB FUNCTION CALL ==================================== */
  insertToDb(formObj: object) {
    return this._http.post(this._url + 'admin/zaduzenja', formObj, httpOptions);
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

  /** DELETE member*/
  DeleteMember(id) {
    return this._http.delete(this._url + 'admin/members/' + id);
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
