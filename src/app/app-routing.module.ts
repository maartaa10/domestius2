import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IniciComponent } from './inici/inici.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProtectoraComponent } from './protectora/protectora.component';
import { FooterComponent } from './footer/footer.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AnimalPerdutComponent } from './animal-perdut/animal-perdut.component';
import { AnimalPublicacioComponent } from './animal-publicacio/animal-publicacio.component';
import { AnimalDetallComponent } from './animal-detall/animal-detall.component';
import { AnimalLlistaComponent } from './animal-llista/animal-llista.component';
import { ProtectoraDetallComponent } from './protectora-detall/protectora-detall.component';
import { RegistrarAnimalComponent } from './registrar-animal/registrar-animal.component';
import { PublicacioDetallComponent } from './publicacio-detall/publicacio-detall.component';
import { EditarAnimalComponent } from './editar-animal/editar-animal.component';
import { EliminarAnimalComponent } from './eliminar-animal/eliminar-animal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [ 
  { path: '', component: IniciComponent },
  
  { path: 'navbar', component: NavbarComponent },
  { path: 'protectora', component: ProtectoraComponent },
  { path: 'animal-perdut', component: AnimalPerdutComponent },
  { path: 'animal-detall/:id', component: AnimalDetallComponent },
  { path: 'animal-publicacio/:id', component: AnimalPublicacioComponent },
  { path: 'animal-publicacio', component: AnimalPublicacioComponent },
  { path: 'animal-llista', component: AnimalLlistaComponent },
  { path: 'protectora-detall/:id', component: ProtectoraDetallComponent },
  { path: 'registrar-animal', component: RegistrarAnimalComponent },
  { path: 'publicacio/:id', component: PublicacioDetallComponent }, 
  { path: 'editar-animal/:id', component: EditarAnimalComponent },
  { path: 'eliminar-animal/:id', component: EliminarAnimalComponent },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
 
  { path: 'animal-llista', component: AnimalLlistaComponent },
  { path: 'inici', component: IniciComponent },



{ path: 'footer', component: FooterComponent },
{ path: 'perfil', component: PerfilComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
