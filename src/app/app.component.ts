// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { TodoAddComponent } from './MyComponents/todo-add/todo-add.component';
import { TodoService } from './service/todo.service';
import { GeminiService } from './Services/gemini.service';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [TodoAddComponent, CommonModule, NgIf, FormsModule, DatePipe],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        trigger('fadeAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('600ms ease-out', style({ opacity: 1 }))
            ])
        ]),
        trigger('fadeInAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-out', style({ opacity: 1 }))
            ])
        ]),
        trigger('countAnimation', [
            transition('* => *', [
                style({ scale: 1 }),
                animate('300ms ease-out', style({ scale: 1.1 })),
                animate('200ms ease-in', style({ scale: 1 }))
            ])
        ]),
        trigger('taskAnimation', [
            transition('void => in', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('{{delay}}ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ])
    ]
})
export class AppComponent implements OnInit {
    title = 'TaskMaster Pro';
    tasks: any[] = [];
    edit: boolean = false;
    editTask: any = {};
    searchQuery: string = '';
    sortBy: string = 'deadline';
    sortDirection: 'asc' | 'desc' = 'asc';
    today: Date = new Date();
    currentYear: number = new Date().getFullYear();

    // Gemini Chat Properties
    userQuery: string = '';
    aiResponse: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(
        private todoService: TodoService,
        private geminiService: GeminiService
    ) { }

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
        this.todoService.getTasks().subscribe(
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
        this.todoService.addTask(task).subscribe(
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
            this.todoService.deleteTask(task.id).subscribe(
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
        this.todoService.updateTask(task.id, {
            name: task.name,
            desc: task.desc,
            deadline: task.deadline,
            priority: task.priority,
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
            name: this.editTask.name,
            desc: this.editTask.desc,
            deadline: new Date(this.editTask.deadline).toISOString(),
            priority: this.editTask.priority
        };
        
        this.todoService.updateTask(task.id, updatedTask).subscribe(
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

    // Gemini Chat Method
    submitQuery() {
        if (!this.userQuery.trim()) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.aiResponse = ''; // Clear previous response

        // Format task data for the prompt
        const taskContext = this.tasks.map(task => ({
            name: task.name,
            description: task.desc,
            deadline: task.deadline,
            completed: task.completed,
            priority: task.priority,
            category: task.category,
            tags: task.tags
        }));

        // Construct a detailed prompt for Gemini
        const prompt = `You are a helpful task assistant. Here is the current task data from the user's database:

${JSON.stringify(taskContext, null, 2)}

User's question: ${this.userQuery}

Please answer the question based on the task data provided above. If the question is about pending tasks, only consider tasks where completed is false. If it's about completed tasks, only consider tasks where completed is true. Be specific and use the actual task names, deadlines, and other details from the data.`;

        this.geminiService.getGeminiResponse(prompt).subscribe({
            next: (response) => {
                try {
                    // Extract the response text (adjust based on actual Gemini API response structure)
                    const candidates = response?.candidates || [];
                    if (candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
                        this.aiResponse = candidates[0].content.parts[0].text.trim();
                    } else {
                        console.error("Unexpected Gemini response structure:", response);
                        this.aiResponse = 'No meaningful response received from AI.';
                    }
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                    this.aiResponse = 'Error processing AI response.';
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Failed to get AI response:', error);
                // Provide more specific error if possible
                this.errorMessage = `Failed to get AI response. Status: ${error.status || 'Unknown'}`;
                if (error.status === 400) {
                    this.errorMessage += ". Please check your API key and request format.";
                } else if (error.status === 429) {
                    this.errorMessage += ". API quota exceeded.";
                }
                this.isLoading = false;
                this.aiResponse = ''; // Clear response on error
            }
        });
    }
}