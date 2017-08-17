import {RouterModule, Routes} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule, LOCALE_ID} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {MomentModule} from 'angular2-moment';
import {FormsModule} from '@angular/forms';
import {MarkdownToHtmlModule} from 'ng2-markdown-to-html';
import {CommonModule} from '@angular/common';
import {CookieService} from 'ngx-cookie-service';

// Components
import {AppComponent} from './app.component';
import {AccueilComponent} from './accueil/accueil.component';
import {EtComponent} from './et/et.component';
import {EvenementsComponent} from './evenements/evenements.component';
import {ContactComponent} from './contact/contact.component';
import {PageNotFoundComponent} from './pagenotfound/pagenotfound.component';

// Modal
import {ModalAccueilInfoComponent} from './modal/accueil-info.component';
import {ModalEvenementsLoginComponent} from './modal/evenements-login.component';
import {ModalEvenementsEditComponent} from './modal/evenements-edit.component';
import {ModalEtExclusionsComponent} from './modal/et-exclusions.component';

// Pipes
import {DateFilter} from './pipes/datefilter.pipe';
import {Duree} from './pipes/duree.pipe';
import {Keys} from './pipes/keys.pipe';
import {Objet} from './pipes/objet.pipe';
import {Capitalize} from './pipes/capitalize.pipe';

// Services
import {EmploiTempsService} from './services/emploi-temps.service';

// Autres
import {EvenementComponent} from './evenements/evenement.component';
import {EtVisuelComponent} from './et/etvisuel.component';
import {EtTableComponent} from './et/ettable.component';

const appRoutes: Routes = [
  {path: 'accueil', component: AccueilComponent},
  {path: 'et', component: EtComponent},
  {path: 'evenements', component: EvenementsComponent},
  {path: 'contact', component: ContactComponent},
  {path: '', redirectTo: '/accueil', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    EtComponent,
    EvenementsComponent,
    ContactComponent,
    PageNotFoundComponent,
    ModalAccueilInfoComponent,
    ModalEvenementsLoginComponent,
    ModalEvenementsEditComponent,
    ModalEtExclusionsComponent,
    DateFilter,
    Duree,
    Keys,
    Objet,
    Capitalize,
    EvenementComponent,
    EtVisuelComponent,
    EtTableComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes/*, {useHash: true}*/),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    MarkdownToHtmlModule.forRoot(),
    HttpClientModule,
    MomentModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    EmploiTempsService,
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalAccueilInfoComponent,
    ModalEvenementsLoginComponent,
    ModalEvenementsEditComponent,
    ModalEtExclusionsComponent
  ]
})
export class AppModule {
}
