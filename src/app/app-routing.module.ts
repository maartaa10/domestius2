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
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MisAnimalesComponent } from './mis-animales/mis-animales.component';
import { RegistrarProtectoraComponent } from './registrar-protectora/registrar-protectora.component';
import { AfegirPublicacioComponent } from './afegir-publicacio/afegir-publicacio.component';
import { EditarPublicacioComponent } from './editar-publicacio/editar-publicacio.component';
import { DetallAnimalPublicacioComponent } from './detall-animal-publicacio/detall-animal-publicacio.component';
import { GraciesComponent } from './gracies/gracies.component';
import { MapaAnimalsPerdutsComponent } from './mapa-animals-perduts/mapa-animals-perduts.component';
import { RegenerarContrasenyaComponent } from './regenerar-contrasenya/regenerar-contrasenya.component';
import { ChatComponent } from './chat/chat.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { WebgrafiaComponent } from './webgrafia/webgrafia.component';
import { PoliticaPrivacidadComponent } from './politica-privacidad/politica-privacidad.component';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { FAQComponent } from './faq/faq.component';

import { TermesICondicionsComponent } from './termes-i-condicions/termes-i-condicions.component';
import { UsDeCookiesComponent } from './us-de-cookies/us-de-cookies.component';
import { ModeracioDeContingutComponent } from './moderacio-de-contingut/moderacio-de-contingut.component';
import { PoliticaDeCookiesComponent } from './politica-de-cookies/politica-de-cookies.component';
import { QueFerAnimalPerdutComponent } from './que-fer-animal-perdut/que-fer-animal-perdut.component';

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
  { path: 'mis-animales', component: MisAnimalesComponent },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'detall-animal-publicacio/:id', component: DetallAnimalPublicacioComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },


  { path: 'animal-llista', component: AnimalLlistaComponent },
  { path: 'inici', component: IniciComponent },

  { path: 'registrar-protectora', component: RegistrarProtectoraComponent },

  { path: 'afegir-publicacio', component: AfegirPublicacioComponent },
  { path: 'editar-publicacio/:id', component: EditarPublicacioComponent },
 
  { path: 'chat', component: ChatComponent },

  { path: 'gracies', component: GraciesComponent },
  { path: 'reset-password', component: RegenerarContrasenyaComponent }, // Ruta para el componente
  { path: 'termes-i-condicions', component: TermesICondicionsComponent },
  { path: 'us-de-cookies', component: UsDeCookiesComponent },
  { path: 'politica-de-cookies', component: PoliticaDeCookiesComponent },
  { path: 'moderacio-de-contingut', component: ModeracioDeContingutComponent },
  { path: 'que-fer-animal-perdut', component: QueFerAnimalPerdutComponent },
  { path: 'mapa-animals-perduts', component: MapaAnimalsPerdutsComponent },
{ path: 'footer', component: FooterComponent },
{ path: 'perfil', component: PerfilComponent },

{ path: 'webgrafia', component: WebgrafiaComponent },
{ path: 'politica-privacidad', component: PoliticaPrivacidadComponent },
{ path: 'sobre-nosotros', component: SobreNosotrosComponent },
{ path: 'faq', component: FAQComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
