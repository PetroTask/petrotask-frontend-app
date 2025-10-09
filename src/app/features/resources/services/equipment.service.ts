import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Equipment } from '../models/equipment.entity';
import { EquipmentResource, CreateEquipmentResource, UpdateEquipmentStatusResource } from '../models/equipment.resource';
import { EquipmentAssembler } from '../mappers/equipment.assembler';
import { environment } from '../../../../environments/environment';
import { FakeApiService } from '../../../core/services/fake-api.service';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private baseUrl = `${environment.apiBaseUrl}/equipment`;
  private fakeApiService = inject(FakeApiService);

  constructor(private http: HttpClient) {}

  getAllEquipment(): Observable<Equipment[]> {
    if (environment.useFakeApi) {
      return this.fakeApiService.getEquipment().pipe(
        map(resources => resources.map(resource => EquipmentAssembler.toEntityFromResource(resource)))
      );
    }
    return this.http.get<EquipmentResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => EquipmentAssembler.toEntityFromResource(resource)))
    );
  }

  getEquipmentById(id: number): Observable<Equipment> {
    return this.http.get<EquipmentResource>(`${this.baseUrl}/${id}`).pipe(
      map(resource => EquipmentAssembler.toEntityFromResource(resource))
    );
  }

  createEquipment(equipment: Equipment): Observable<Equipment> {
    const createResource = EquipmentAssembler.toResourceFromEntity(equipment);
    return this.http.post<EquipmentResource>(this.baseUrl, createResource).pipe(
      map(resource => EquipmentAssembler.toEntityFromResource(resource))
    );
  }

  updateEquipmentStatus(id: number, status: string): Observable<Equipment> {
    const updateResource: UpdateEquipmentStatusResource = { status };
    return this.http.patch<EquipmentResource>(`${this.baseUrl}/${id}/status`, updateResource).pipe(
      map(resource => EquipmentAssembler.toEntityFromResource(resource))
    );
  }

  getEquipmentsByStatus(status: string): Observable<Equipment[]> {
    return this.http.get<EquipmentResource[]>(`${this.baseUrl}/status/${status}`).pipe(
      map(resources => resources.map(resource => EquipmentAssembler.toEntityFromResource(resource)))
    );
  }
}
