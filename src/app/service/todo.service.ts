import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, of, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getTasks(): Observable<any[]> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(tasks => tasks.filter(task => task.userId === userId))
    );
  }

  addTask(task: any): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    const newTask = {
      ...task,
      userId,
      completed: false,
      priority: task.priority || 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: task.tags || [],
      category: task.category || 'General'
    };
    return this.http.post<any>(this.apiUrl, newTask, { headers: this.getHeaders() });
  }

  updateTask(id: string, task: any): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      switchMap(existingTask => {
        if (!existingTask) {
          return throwError(() => new Error('Task not found'));
        }
        if (existingTask.userId !== userId) {
          return throwError(() => new Error('Unauthorized to update this task'));
        }

        const updatedTask = {
          ...existingTask,
          ...task,
          userId,
          updatedAt: new Date().toISOString(),
          priority: task.priority || existingTask.priority
        };
        return this.http.put<any>(`${this.apiUrl}/${id}`, updatedTask, { headers: this.getHeaders() });
      })
    );
  }

  deleteTask(id: string): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      switchMap(task => {
        if (!task) {
          return throwError(() => new Error('Task not found'));
        }
        if (task.userId !== userId) {
          return throwError(() => new Error('Unauthorized to delete this task'));
        }
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
      })
    );
  }

  private calculatePriority(deadline: string): string {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 2) return 'High';
    if (diffDays <= 5) return 'Medium';
    return 'Low';
  }
} 