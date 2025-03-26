import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IniciComponent } from './inici/inici.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProtectoraComponent } from './protectora/protectora.component';
import { FooterComponent } from './footer/footer.component';

const routes: Routes = [ 
  { path: '', component: IniciComponent },
  
  { path: 'navbar', component: NavbarComponent },
  { path: 'protectora', component: ProtectoraComponent },
/*   { path: 'animal-perdut', component: AnimalPerdutComponent }, */
{ path: 'footer', component: FooterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
