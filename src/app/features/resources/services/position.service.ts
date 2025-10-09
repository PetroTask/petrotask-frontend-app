import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { Position } from '../models/position.entity';
import { PositionResource, CreatePositionResource } from '../models/position.resource';
import { PositionAssembler } from '../mappers/position.assembler';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private baseUrl = `${environment.apiBaseUrl}/positions`;

  constructor(private http: HttpClient) {}

  getAllPositions(): Observable<Position[]> {
    return this.http.get<PositionResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => PositionAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error('Error in getAllPositions:', error);
        // Return mock positions for development
        return of(this.getMockPositions());
      })
    );
  }

  getPositionById(id: number): Observable<Position> {
    return this.http.get<PositionResource>(`${this.baseUrl}/${id}`).pipe(
      map(resource => PositionAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error getting position ${id}:`, error);
        const mockPositions = this.getMockPositions();
        const mockPosition = mockPositions.find(p => p.id === id) || mockPositions[0];
        return of(mockPosition);
      })
    );
  }

  createPosition(position: Position): Observable<Position> {
    const createResource = PositionAssembler.toResourceFromEntity(position);
    return this.http.post<PositionResource>(this.baseUrl, createResource).pipe(
      map(resource => PositionAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error creating position:', error);
        // For development, simulate creation
        const newPosition = new Position(
          Date.now(),
          position.tenantId,
          position.title,
          position.description
        );
        return of(newPosition);
      })
    );
  }

  // Mock data for development
  private getMockPositions(): Position[] {
    return [
      new Position(1, 1, 'Gerente General', 'Responsable de la dirección estratégica y operativa de la empresa'),
      new Position(2, 1, 'Supervisor de Operaciones', 'Supervisa las actividades operativas diarias y coordina equipos de trabajo'),
      new Position(3, 1, 'Operario de Producción', 'Ejecuta tareas de producción y mantenimiento de equipos'),
      new Position(4, 1, 'Técnico Especialista', 'Proporciona soporte técnico especializado y mantenimiento preventivo'),
      new Position(5, 1, 'Analista de Calidad', 'Realiza controles de calidad y análisis de procesos productivos'),
      new Position(6, 1, 'Asistente Administrativo', 'Brinda apoyo administrativo y gestiona documentación'),
      new Position(7, 1, 'Jefe de Logística', 'Coordina actividades de almacén, distribución y cadena de suministro'),
      new Position(8, 1, 'Director de Recursos Humanos', 'Lidera estrategias de talento humano y desarrollo organizacional'),
      new Position(9, 1, 'Coordinador de Seguridad', 'Implementa protocolos de seguridad y prevención de riesgos'),
      new Position(10, 1, 'Especialista en Mantenimiento', 'Realiza mantenimiento predictivo y correctivo de maquinaria')
    ];
  }
} 