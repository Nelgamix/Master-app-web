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

import {AppComponent} from './app.component';
import {AccueilComponent} from './accueil/accueil.component';
import {EtComponent} from './et/et.component';
import {EvenementsComponent} from './evenements/evenements.component';
import {ContactComponent} from './contact/contact.component';
import {PageNotFoundComponent} from './pagenotfound/pagenotfound.component';

// Modal
import {NgbdModalAccueilInfo} from './modal/accueil.info.component';
import {NgbdModalEvenementsLogin} from './modal/evenements.login.component';
import {NgbdModalEvenementsEdit} from './modal/evenements.edit.component';

// Pipes
import {DateFilter} from './pipes/datefilter.pipe';
import {KeysPipe} from './pipes/keys.pipe';
import {ObjetPipe} from './pipes/objet.pipe';
import {Capitalize} from './pipes/capitalize.pipe';

// Services
import {EmploiTempsService} from './services/emploi-temps.service';

// Autres
import {EvenementComponent} from './directives/evenement.component';
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
    NgbdModalAccueilInfo,
    NgbdModalEvenementsLogin,
    NgbdModalEvenementsEdit,
    DateFilter,
    KeysPipe,
    ObjetPipe,
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
    EmploiTempsService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    NgbdModalAccueilInfo,
    NgbdModalEvenementsLogin,
    NgbdModalEvenementsEdit
  ]
})
export class AppModule {
}
