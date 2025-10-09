import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, switchMap } from 'rxjs';
import { Activity } from '../model/activity.entity';
import { ActivityResource, CreateActivityResource, UpdateActivityStatusResource } from '../model/activity.resource';
import { ActivityAssembler } from '../mappers/activity.assembler';
import { TaskService } from './task.service';
import { Task } from '../model/task.entity';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private baseUrl = `${environment.apiBaseUrl}/activities`;

  constructor(private http: HttpClient, private taskService: TaskService) {}

  /**
   * Create a new activity
   */
  createActivity(activity: Activity): Observable<Activity> {
    const createResource = ActivityAssembler.toCreateResourceFromEntity(activity);
    return this.http.post<ActivityResource>(this.baseUrl, createResource).pipe(
      map(resource => ActivityAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error('Error creating activity:', error);
        // For development, simulate creation
        const newActivity = new Activity(
          Date.now(),
          activity.activityCode,
          activity.description,
          activity.expectedTime,
          activity.weekNumber,
          activity.activityStatus,
          activity.zoneOrigin,
          activity.locationOrigin,
          activity.zoneDestination,
          activity.locationDestination
        );
        return of(newActivity);
      })
    );
  }

  /**
   * Get activity by ID
   */
  getActivityById(activityId: number): Observable<Activity> {
    return this.http.get<ActivityResource>(`${this.baseUrl}/${activityId}`).pipe(
      switchMap(resource => {
        const activity = ActivityAssembler.toEntityFromResource(resource);
        
        // Get tasks for this activity
        return this.taskService.getTasksByActivityId(activityId).pipe(
          map((tasks: Task[]) => {
            activity.tasks = tasks;
            return activity;
          }),
          catchError(error => {
            console.error(`Error getting tasks for activity ${activityId}:`, error);
            // Return activity without tasks if task fetch fails
            return of(activity);
          })
        );
      }),
      catchError(error => {
        console.error(`Error getting activity ${activityId}:`, error);
        const mockActivity = new Activity(activityId, 'MOCK001', 'Mock Activity', new Date(), 1, 'PENDING', 1, 1, 2, 2);
        return of(mockActivity);
      })
    );
  }

  /**
   * Get all activities
   */
  getAllActivities(): Observable<Activity[]> {
    return this.http.get<ActivityResource[]>(this.baseUrl).pipe(
      switchMap(resources => {
        const activities = resources.map(resource => ActivityAssembler.toEntityFromResource(resource));
        
        // Get all tasks and assign them to their respective activities
        return this.taskService.getAllTasks().pipe(
          map((tasks: Task[]) => {
            return activities.map(activity => {
              activity.tasks = tasks.filter(task => task.activityId === activity.id);
              return activity;
            });
          })
        );
      }),
      catchError(error => {
        console.error('Error getting all activities:', error);
        return of(this.getMockActivities());
      })
    );
  }

  /**
   * Get activities by status
   */
  getActivitiesByStatus(status: string): Observable<Activity[]> {
    return this.http.get<ActivityResource[]>(`${this.baseUrl}/status/${status}`).pipe(
      switchMap(resources => {
        const activities = resources.map(resource => ActivityAssembler.toEntityFromResource(resource));
        
        // Get all tasks and assign them to their respective activities
        return this.taskService.getAllTasks().pipe(
          map((tasks: Task[]) => {
            return activities.map(activity => {
              activity.tasks = tasks.filter(task => task.activityId === activity.id);
              return activity;
            });
          })
        );
      }),
      catchError(error => {
        console.error(`Error getting activities by status ${status}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Update activity status
   */
  updateActivityStatus(activityId: number, status: string): Observable<Activity> {
    const updateResource: UpdateActivityStatusResource = { status };
    return this.http.patch<ActivityResource>(`${this.baseUrl}/${activityId}/status`, updateResource).pipe(
      map(resource => ActivityAssembler.toEntityFromResource(resource)),
      catchError(error => {
        console.error(`Error updating activity ${activityId} status:`, error);
        throw error;
      })
    );
  }

  // Mock data for development
  private getMockActivities(): Activity[] {
    return [
      new Activity(1, 'ACT001', 'Carga de Contenedores', new Date(), 1, 'PENDING', 1, 1, 2, 2),
      new Activity(2, 'ACT002', 'Descarga de Mercancía', new Date(), 1, 'IN_PROGRESS', 2, 3, 1, 4),
      new Activity(3, 'ACT003', 'Mantenimiento de Equipos', new Date(), 2, 'COMPLETED', 3, 5, 3, 6),
      new Activity(4, 'ACT004', 'Inspección de Seguridad', new Date(), 2, 'PENDING', 1, 2, 4, 7)
    ];
  }
}
