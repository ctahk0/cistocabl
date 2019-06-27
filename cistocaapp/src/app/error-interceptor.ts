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
        let errorMessage = 'An unknown error occurred!';
        if (error.error.message) {
          errorMessage = error.error.message;
          console.log('We have a error here', errorMessage);
          // this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
          this.errorService.throwError(errorMessage);
          return throwError(error);
        } else {
          return throwError(error);
        }
      })
    );
  }
}
