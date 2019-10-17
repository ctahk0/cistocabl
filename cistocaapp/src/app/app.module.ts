import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { DialogModule } from 'primeng/dialog';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ConfirmationDialogService } from './components/confirmation-dialog/confirmation-dialog.service';
import { AuthInterceptor } from './components/auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './components/error/error.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopnavComponent } from './components/topnav/topnav.component';
import { ZaduzenjeComponent } from './components/novo-zaduzenje/zaduzenje.component';
import { MatDatepickerModule, MatExpansionModule } from '@angular/material';
// import { TextMaskModule } from 'angular2-text-mask';
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from './moment-date-adapter';

import {
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_NATIVE_DATE_FORMATS
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    ErrorComponent,
    ConfirmationDialogComponent,
    DashboardComponent,
    SidebarComponent,
    TopnavComponent,
    ZaduzenjeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastModule,
    SidebarModule,
    DialogModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    MatOptionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatGridListModule,
    MatDialogModule,
    MatTooltipModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatDatepickerModule,
    MatExpansionModule,
    // TextMaskModule,
  ],
  providers: [ConfirmationDialogService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    { provide: MAT_DATE_LOCALE, useValue: 'sr-SR' },
    { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent, ConfirmationDialogComponent]
})
export class AppModule { }
