import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  registerForm: FormGroup;
  errors: any;
  captchaToken: string = ''; // Variable para almacenar el token de reCAPTCHA

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      password_confirmation: ['']
    });
  }

  // Método llamado cuando se resuelve el reCAPTCHA
  onCaptchaResolved(token: string): void {
    this.captchaToken = token;
    console.log('Token CAPTCHA:', token);
  }

  onSubmit(): void {
    this.cleanErrors();

    if (!this.captchaToken) {
      alert('Completa el captcha antes de enviar');
      return;
    }

    const registerData = {
      ...this.registerForm.value,
      captcha: this.captchaToken
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
}