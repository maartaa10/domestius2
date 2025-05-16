import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Protectora } from '../interfaces/protectora';
import { Usuari } from '../interfaces/usuari';
import { ProtectoraService } from '../services/protectora.service';
import { UsuariService } from '../services/usuari.service';
import { UsuariCreate } from '../interfaces/usuari-create';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-registrar-protectora',
  standalone: false,
  templateUrl: './registrar-protectora.component.html',
  styleUrl: './registrar-protectora.component.css'
})
export class RegistrarProtectoraComponent {
  loading: boolean = false; 
  usuari: Usuari = {
    id: 0,
    nom: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  protectora: Protectora = {
    id: 0,
    direccion: '',
    telefono: '',
    imatge: '',
    horario_apertura: '',
    horario_cierre: '',
    usuari: undefined
  };

  selectedFile: File | null = null;

  showNomError: boolean = false;
  showEmailError: boolean = false;
  showPasswordError: boolean = false;
  showPasswordMatchError: boolean = false;
  showDireccionError: boolean = false;
  showTelefonoError: boolean = false;
  showHorarioAperturaError: boolean = false;
  showHorarioCierreError: boolean = false;
  showImagenError: boolean = false;

  constructor(
    private usuariService: UsuariService,
    private protectoraService: ProtectoraService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateImagen();
    }
  }

  validateNom(): void {
    this.showNomError = this.usuari.nom.trim().length < 3;
  }

  validatePassword(): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; 
    this.showPasswordError = !passwordRegex.test(this.usuari.password);
    this.showPasswordMatchError = this.usuari.password !== this.usuari.password_confirmation;
  }

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    this.showEmailError = !emailRegex.test(this.usuari.email);
  }

  validateTelefono(): void {
    const telefonoRegex = /^[0-9]{6,}$/; 
    this.showTelefonoError = !telefonoRegex.test(this.protectora.telefono);
  }

  validateDireccion(): void {
    this.showDireccionError = this.protectora.direccion.trim().length === 0;
  }

  validateHorarioApertura(): void {
    this.showHorarioAperturaError = !this.protectora.horario_apertura;
  }

  validateHorarioCierre(): void {
    this.showHorarioCierreError = !this.protectora.horario_cierre;
  }

  validateImagen(): void {
    if (this.selectedFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      this.showImagenError = !validImageTypes.includes(this.selectedFile.type);
    } else {
      this.showImagenError = true;
    }
  }

  onSubmit(): void {
    this.validateNom();
    this.validatePassword();
    this.validateEmail();
    this.validateTelefono();
    this.validateDireccion();
    this.validateHorarioApertura();
    this.validateHorarioCierre();
    this.validateImagen();

    if (
      this.showNomError ||
      this.showPasswordError ||
      this.showPasswordMatchError ||
      this.showEmailError ||
      this.showTelefonoError ||
      this.showDireccionError ||
      this.showHorarioAperturaError ||
      this.showHorarioCierreError ||
      this.showImagenError
    ) {
      return;
    }

    this.loading = true;
  
    const usuariCreate: UsuariCreate = {
      nom: this.usuari.nom,
      email: this.usuari.email,
      password: this.usuari.password,
      password_confirmation: this.usuari.password_confirmation
    };
  
    const formDataUsuario = new FormData();
    formDataUsuario.append('nom', usuariCreate.nom);
    formDataUsuario.append('email', usuariCreate.email);
    formDataUsuario.append('password', usuariCreate.password);
    if (usuariCreate.password_confirmation) {
      formDataUsuario.append('password_confirmation', usuariCreate.password_confirmation);
    }
  
    this.usuariService.registerUsuari(formDataUsuario).subscribe({
      next: (response) => {
        console.log('Usuari registrat amb èxit:', response);
  
        if (!response || !response.id) {
          console.warn('No s\'ha pogut obtenir l\'ID de l\'usuari registrat.');
          alert('Error: No s\'ha pogut registrar la protectora perquè no s\'ha obtingut l\'ID de l\'usuari.');
          this.loading = false;
          return;
        }
  
        console.log('ID de l\'usuari registrat:', response.id);
  
        this.authService.login({ email: usuariCreate.email, password: usuariCreate.password }).subscribe({
          next: (loginResponse) => {
            console.log('Inici de sessió amb èxit:', loginResponse);
            this.tokenService.handleToken(loginResponse.token);
            console.log('Token guardat a localStorage:', this.tokenService.getToken());
            this.crearProtectora(response.id); 
          },
          error: (err) => {
            console.error('Error en iniciar sessió automàticament:', err);
            alert('Error en iniciar sessió automàticament. Si us plau, inicia sessió manualment.');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error en registrar l\'usuari:', err);
        alert('Error en registrar l\'usuari: ' + (err.error?.mensaje || 'Error desconegut.'));
        this.loading = false; 
      }
    });
  }
  
  crearProtectora(usuarioId: number): void {
    const formDataProtectora = new FormData();
    formDataProtectora.append('direccion', this.protectora.direccion || '');
    formDataProtectora.append('telefono', this.protectora.telefono || '');
    formDataProtectora.append('horario_apertura', this.protectora.horario_apertura || '');
    formDataProtectora.append('horario_cierre', this.protectora.horario_cierre || '');
    if (this.selectedFile) {
      formDataProtectora.append('imatge', this.selectedFile);
    }
    formDataProtectora.append('usuari_id', usuarioId.toString());
  
    console.log('Dades enviades per crear la protectora:', Array.from(formDataProtectora.entries()));
  
    this.protectoraService.createProtectora(formDataProtectora).subscribe({
      next: (newProtectora) => {
        console.log('Protectora registrada amb èxit:', newProtectora);
        alert('Protectora registrada amb èxit.');
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en registrar la protectora:', err);
        alert('Error en registrar la protectora: ' + (err.error?.mensaje || 'Error desconegut.'));
        this.loading = false;
      }
    });
  }
}