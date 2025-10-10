import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { SignInRequest } from '../../features/iam/models/sign-in.request';
import { SignInResponse } from '../../features/iam/models/sign-in.response';
import { SignUpRequest } from '../../features/iam/models/sign-up.request';
import { SignUpResponse } from '../../features/iam/models/sign-up.response';
import { User } from '../../features/iam/models/user.entity';
import { Roles } from '../../features/iam/models/roles.enum';

@Injectable({
  providedIn: 'root'
})
export class FakeApiService {
  private db: any = null;
  private users: any[] = [];
  private companies: any[] = [];

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      const response = await fetch('/server/db.json');
      this.db = await response.json();
      this.initializeUsers();
    } catch (error) {
      console.error('Error loading db.json:', error);
      this.initializeDefaultData();
    }
  }

  private initializeUsers() {
    // Crear usuarios por defecto basados en los empleados existentes
    this.users = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@petrotask.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: [Roles.Admin],
        companyId: 1
      },
      {
        id: 2,
        username: 'supervisor',
        password: 'super123',
        email: 'supervisor@petrotask.com',
        firstName: 'Supervisor',
        lastName: 'User',
        roles: [Roles.FieldSupervisor],
        companyId: 1
      },
      {
        id: 3,
        username: 'operario',
        password: 'oper123',
        email: 'operario@petrotask.com',
        firstName: 'Operario',
        lastName: 'User',
        roles: [Roles.FieldOperator],
        companyId: 1
      },
      {
        id: 4,
        username: 'planificador',
        password: 'plan123',
        email: 'planificador@petrotask.com',
        firstName: 'Planificador',
        lastName: 'User',
        roles: [Roles.FieldPlanner],
        companyId: 1
      },
      {
        id: 5,
        username: 'tecnico',
        password: 'tec123',
        email: 'tecnico@petrotask.com',
        firstName: 'Técnico',
        lastName: 'User',
        roles: [Roles.FieldTechnician],
        companyId: 1
      }
    ];

    this.companies = [
      {
        id: 1,
        ruc: '20123456789',
        legalName: 'PetroTask S.A.C.',
        commercialName: 'PetroTask',
        address: 'Av. Principal 123',
        city: 'Lima',
        country: 'Perú',
        tenantPhone: '+51 1 234 5678',
        tenantEmail: 'info@petrotask.com',
        website: 'https://petrotask.com'
      }
    ];
  }

  private initializeDefaultData() {
    this.initializeUsers();
  }

  // Simular delay de red
  private simulateNetworkDelay(): Observable<any> {
    return of(null).pipe(delay(Math.random() * 1000 + 500));
  }

  // Autenticación
  signIn(request: SignInRequest): Observable<SignInResponse> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        const user = this.users.find(u =>
          u.username === request.username && u.password === request.password
        );

        if (user) {
        console.log('User found for login:', user);
        const response: SignInResponse = new SignInResponse({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          token: this.generateFakeToken(user),
          companyId: user.companyId
        });
        console.log('Login response:', response);
          observer.next(response);
          observer.complete();
        } else {
          observer.error({ status: 401, message: 'Credenciales inválidas' });
        }
      });
    });
  }

  signUp(request: SignUpRequest): Observable<SignUpResponse> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        // Verificar si el usuario ya existe
        const existingUser = this.users.find(u =>
          u.username === request.username || u.email === request.email
        );

        if (existingUser) {
          observer.error({ status: 400, message: 'Usuario o email ya existe' });
          return;
        }

        // Crear nueva empresa
        const newCompany = {
          id: this.companies.length + 1,
          ruc: request.ruc,
          legalName: request.legalName,
          commercialName: request.commercialName,
          address: request.address,
          city: request.city,
          country: request.country,
          tenantPhone: request.tenantPhone,
          tenantEmail: request.tenantEmail,
          website: request.website
        };

        this.companies.push(newCompany);

        // Crear nuevo usuario
        const userRole = request.role || 'supervisor';
        const assignedRoles = userRole === 'operario' ? [Roles.FieldOperator] : [Roles.FieldSupervisor];

        const newUser = {
          id: this.users.length + 1,
          username: request.username,
          password: request.password,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          roles: assignedRoles,
          companyId: newCompany.id,
          role: userRole
        };

        this.users.push(newUser);

        const response: SignUpResponse = new SignUpResponse({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          active: true,
          roles: newUser.roles,
          companyId: newCompany.id,
          message: 'Usuario registrado exitosamente',
          role: userRole
        } as any);

        observer.next(response);
        observer.complete();
      });
    });
  }

  // Obtener datos del JSON
  getPositions(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.positions || []);
        observer.complete();
      });
    });
  }

  getActivities(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.activity || []);
        observer.complete();
      });
    });
  }

  getEmployees(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.employee || []);
        observer.complete();
      });
    });
  }

  getEquipment(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.equipment || []);
        observer.complete();
      });
    });
  }

  getLocations(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.location || []);
        observer.complete();
      });
    });
  }

  getTasks(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.task || []);
        observer.complete();
      });
    });
  }

  getZones(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.zone || []);
        observer.complete();
      });
    });
  }

  getTeams(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.team || []);
        observer.complete();
      });
    });
  }

  getTeamMembers(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.['team-member'] || []);
        observer.complete();
      });
    });
  }

  getTaskScheduling(): Observable<any[]> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        observer.next(this.db?.['task-scheduling'] || []);
        observer.complete();
      });
    });
  }

  // CRUD operations
  createActivity(activity: any): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        const newActivity = {
          ...activity,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (this.db) {
          this.db.activity = this.db.activity || [];
          this.db.activity.push(newActivity);
        }

        observer.next(newActivity);
        observer.complete();
      });
    });
  }

  updateActivity(id: number, activity: any): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        if (this.db && this.db.activity) {
          const index = this.db.activity.findIndex((a: any) => a.id === id);
          if (index !== -1) {
            this.db.activity[index] = {
              ...this.db.activity[index],
              ...activity,
              updatedAt: new Date().toISOString()
            };
            observer.next(this.db.activity[index]);
          } else {
            observer.error({ status: 404, message: 'Actividad no encontrada' });
          }
        } else {
          observer.error({ status: 500, message: 'Error interno' });
        }
        observer.complete();
      });
    });
  }

  deleteActivity(id: number): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        if (this.db && this.db.activity) {
          const index = this.db.activity.findIndex((a: any) => a.id === id);
          if (index !== -1) {
            this.db.activity.splice(index, 1);
            observer.next({ success: true });
          } else {
            observer.error({ status: 404, message: 'Actividad no encontrada' });
          }
        } else {
          observer.error({ status: 500, message: 'Error interno' });
        }
        observer.complete();
      });
    });
  }

  // Métodos similares para otros recursos...
  createEmployee(employee: any): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        const newEmployee = {
          ...employee,
          id: Date.now(),
          status: 'ACTIVE'
        };

        if (this.db) {
          this.db.employee = this.db.employee || [];
          this.db.employee.push(newEmployee);
        }

        observer.next(newEmployee);
        observer.complete();
      });
    });
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        if (this.db && this.db.employee) {
          const index = this.db.employee.findIndex((e: any) => e.id === id);
          if (index !== -1) {
            this.db.employee[index] = { ...this.db.employee[index], ...employee };
            observer.next(this.db.employee[index]);
          } else {
            observer.error({ status: 404, message: 'Empleado no encontrado' });
          }
        } else {
          observer.error({ status: 500, message: 'Error interno' });
        }
        observer.complete();
      });
    });
  }

  deleteEmployee(id: number): Observable<any> {
    return new Observable(observer => {
      this.simulateNetworkDelay().subscribe(() => {
        if (this.db && this.db.employee) {
          const index = this.db.employee.findIndex((e: any) => e.id === id);
          if (index !== -1) {
            this.db.employee.splice(index, 1);
            observer.next({ success: true });
          } else {
            observer.error({ status: 404, message: 'Empleado no encontrado' });
          }
        } else {
          observer.error({ status: 500, message: 'Error interno' });
        }
        observer.complete();
      });
    });
  }

  private generateFakeToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      roles: user.roles,
      companyId: user.companyId,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };
    return btoa(JSON.stringify(payload));
  }

  // Método para obtener el usuario actual basado en el token
  getCurrentUser(token: string): any {
    try {
      const payload = JSON.parse(atob(token));
      return this.users.find(u => u.id === payload.id);
    } catch {
      return null;
    }
  }
}
