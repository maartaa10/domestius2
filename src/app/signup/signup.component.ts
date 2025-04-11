import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador personalizado
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('password_confirmation')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  registerForm: FormGroup;
  errors: any;
/*   captchaToken: string = ''; */
  showPassword: boolean = false; 
  showPasswordConfirmation: boolean = false; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }); // Agregar el validador personalizado aquí
  }
/* 
  onCaptchaResolved(token: string | null): void {
    if (token) {
      this.captchaToken = token;
      console.log('Token CAPTCHA:', token);
    } else {
      console.warn('No se generó un token de reCAPTCHA.');
      this.captchaToken = '';
    }
  } */

  onSubmit(): void {
    this.cleanErrors();
  
  /*   if (!this.captchaToken) {
      alert('Completa el captcha antes de enviar');
      return;
    } */
  
    const name = this.registerForm.get('name')?.value ?? '';
    const email = this.registerForm.get('email')?.value ?? '';
    const password = this.registerForm.get('password')?.value ?? '';
    const password_confirmation = this.registerForm.get('password_confirmation')?.value ?? '';
  
    if (!name || !email || !password || !password_confirmation) {
      alert('Todos los campos son obligatorios');
      return;
    }
  
    const registerData = {
      name,
      email,
      password,
      password_confirmation,
     /*  captcha: this.captchaToken */
    };
  
    this.authService.register(registerData).subscribe(
      response => this.handleResponse(response),
      errors => this.handleErrors(errors)
    );
  }

  private handleResponse(response: any): void {
    console.log(response.message);
    this.router.navigateByUrl('/login');
  }

  private handleErrors(errors: any): void {
    this.errors = errors.error.errors;
    console.log(this.errors);
  }

  private cleanErrors(): void {
    this.errors = null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }
}