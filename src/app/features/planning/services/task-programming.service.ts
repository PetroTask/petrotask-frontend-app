import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { TaskProgramming } from '../model/task-programming.entity';
import { TaskProgrammingResource, CreateTaskProgrammingResource, UpdateTaskProgrammingStatusResource, UpdateTaskProgrammingTimeIntervalResource } from '../model/task-programming.resource';
import { TaskProgrammingAssembler } from '../mappers/task-programming.assembler';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskProgrammingService {
  private baseUrl = `${environment.apiBaseUrl}/task-programming`;

  constructor(private http: HttpClient) {}

  /**
   * Add programming to a task
   */
  addTaskProgramming(taskProgramming: TaskProgramming): Observable<TaskProgramming> {
    const createResource = TaskProgrammingAssembler.toCreateResourceFromEntity(taskProgramming);
    return this.http.post<TaskProgrammingResource>(this.baseUrl, createResource).pipe(
      map(resource => TaskProgrammingAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error creating task programming:', error);
        // For development, simulate creation
        const newTaskProgramming = new TaskProgramming(
          Date.now(),
          taskProgramming.reservationId,
          taskProgramming.programmingStatus,
          taskProgramming.taskId,
          taskProgramming.resourceType,
          taskProgramming.resourceId,
          taskProgramming.start,
          taskProgramming.end
        );
        return of(newTaskProgramming);
      })
    );
  }

  /**
   * Get task programming by ID
   */
  getTaskProgrammingById(programmingId: number): Observable<TaskProgramming> {
    return this.http.get<TaskProgrammingResource>(`${this.baseUrl}/${programmingId}`).pipe(
      map(resource => TaskProgrammingAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error getting task programming ${programmingId}:`, error);
        const mockTaskProgramming = new TaskProgramming(programmingId, 1, 'PENDING');
        return of(mockTaskProgramming);
      })
    );
  }

  /**
   * Get task programmings by task ID
   */
  getTaskProgrammingsByTaskId(taskId: number): Observable<TaskProgramming[]> {
    return this.http.get<TaskProgrammingResource[]>(`${this.baseUrl}/tasks/${taskId}`).pipe(
      map(resources => resources.map(resource => TaskProgrammingAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting task programmings for task ${taskId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Update task programming time interval
   */
  updateTaskProgrammingTimeInterval(taskProgrammingId: number, start: Date, end: Date): Observable<TaskProgramming> {
    const updateResource: UpdateTaskProgrammingTimeIntervalResource = {
      start: start.toISOString(),
      end: end.toISOString()
    };
    return this.http.patch<TaskProgrammingResource>(`${this.baseUrl}/${taskProgrammingId}/time-interval`, updateResource).pipe(
      map(resource => TaskProgrammingAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating task programming ${taskProgrammingId} time interval:`, error);
        throw error;
      })
    );
  }

  /**
   * Update task programming status
   */
  updateTaskProgrammingStatus(taskProgrammingId: number, status: string): Observable<TaskProgramming> {
    const updateResource: UpdateTaskProgrammingStatusResource = { programmingStatus: status };
    return this.http.patch<TaskProgrammingResource>(`${this.baseUrl}/${taskProgrammingId}/status`, updateResource).pipe(
      map(resource => TaskProgrammingAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating task programming ${taskProgrammingId} status:`, error);
        throw error;
      })
    );
  }

  /**
   * Get all task programmings
   */
  getAllTaskProgrammings(): Observable<TaskProgramming[]> {
    return this.http.get<TaskProgrammingResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => TaskProgrammingAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error('Error getting all task programmings:', error);
        return of(this.getMockTaskProgrammings());
      })
    );
  }

  /**
   * Get task programmings by activity ID
   */
  getTaskProgrammingsByActivityId(activityId: number): Observable<TaskProgramming[]> {
    return this.http.get<TaskProgrammingResource[]>(`${this.baseUrl}/activities/${activityId}`).pipe(
      map(resources => resources.map(resource => TaskProgrammingAssembler.toEntityFromResource(resource))),
      catchError(error => {
        console.error(`Error getting task programmings for activity ${activityId}:`, error);
        return of([]);
      })
    );
  }

  // Mock data for development
  private getMockTaskProgrammings(): TaskProgramming[] {
    return [
      new TaskProgramming(1, 101, 'PENDING', 1, 'EQUIPMENT', 201, new Date(), new Date(Date.now() + 3600000)),
      new TaskProgramming(2, 102, 'IN_PROGRESS', 2, 'PERSONNEL', 301, new Date(), new Date(Date.now() + 7200000)),
      new TaskProgramming(3, 103, 'COMPLETED', 3, 'VEHICLE', 401, new Date(), new Date(Date.now() + 1800000)),
      new TaskProgramming(4, 104, 'PENDING', 4, 'EQUIPMENT', 501, new Date(), new Date(Date.now() + 5400000))
    ];
  }
}
