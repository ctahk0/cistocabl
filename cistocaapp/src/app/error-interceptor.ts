import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorService } from './components/error/error.service';
// import { Router } from '@angular/router';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog, private errorService: ErrorService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('ERR INTERCEPTOR:', error);
        let errorMessage = 'Nepoznata greška!';

        if (error.error.message) {
          errorMessage = error.error.message;
          const controlError = error.error.error.message;
          console.log('We have a error here', errorMessage);
          if (controlError.indexOf('CONSTRAINT `izvjestaj_inkasanti') !== -1) {
            this.errorService.throwError('Postoji izvještaj inkasanta za ovaj nalog. Nije dozvoljeno brisanje!');
          } else {
            // this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
            this.errorService.throwError(errorMessage);
          }
          return throwError(error);
        } else {
          return throwError(error);
        }

      })
    );
  }
}
