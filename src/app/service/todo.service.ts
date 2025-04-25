import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addTask(task: any): Observable<any> {
    const newTask = {
      ...task,
      completed: false,
      priority: this.calculatePriority(task.deadline),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: task.tags || [],
      category: task.category || 'General'
    };
    return this.http.post<any>(this.apiUrl, newTask);
  }

  updateTask(id: string, task: any): Observable<any> {
    // Get the current task to preserve fields not included in the update
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      switchMap(existingTask => {
        const updatedTask = {
          ...existingTask,
          ...task,
          updatedAt: new Date().toISOString(),
          priority: task.deadline ? this.calculatePriority(task.deadline) : existingTask.priority
        };
        // Update the task on the server
        return this.http.put<any>(`${this.apiUrl}/${id}`, updatedTask);
      })
    );
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
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