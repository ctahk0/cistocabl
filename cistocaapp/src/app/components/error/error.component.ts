import { Component, OnInit, OnDestroy } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';

import { ErrorService } from './error.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './error.component.html',
  selector: 'app-error',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {
  // data: { message: string };
  message: string;
  private errorSub: Subscription;
  // constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
  constructor(private errorService: ErrorService) { }

  ngOnInit() {
    this.message = this.errorService.getLastError();
    if (this.message['message'] === 'read ECONNRESET') {
      this.message = 'Connection problem, please try again!';
    }
    console.log('lst error', this.message);

    this.errorSub = this.errorService.getErrorListener().subscribe(message => {
      console.log('from error component', message);
      this.message = message;
    });
  }

  onHandleError() {
    this.errorService.handleError();
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }
}
