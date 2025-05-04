import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoAddComponent } from '../todo-add/todo-add.component';
import { TodoService } from '../../service/todo.service';
import { GeminiService } from '../../Services/gemini.service';
import { AuthService } from '../../Services/auth.service';
import { DatePipe } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TodoAddComponent, CommonModule, FormsModule, DatePipe],
  templateUrl: './dashboard.component.html',
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
export class DashboardComponent implements OnInit {
  title = 'TaskMaster Pro';
  tasks: any[] = [];
  edit: boolean = false;
  editTask: any = {};
  searchQuery: string = '';
  sortBy: string = 'deadline';
  sortDirection: 'asc' | 'desc' = 'asc';
  today: Date = new Date();
  currentYear: number = new Date().getFullYear();
  userName: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  // Gemini Chat Properties
  userQuery: string = '';
  aiResponse: string = '';
  isLoading: boolean = false;
  operationInProgress: boolean = false;
  operationResult: { success: boolean, message: string } | null = null;

  constructor(
    private router: Router,
    private todoService: TodoService,
    private geminiService: GeminiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getTasks();
    this.userName = this.authService.currentUserValue?.name || 'User';
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

  private showMessage(message: string, isError: boolean = false) {
    if (isError) {
      this.errorMessage = message;
      setTimeout(() => this.errorMessage = '', 5000);
    } else {
      this.successMessage = message;
      setTimeout(() => this.successMessage = '', 5000);
    }
  }

  getTasks(): void {
    this.todoService.getTasks().subscribe({
      next: (res: any) => {
        this.tasks = res;
        this.sortTasks();
      },
      error: (error: any) => {
        console.error('Error fetching tasks:', error);
        this.showMessage('Failed to fetch tasks. Please try again.', true);
      }
    });
  }

  addTask(task: any): void {
    this.todoService.addTask(task).subscribe({
      next: (res: any) => {
        this.showMessage('Task added successfully!');
        this.getTasks();
      },
      error: (error: any) => {
        console.error('Error adding task:', error);
        this.showMessage('Failed to add task. Please try again.', true);
      }
    });
  }

  handleDelete(task: any): void {
    if (!task.id) {
      this.showMessage('Task ID is missing', true);
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.todoService.deleteTask(task.id).subscribe({
        next: (res: any) => {
          this.showMessage('Task deleted successfully!');
          this.getTasks();
        },
        error: (error: any) => {
          console.error('Error deleting task:', error);
          this.showMessage(error.message || 'Failed to delete task. Please try again.', true);
        }
      });
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
    if (!task.id) {
      this.showMessage('Task ID is missing', true);
      return;
    }

    this.todoService.updateTask(task.id, {
      ...task,
      completed: true,
      completedDate: new Date().toISOString()
    }).subscribe({
      next: (res: any) => {
        this.showMessage('Task marked as completed!');
        this.getTasks();
      },
      error: (error: any) => {
        console.error('Error updating task:', error);
        this.showMessage(error.message || 'Failed to update task. Please try again.', true);
      }
    });
  }

  handleUpdate(task: any): void {
    if (!task.id) {
      this.showMessage('Task ID is missing', true);
      return;
    }

    this.edit = false;
    const updatedTask = {
      name: this.editTask.name,
      desc: this.editTask.desc,
      deadline: new Date(this.editTask.deadline).toISOString(),
      priority: this.editTask.priority,
      completed: this.editTask.completed
    };
    
    this.todoService.updateTask(task.id, updatedTask).subscribe({
      next: (res: any) => {
        this.showMessage('Task updated successfully!');
        this.getTasks();
      },
      error: (error: any) => {
        console.error('Error updating task:', error);
        this.showMessage(error.message || 'Failed to update task. Please try again.', true);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
    this.operationResult = null;

    // Format task data for the prompt
    const taskContext = this.tasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.desc,
      deadline: task.deadline,
      completed: task.completed,
      priority: task.priority,
      category: task.category || 'General',
      tags: task.tags || []
    }));

    // First, check if this is a CRUD operation
    this.geminiService.processTaskOperation(this.userQuery, taskContext).subscribe({
      next: (result) => {
        if (result.operation !== 'query' && result.operation !== 'error') {
          // This is a CRUD operation
          this.operationInProgress = true;
          this.geminiService.executeTaskOperation(result.operation, result.data, this.tasks).subscribe({
            next: (opResult) => {
              this.operationResult = opResult;
              if (opResult.success) {
                // If the operation was successful, refresh the task list
                if (!opResult.isQuery) {
                  this.getTasks();
                  this.userQuery = ''; // Clear input field after successful operation
                }
              }
              
              if (!opResult.isQuery) {
                this.aiResponse = opResult.message;
              } else {
                // It's a regular query, proceed with normal handling
                this.handleRegularQuery(taskContext);
              }
              
              this.isLoading = false;
              this.operationInProgress = false;
            },
            error: (error) => {
              console.error('Error executing operation:', error);
              this.operationResult = { success: false, message: 'Failed to execute the requested operation.' };
              this.errorMessage = 'Could not perform the requested task operation.';
              this.isLoading = false;
              this.operationInProgress = false;
            }
          });
        } else if (result.operation === 'error') {
          // Error parsing AI response
          this.aiResponse = result.rawResponse;
          this.isLoading = false;
        } else {
          // This is a regular query
          if (result.rawResponse) {
            // We already have a direct response
            this.aiResponse = result.rawResponse;
            this.isLoading = false;
          } else {
            // Process as a regular query
            this.handleRegularQuery(taskContext);
          }
        }
      },
      error: (error) => {
        console.error('Failed to process operation:', error);
        this.errorMessage = 'Failed to process your request.';
        this.isLoading = false;
      }
    });
  }

  // Handle regular queries that are not CRUD operations
  private handleRegularQuery(taskContext: any[]) {
    // Construct a detailed prompt for Gemini
    const prompt = `You are a helpful task assistant. Here is the current task data from the user's database:

${JSON.stringify(taskContext, null, 2)}

User's question: ${this.userQuery}

Please answer the question based on the task data provided above. If the question is about pending tasks, only consider tasks where completed is false. If it's about completed tasks, only consider tasks where completed is true. Be specific and use the actual task names, deadlines, and other details from the data.

Additionally, let the user know they can ask you to:
- Create new tasks ("Create a task to...")
- Update existing tasks ("Update the task...")
- Mark tasks as complete ("Mark task X as complete")
- Delete tasks ("Delete task Y")`;

    this.geminiService.getGeminiResponse(prompt).subscribe({
      next: (response) => {
        try {
          // Extract the response text
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