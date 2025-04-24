import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockTodoService {
  private dummyTasks = [
    {
      _id: '1',
      name: 'Complete Angular Project',
      desc: 'Finish the MEAN stack todo application with all features implemented',
      deadline: '2024-04-30',
      completed: false,
      priority: 'High',
      category: 'Work',
      tags: ['angular', 'typescript', 'web'],
      createdAt: '2024-04-20T10:00:00Z',
      updatedAt: '2024-04-20T10:00:00Z'
    },
    {
      _id: '2',
      name: 'Learn TypeScript',
      desc: 'Study TypeScript fundamentals and advanced features',
      deadline: '2024-05-15',
      completed: true,
      completedDate: '2024-04-22T15:30:00Z',
      priority: 'Medium',
      category: 'Learning',
      tags: ['typescript', 'programming'],
      createdAt: '2024-04-18T09:00:00Z',
      updatedAt: '2024-04-22T15:30:00Z'
    },
    {
      _id: '3',
      name: 'Setup MongoDB',
      desc: 'Configure MongoDB database and implement data models',
      deadline: '2024-05-01',
      completed: false,
      priority: 'High',
      category: 'Work',
      tags: ['mongodb', 'database'],
      createdAt: '2024-04-19T14:00:00Z',
      updatedAt: '2024-04-19T14:00:00Z'
    },
    {
      _id: '4',
      name: 'Review Project Documentation',
      desc: 'Go through all project documentation and update if necessary',
      deadline: '2024-04-25',
      completed: false,
      priority: 'Medium',
      category: 'Documentation',
      tags: ['documentation', 'review'],
      createdAt: '2024-04-21T11:00:00Z',
      updatedAt: '2024-04-21T11:00:00Z'
    }
  ];

  getTasks(): Observable<any[]> {
    return of(this.dummyTasks);
  }

  addTask(task: any): Observable<any> {
    const newTask = {
      ...task,
      _id: (this.dummyTasks.length + 1).toString(),
      completed: false,
      priority: this.calculatePriority(task.deadline),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: task.tags || [],
      category: task.category || 'General'
    };
    this.dummyTasks.push(newTask);
    return of(newTask);
  }

  updateTask(id: string, task: any): Observable<any> {
    const index = this.dummyTasks.findIndex(t => t._id === id);
    if (index !== -1) {
      const updatedTask = {
        ...this.dummyTasks[index],
        ...task,
        updatedAt: new Date().toISOString(),
        priority: task.deadline ? this.calculatePriority(task.deadline) : this.dummyTasks[index].priority
      };
      this.dummyTasks[index] = updatedTask;
      return of(updatedTask);
    }
    return of(null);
  }

  deleteTask(id: string): Observable<any> {
    const index = this.dummyTasks.findIndex(t => t._id === id);
    if (index !== -1) {
      const deletedTask = this.dummyTasks[index];
      this.dummyTasks.splice(index, 1);
      return of(deletedTask);
    }
    return of(null);
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