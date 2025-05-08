import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { EmailService } from '../services/email.service';

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

    this.authService.login(loginData).subscribe(
      response => {
        this.tokenService.handleToken(response.token);
        this.authService.getUserType().subscribe(userType => {
          if (userType === 'protectora') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }
        });
      },
      errors => this.handleErrors(errors)
    );
  }

  sendPasswordReset(): void {
    if (!this.emailForReset.trim()) {
      this.resetMessage = 'Si us plau, introdueix un correu valid.';
      return;
    }

    const resetLink = `http://localhost:4200/reset-password?email=${this.emailForReset}`;
    this.emailService.sendPasswordResetEmail(this.emailForReset, resetLink).then(
      () => {
        this.resetMessage = 'Correu de recuperació enviat amb exit.';
      },
      (error) => {
        console.error('Error al enviar el correu:', error);
        this.resetMessage = 'Error al enviar el correu. Intentaho de nou.';
      }
    );
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