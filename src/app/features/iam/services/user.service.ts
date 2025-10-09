import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.entity';
import { map, Observable, catchError, throwError } from 'rxjs';
import { UserAssembler } from '../mappers/user.assembler';
import { UserResponse } from '../models/user.response';
import { CreateUserRequest } from '../models/create-user.request';
import { UpdateUserRequest } from '../models/update-user.request';
import { environment } from 'src/environments/environment';
import { FakeApiService } from 'src/app/core/services/fake-api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http: HttpClient = inject(HttpClient);
  private fakeApiService = inject(FakeApiService);
  private baseUrl = `${environment.apiBaseUrl}/users`;
  private httpOptions = { 
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<UserResponse[]>(this.baseUrl, this.httpOptions).pipe(
      map(users => users.map(user => UserAssembler.toEntity(user))),
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<User | undefined> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`, this.httpOptions).pipe(
      map(user => UserAssembler.toEntity(user)),
      catchError(this.handleError)
    );
  } 

  createUser(user: User, password: string): Observable<User> {
    const createRequest = UserAssembler.toCreateRequest(user, password);
    return this.http.post<UserResponse>(this.baseUrl, createRequest, this.httpOptions).pipe(
      map(userResponse => UserAssembler.toEntity(userResponse)),
      catchError(this.handleError)
    );
  }

  updateUser(user: User): Observable<User> {
    const updateRequest = UserAssembler.toUpdateRequest(user);
    return this.http.put<UserResponse>(`${this.baseUrl}/${user.id}`, updateRequest, this.httpOptions).pipe(
      map(userResponse => UserAssembler.toEntity(userResponse)),
      catchError(this.handleError)
    );
  }

  deleteUser(id: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.httpOptions).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  toggleUserStatus(user: User): Observable<boolean> {
    const request = UserAssembler.toUpdateStatusRequest(user);
    console.log(`${this.baseUrl}/${user.id}/status`);
    console.log(request);
    return this.http.put<any>(`${this.baseUrl}/${user.id}/status`, request).pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }
}
