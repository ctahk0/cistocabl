import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './components/auth/auth.service';
import { Subscription } from 'rxjs';
import { ErrorService } from './components/error/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  hasError = false;
  private errorSub: Subscription;
  constructor(private authService: AuthService, private errorService: ErrorService) { }

  ngOnInit() {
    this.authService.autoAuth();
    this.errorSub = this.errorService.getErrorListener().subscribe(
      message => this.hasError = message !== null
    );
  }
  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }
}
