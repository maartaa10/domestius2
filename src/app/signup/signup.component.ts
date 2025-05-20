import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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
  showPassword: boolean = false;
  showPasswordConfirmation: boolean = false;

  showNomError: boolean = false;
  showEmailError: boolean = false;
  showPasswordError: boolean = false;
  showPasswordMatchError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  validateNom(): void {
    const nom = this.registerForm.get('nom')?.value || '';
    this.showNomError = nom.trim().length < 3;
  }

  validatePassword(): void {
    const password = this.registerForm.get('password')?.value || '';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    this.showPasswordError = !passwordRegex.test(password);

    const confirmPassword = this.registerForm.get('password_confirmation')?.value || '';
    this.showPasswordMatchError = password !== confirmPassword;
  }

  validateEmail(): void {
    const email = this.registerForm.get('email')?.value || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.showEmailError = !emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  onSubmit(): void {
    this.cleanErrors();

    this.validateNom();
    this.validatePassword();
    this.validateEmail();

    if (this.showNomError || this.showPasswordError || this.showPasswordMatchError || this.showEmailError) {
      return;
    }

    const registerData = {
      nom: this.registerForm.get('nom')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      password_confirmation: this.registerForm.get('password_confirmation')?.value
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