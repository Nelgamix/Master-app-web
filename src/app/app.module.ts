import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
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
import {ModalEtStatsComponent} from './modal/et-stats.component';

// Pipes
import {DateFilter} from './pipes/datefilter.pipe';
import {CoursFilter} from './pipes/coursfilter.pipe';
import {Duree} from './pipes/duree.pipe';
import {Keys} from './pipes/keys.pipe';
import {Objet} from './pipes/objet.pipe';
import {Capitalize} from './pipes/capitalize.pipe';

// Services
import {EmploiTempsService} from './services/emploi-temps.service';
import {DatesService} from './services/dates.service';

// Autres
import {EvenementComponent} from './evenements/evenement.component';
import {EtVisuelComponent} from './et/etvisuel.component';
import {EtTableComponent} from './et/ettable.component';
import {AppRoutingModule} from './app-routing.module';
import {ExclusionComponent} from './et/exclusion.component';

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
    ModalEtStatsComponent,
    DateFilter,
    CoursFilter,
    Duree,
    Keys,
    Objet,
    Capitalize,
    EvenementComponent,
    ExclusionComponent,
    EtVisuelComponent,
    EtTableComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    MarkdownToHtmlModule.forRoot(),
    HttpClientModule,
    MomentModule
  ],
  providers: [
    EmploiTempsService,
    DatesService,
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalAccueilInfoComponent,
    ModalEvenementsLoginComponent,
    ModalEvenementsEditComponent,
    ModalEtExclusionsComponent,
    ModalEtStatsComponent
  ]
})
export class AppModule {}
