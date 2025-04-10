import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IniciComponent } from './inici/inici.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProtectoraComponent } from './protectora/protectora.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MisAnimalesComponent } from './mis-animales/mis-animales.component';

const firebaseConfig = {
  apiKey: "AIzaSyCyePW5xWgzy4RHS7p6TmPJHlCgRSr8vWE",
  authDomain: "domestius2.firebaseapp.com",
  projectId: "domestius2",
  storageBucket: "domestius2.firebasestorage.app",
  messagingSenderId: "817588680014",
  appId: "1:817588680014:web:11ea1773bd2792b5adda1f",
  measurementId: "G-LXZQ0WLQRZ"
};

@NgModule({
  declarations: [
    AppComponent,
    IniciComponent,
    NavbarComponent,
    ProtectoraComponent,
    FooterComponent,
    PerfilComponent,
    AnimalPerdutComponent,
    AnimalPublicacioComponent,
    AnimalDetallComponent,
    AnimalLlistaComponent,
    ProtectoraDetallComponent,
    RegistrarAnimalComponent,
    PublicacioDetallComponent,
    EditarAnimalComponent,
    EliminarAnimalComponent,
    DashboardComponent,
    LoginComponent,
    SignupComponent,
    MisAnimalesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    AngularFireModule.initializeApp(firebaseConfig), // Inicializar Firebase
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
