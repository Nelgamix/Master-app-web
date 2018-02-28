import {PageNotFoundComponent} from './pagenotfound/pagenotfound.component';
import {ContactComponent} from './contact/contact.component';
import {EvenementsComponent} from './evenements/evenements.component';
import {EtComponent} from './et/et.component';
import {AccueilComponent} from './accueil/accueil.component';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {path: 'accueil', component: AccueilComponent},
  {path: 'et', component: EtComponent},
  {path: 'et/:year/:week', component: EtComponent},
  {path: 'evenements', component: EvenementsComponent},
  {path: 'contact', component: ContactComponent},
  {path: '', redirectTo: '/accueil', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
