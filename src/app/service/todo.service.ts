import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, of, throwError, tap, catchError } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { environment } from '../../environments/environment';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  description?: string;
  deadline?: string;
  priority?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl + '/api/todos';

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

  getTasks(): Observable<Todo[]> {
    console.log('Fetching all tasks from backend:', this.apiUrl);
    return this.http.get<Todo[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(tasks => console.log('Backend response - Fetched tasks:', tasks)),
      catchError(error => {
        console.error('Backend error - Failed to fetch tasks:', error);
        return throwError(() => error);
      })
    );
  }

  getTask(id: string): Observable<Todo> {
    console.log(`Fetching task by ID from backend: ${id}`);
    return this.http.get<Todo>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(task => console.log('Backend response - Fetched task:', task)),
      catchError(error => {
        console.error(`Backend error - Failed to fetch task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  addTask(task: any): Observable<Todo> {
    const todoData: Partial<Todo> = {
      title: task.title || task.name,
      completed: false,
      description: task.desc || task.description || '',
      deadline: task.deadline || null,
      priority: task.priority || 'Medium'
    };
    console.log('Adding new task to backend:', todoData);
    return this.http.post<Todo>(this.apiUrl, todoData, { headers: this.getHeaders() }).pipe(
      tap(createdTask => console.log('Backend response - Task created:', createdTask)),
      catchError(error => {
        console.error('Backend error - Failed to create task:', error);
        return throwError(() => error);
      })
    );
  }

  updateTask(id: string, task: any): Observable<Todo> {
    const todoData: Partial<Todo> = {};
    
    // Map task properties to Todo structure expected by backend
    if (task.name !== undefined) todoData.title = task.name;
    if (task.title !== undefined) todoData.title = task.title;
    if (task.completed !== undefined) todoData.completed = task.completed;
    if (task.desc !== undefined) todoData.description = task.desc;
    if (task.description !== undefined) todoData.description = task.description;
    if (task.deadline !== undefined) todoData.deadline = task.deadline;
    if (task.priority !== undefined) todoData.priority = task.priority;
    
    console.log(`Updating task in backend. ID: ${id}, Data:`, todoData);
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, todoData, { headers: this.getHeaders() }).pipe(
      tap(updatedTask => console.log('Backend response - Task updated:', updatedTask)),
      catchError(error => {
        console.error(`Backend error - Failed to update task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    console.log(`Deleting task from backend. ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log(`Backend response - Task ${id} deleted successfully`)),
      catchError(error => {
        console.error(`Backend error - Failed to delete task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
} 