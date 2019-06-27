import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ErrorService {

  lastError: string;
  private errorListener = new Subject<string>();

  constructor (private authService: AuthService) {}
  getErrorListener() {
    return this.errorListener.asObservable();
  }

  throwError(message: string) {
    this.lastError = message;
    this.errorListener.next(message);
  }

  getLastError() {
    return this.lastError;
  }
  // Invalid or expired token!
  handleError() {
    if (this.lastError === 'Authorization failed!' || this.lastError === 'Invalid or expired token!') {
      this.authService.logout();
    }
    this.errorListener.next(null);
    this.lastError = null;
  }
}
