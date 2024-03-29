import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {NgbDateAdapter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {MomentModule} from 'angular2-moment';
import {FormsModule} from '@angular/forms';
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
import {EtVisuelComponent} from './et/et-visuel.component';
import {CoursDirective, EtTableComponent} from './et/et-table.component';
import {AppRoutingModule} from './app-routing.module';
import {ExclusionComponent} from './et/exclusion.component';
import {CoursPersoComponent, ModalEtGestionCoursComponent} from './modal/et-gestion-cours.component';
import {GestionCoursComponent} from './et/gestion-cours.component';
import {ModalEtNotesComponent} from './modal/et-notes.component';
import {NotesService} from './services/notes.service';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ContextMenuModule} from 'ngx-contextmenu';
import {EtInfoComponent} from './et/et-info.component';
import {EtDetailsComponent} from './et/et-details.component';
import {EtSettingsComponent} from './et/et-settings.component';
import {MessageService} from './services/message.service';
import {MessageComponent} from './message/message.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {EnumKeysPipe} from './pipes/enumKeys.pipe';
import {ModalEtCoursDetailsComponent} from './modal/et-cours-details.component';
import {MarkdownModule} from 'ngx-markdown';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {AccueilJsonComponent} from './accueil/accueil-json.component';
import {LZStringModule, LZStringService} from 'ng-lz-string';
import {MomentDateAdapter} from './moment-date-adapter';

@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    AccueilComponent,
    AccueilJsonComponent,
    EtComponent,
    EtDetailsComponent,
    EtInfoComponent,
    EtSettingsComponent,
    EvenementsComponent,
    ContactComponent,
    PageNotFoundComponent,
    ModalAccueilInfoComponent,
    ModalEvenementsLoginComponent,
    ModalEvenementsEditComponent,
    ModalEtExclusionsComponent,
    ModalEtGestionCoursComponent,
    ModalEtNotesComponent,
    ModalEtStatsComponent,
    ModalEtCoursDetailsComponent,
    DateFilter,
    CoursFilter,
    Duree,
    Keys,
    EnumKeysPipe,
    Objet,
    Capitalize,
    EvenementComponent,
    ExclusionComponent,
    CoursPersoComponent,
    GestionCoursComponent,
    EtVisuelComponent,
    EtTableComponent,
    CoursDirective
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ColorPickerModule,
    NgbModule,
    NgxJsonViewerModule,
    MarkdownModule.forRoot(),
    ContextMenuModule.forRoot({
      useBootstrap4: true
    }),
    HttpClientModule,
    MomentModule,
    NgxChartsModule,
    LZStringModule
  ],
  providers: [
    EmploiTempsService,
    DatesService,
    NotesService,
    MessageService,
    CookieService,
    LZStringService,
    [{provide: NgbDateAdapter, useClass: MomentDateAdapter}]
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalAccueilInfoComponent,
    ModalEvenementsLoginComponent,
    ModalEvenementsEditComponent,
    ModalEtExclusionsComponent,
    ModalEtGestionCoursComponent,
    ModalEtNotesComponent,
    ModalEtStatsComponent,
    ModalEtCoursDetailsComponent
  ]
})
export class AppModule {}
