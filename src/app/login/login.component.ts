import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { EmailService } from '../services/email.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errors: any;
  showPassword: boolean = false;
  emailForReset: string = ''; 
  resetMessage: string = ''; 
  authStateChanged = new Subject<boolean>();

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private fb: FormBuilder,
    private emailService: EmailService 
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onSubmit(): void {
    this.cleanErrors();
  
    const loginData = {
      ...this.loginForm.value,
    };
  
    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Guardar el token
        this.tokenService.handleToken(response.token);
        
        // Forzar la emisión del evento de autenticación
        this.authService.updateAuthState();
        
        // Redirección según tipo de usuario
        this.authService.getUserType().subscribe(userType => {
          if (userType === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (userType === 'protectora') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }
        });
      },
      error: (errors) => this.handleErrors(errors)
    });
  }

  updateAuthState(isLoggedIn: boolean): void {
    console.log('Actualizando estado de autenticación:', isLoggedIn);
    this.authStateChanged.next(isLoggedIn);
  }

  sendPasswordReset(): void {
    if (!this.emailForReset.trim()) {
      this.resetMessage = 'Por favor, introduce un correo válido.';
      return;
    }
  
    // Llamar al backend para generar el token
    this.authService.generatePasswordResetToken(this.emailForReset).subscribe({
      next: (response) => {
        const token = response.token; // Obtener el token del backend
  
        // Llamar a EmailService para enviar el correo
        this.emailService.sendPasswordResetEmail(this.emailForReset, token).then(
          () => {
            this.resetMessage = 'Correo de recuperación enviado con éxito.';
          },
          (error) => {
            console.error('Error al enviar el correo:', error);
            this.resetMessage = 'Error al enviar el correo. Intenta de nuevo.';
          }
        );
      },
      error: (err) => {
        console.error('Error al generar el token:', err);
        this.resetMessage = 'Error al generar el token. Intenta de nuevo.';
      },
    });
  }

  private handleErrors(errors: any): void {
    this.errors = errors.error.errors;
  }

  private cleanErrors(): void {
    this.errors = null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}