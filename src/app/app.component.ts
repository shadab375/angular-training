// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { TodoAddComponent } from './MyComponents/todo-add/todo-add.component';
import { MockTodoService } from './service/mock-todo.service';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [TodoAddComponent, CommonModule, NgIf, FormsModule, DatePipe],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'TaskMaster Pro';
    tasks: any[] = [];
    edit: boolean = false;
    editTask: any = {};
    searchQuery: string = '';
    sortBy: string = 'deadline';
    sortDirection: 'asc' | 'desc' = 'asc';

    constructor(private mockTodoService: MockTodoService) { }

    ngOnInit(): void {
        this.getTasks();
    }

    get completedTasksCount(): number {
        return this.tasks.filter(task => task.completed).length;
    }

    get pendingTasksCount(): number {
        return this.tasks.filter(task => !task.completed).length;
    }

    get completedTasks(): any[] {
        return this.tasks.filter(task => task.completed);
    }

    get pendingTasks(): any[] {
        return this.tasks.filter(task => !task.completed);
    }

    getTasks(): void {
        this.mockTodoService.getTasks().subscribe(
            (res: any) => {
                this.tasks = res;
                this.sortTasks();
            },
            (error: any) => {
                console.error('Error fetching tasks:', error);
            }
        );
    }

    addTask(task: any): void {
        this.mockTodoService.addTask(task).subscribe(
            (res: any) => {
                console.log('Task added:', res);
                this.getTasks();
            },
            (error: any) => {
                console.error('Error adding task:', error);
            }
        );
    }

    handleDelete(task: any): void {
        if (confirm('Are you sure you want to delete this task?')) {
            this.mockTodoService.deleteTask(task._id).subscribe(
                (res: any) => {
                    console.log('Task Deleted:', res);
                    this.getTasks();
                },
                (error: any) => {
                    console.error('Error Deleting task:', error);
                }
            );
        }
    }

    handleEdit(task: any): void {
        this.edit = true;
        this.editTask = { ...task };
        // Convert date string to format compatible with date input
        if (this.editTask.deadline) {
            this.editTask.deadline = new Date(this.editTask.deadline).toISOString().split('T')[0];
        }
    }

    handleComplete(task: any): void {
        this.mockTodoService.updateTask(task._id, {
            name: task.name,
            desc: task.desc,
            deadline: task.deadline,
            completed: true,
            completedDate: new Date().toISOString()
        }).subscribe(
            (res: any) => {
                console.log('Task Updated:', res);
                this.getTasks();
            },
            (error: any) => {
                console.error('Error Updating task:', error);
            }
        );
    }

    handleUpdate(task: any): void {
        this.edit = false;
        // Ensure deadline is in the correct format
        const updatedTask = {
            name: task.name,
            desc: task.desc,
            deadline: new Date(this.editTask.deadline).toISOString(),
        };
        
        this.mockTodoService.updateTask(task._id, updatedTask).subscribe(
            (res: any) => {
                console.log('Task Updated:', res);
                this.getTasks();
            },
            (error: any) => {
                console.error('Error Updating task:', error);
            }
        );
    }

    get filteredTasks(): any[] {
        return this.tasks.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                task.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesSearch;
        });
    }

    sortTasks(): void {
        this.tasks.sort((a, b) => {
            let comparison = 0;
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'deadline':
                    comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    break;
                case 'completed':
                    comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
                    break;
            }
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    toggleSortDirection(): void {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortTasks();
    }

    getTaskPriority(task: any): string {
        const deadline = new Date(task.deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Overdue';
        if (diffDays <= 2) return 'High';
        if (diffDays <= 5) return 'Medium';
        return 'Low';
    }

    getPriorityColor(priority: string): string {
        switch (priority) {
            case 'Overdue': return 'text-red-500';
            case 'High': return 'text-orange-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    }
}