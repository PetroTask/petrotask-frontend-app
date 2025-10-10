import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthenticationService } from '../../services/authentication.service';
import { SignUpRequest } from '../../models/sign-up.request';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [FormsModule, TranslatePipe]
})
export class RegisterComponent {
  // Datos de la empresa
  ruc: string = '';
  legalName: string = '';
  commercialName: string = '';
  address: string = '';
  city: string = '';
  country: string = '';
  tenantPhone: string = '';
  tenantEmail: string = '';
  website: string = '';

  // Datos del usuario
  username: string = '';
  password: string = '';
  repeatPassword: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  selectedRole: 'supervisor' | 'operario' = 'supervisor';

  errorMessage: string = '';
  isLoading: boolean = false;
  submitted: boolean = false;

  // Sistema de pestañas mejorado
  currentTab: number = 0;
  tabs = [
    { id: 0, title: 'register-container.company-basic', icon: '🏢', completed: false },
    { id: 1, title: 'register-container.company-contact', icon: '📞', completed: false },
    { id: 2, title: 'register-container.user-basic', icon: '👤', completed: false },
    { id: 3, title: 'register-container.user-credentials', icon: '🔐', completed: false },
    { id: 4, title: 'register-container.role-selection', icon: '👥', completed: false }
  ];

  private authService = inject(AuthenticationService);
  private router = inject(Router);

  // Navegación entre pestañas
  nextTab(): void {
    if (this.validateCurrentTab()) {
      this.tabs[this.currentTab].completed = true;
      if (this.currentTab < this.tabs.length - 1) {
        this.currentTab++;
      }
    }
  }

  prevTab(): void {
    if (this.currentTab > 0) {
      this.currentTab--;
    }
  }

  goToTab(tabIndex: number): void {
    // Solo permitir ir a pestañas completadas o la actual
    if (tabIndex <= this.currentTab || this.tabs[tabIndex - 1]?.completed) {
      this.currentTab = tabIndex;
    }
  }

  // Validaciones por pestaña
  validateCurrentTab(): boolean {
    this.errorMessage = '';

    if (this.currentTab === 0) {
      // Validar datos básicos de empresa
      if (!this.ruc || !this.legalName) {
        this.errorMessage = 'register-container.fill-required-company-basic';
        return false;
      }
    } else if (this.currentTab === 1) {
      // Validar datos de contacto de empresa (opcional)
      return true; // Esta pestaña es opcional
    } else if (this.currentTab === 2) {
      // Validar datos básicos de usuario
      if (!this.firstName || !this.lastName || !this.email) {
        this.errorMessage = 'register-container.fill-required-user-basic';
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errorMessage = 'register-container.email-invalid';
        return false;
      }
    } else if (this.currentTab === 3) {
      // Validar credenciales de usuario
      if (!this.username || !this.password || !this.repeatPassword) {
        this.errorMessage = 'register-container.fill-required-credentials';
        return false;
      }

      if (this.password.length < 6) {
        this.errorMessage = 'register-container.password-min';
        return false;
      }

      if (this.password !== this.repeatPassword) {
        this.errorMessage = 'register-container.password-mismatch';
        return false;
      }
    }

    return true;
  }

  // Validación completa para el registro
  validateAllTabs(): boolean {
    this.errorMessage = '';

    // Validar datos básicos de empresa
    if (!this.ruc || !this.legalName) {
      this.errorMessage = 'register-container.fill-required-company-basic';
      return false;
    }

    // Validar datos básicos de usuario
    if (!this.firstName || !this.lastName || !this.email) {
      this.errorMessage = 'register-container.fill-required-user-basic';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'register-container.email-invalid';
      return false;
    }

    // Validar credenciales
    if (!this.username || !this.password || !this.repeatPassword) {
      this.errorMessage = 'register-container.fill-required-credentials';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'register-container.password-min';
      return false;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'register-container.password-mismatch';
      return false;
    }

    // Validar selección de rol
    if (!this.selectedRole) {
      this.errorMessage = 'register-container.role-required';
      return false;
    }

    return true;
  }

  onRegister(): void {
    console.log('🚀 onRegister() llamado - BOTÓN FUNCIONA!');
    alert('¡Método onRegister ejecutado!');

    this.submitted = true;

    console.log('Validando formulario...');
    if (!this.validateAllTabs()) {
      console.log('Validación falló:', this.errorMessage);
      alert('Error de validación: ' + this.errorMessage);
      return;
    }

    console.log('Validación exitosa, iniciando registro...');
    this.isLoading = true;

    const signUpRequest = new SignUpRequest({
      ruc: this.ruc,
      legalName: this.legalName,
      commercialName: this.commercialName || this.legalName,
      address: this.address,
      city: this.city,
      country: this.country,
      tenantPhone: this.tenantPhone,
      tenantEmail: this.tenantEmail || this.email,
      website: this.website,
      username: this.username,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.selectedRole
    });

    this.authService.signUp(signUpRequest).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        // Pasar el rol seleccionado al método de manejo
        (response as any).role = this.selectedRole;
        this.authService.handleSuccessfulSignUp(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.authService.handleAuthError(error, '/register');
        this.isLoading = false;
        this.errorMessage = 'register-container.error';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Método para debuggear el estado del formulario
  checkFormState(): void {
    console.log('Estado del formulario:', {
      isLoading: this.isLoading,
      submitted: this.submitted,
      currentTab: this.currentTab,
      tabsLength: this.tabs.length,
      ruc: this.ruc,
      legalName: this.legalName,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      password: this.password ? '***' : '',
      repeatPassword: this.repeatPassword ? '***' : ''
    });
  }

  // Método de prueba simple
  testClick(): void {
    console.log('¡BOTÓN FUNCIONA! Clic detectado');
    alert('¡El botón funciona!');
  }
}
