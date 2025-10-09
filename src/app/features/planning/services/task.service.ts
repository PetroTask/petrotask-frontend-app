import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { Task } from '../model/task.entity';
import { TaskResource, CreateTaskResource, UpdateTaskStatusResource, UpdateTaskDescriptionResource, UpdateEmployeeIdResource } from '../model/task.resource';
import { TaskAssembler } from '../mappers/task.assembler';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = `${environment.apiBaseUrl}/tasks`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new task
   */
  createTask(task: Task): Observable<Task> {
    const createResource = TaskAssembler.toCreateResourceFromEntity(task);
    return this.http.post<TaskResource>(this.baseUrl, createResource).pipe(
      map(resource => TaskAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error creating task:', error);
        // For development, simulate creation
        const newTask = new Task(
          Date.now(),
          task.title,
          task.description,
          task.status,
          task.employeeId,
          task.activityId
        );
        return of(newTask);
      })
    );
  }

  /**
   * Get task by ID
   */
  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<TaskResource>(`${this.baseUrl}/${taskId}`).pipe(
      map(resource => TaskAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error getting task ${taskId}:`, error);
        const mockTask = new Task(taskId, 'Mock Task', 'Mock Description', 'PENDING', 1);
        return of(mockTask);
      })
    );
  }

  /**
   * Get all tasks for a specific activity
   */
  getTasksByActivityId(activityId: number): Observable<Task[]> {
    return this.http.get<TaskResource[]>(`${this.baseUrl}/activities/${activityId}`).pipe(
      map(resources => resources.map(resource => TaskAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting tasks for activity ${activityId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Update task employee ID
   */
  updateTaskEmployeeId(taskId: number, employeeId: number): Observable<Task> {
    const updateResource: UpdateEmployeeIdResource = { employeeId };
    return this.http.patch<TaskResource>(`${this.baseUrl}/${taskId}/employeeId`, updateResource).pipe(
      map(resource => TaskAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating task ${taskId} employee:`, error);
        throw error;
      })
    );
  }

  /**
   * Update task description
   */
  updateTaskDescription(taskId: number, description: string): Observable<Task> {
    const updateResource: UpdateTaskDescriptionResource = { description };
    return this.http.patch<TaskResource>(`${this.baseUrl}/${taskId}/description`, updateResource).pipe(
      map(resource => TaskAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating task ${taskId} description:`, error);
        throw error;
      })
    );
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    const updateResource: UpdateTaskStatusResource = { status };
    return this.http.patch<TaskResource>(`${this.baseUrl}/${taskId}/status`, updateResource).pipe(
      map(resource => TaskAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating task ${taskId} status:`, error);
        throw error;
      })
    );
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Observable<Task[]> {
    return this.http.get<TaskResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => TaskAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error('Error getting all tasks:', error);
        return of(this.getMockTasks());
      })
    );
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<TaskResource[]>(`${this.baseUrl}/status/${status}`).pipe(
      map(resources => resources.map(resource => TaskAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting tasks by status ${status}:`, error);
        return of([]);
      })
    );
  }

  // Mock data for development
  private getMockTasks(): Task[] {
    return [
      new Task(1, 'Inspección de Equipos', 'Realizar inspección general de equipos de carga', 'PENDING', 1, 1),
      new Task(2, 'Mantenimiento Preventivo', 'Ejecutar rutina de mantenimiento preventivo', 'IN_PROGRESS', 2, 1),
      new Task(3, 'Limpieza de Área', 'Limpiar y organizar área de trabajo', 'COMPLETED', 3, 2),
      new Task(4, 'Verificación de Seguridad', 'Verificar cumplimiento de protocolos de seguridad', 'PENDING', 4, 2)
    ];
  }
}
