import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TodoAddComponent } from '../todo-add/todo-add.component';
import { TodoService } from '../../service/todo.service';
import { GeminiService } from '../../Services/gemini.service';
import { AuthService } from '../../Services/auth.service';
import { DatePipe } from '@angular/common';
import { trigger, state, style, animate, transition, query, stagger, keyframes, animateChild, group } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TodoAddComponent, CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './dashboard.component.html',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('taskAnimation', [
      transition('void => in', [
        style({ opacity: 0, transform: 'translateY(30px)', filter: 'blur(10px)' }),
        animate('600ms {{delay}}ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }))
      ]),
      transition('* => void', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 0, transform: 'translateX(100px)', filter: 'blur(10px)' }))
      ])
    ]),
    trigger('countAnimation', [
      transition('* => *', [
        query(':self', [
          style({ scale: 1.2, color: 'rgba(129, 140, 248, 1)', textShadow: '0 0 20px rgba(129, 140, 248, 0.8)' }),
          animate('1s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
            style({ scale: 1, color: 'white', textShadow: '0 0 10px rgba(129, 140, 248, 0.5)' }))
        ], { optional: true })
      ])
    ]),
    trigger('pulseAnimation', [
      state('active', style({ scale: 1 })),
      transition('* => active', [
        animate('1500ms cubic-bezier(0.455, 0.03, 0.515, 0.955)', 
          keyframes([
            style({ scale: 1, offset: 0 }),
            style({ scale: 1.05, offset: 0.5 }),
            style({ scale: 1, offset: 1 })
          ])
        )
      ])
    ]),
    trigger('rotateAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'rotate(-10deg) scale(0.8)' }),
        animate('600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ opacity: 1, transform: 'rotate(0deg) scale(1)' }))
      ])
    ]),
    trigger('bounceAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100px)', opacity: 0 }),
        animate('800ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger('100ms', [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0, filter: 'blur(8px)' }),
        animate('700ms 200ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ transform: 'translateX(0)', opacity: 1, filter: 'blur(0px)' }))
      ])
    ]),
    trigger('glowAnimation', [
      state('inactive', style({ boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' })),
      state('active', style({ boxShadow: '0 0 30px rgba(139, 92, 246, 0.7)' })),
      transition('inactive <=> active', [
        animate('2000ms cubic-bezier(0.455, 0.03, 0.515, 0.955)')
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit {
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

  // Cursor and wave effect properties
  private customCursor: HTMLElement | null = null;
  private customCursorTrail: HTMLElement | null = null;
  private customCursorRing: HTMLElement | null = null;
  private isHovering: boolean = false;
  private cursorVisible: boolean = true;
  private cursorEnlarged: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private waveBg: HTMLElement | null = null;
  private animationFrameId: number | null = null;

  constructor(
    private router: Router,
    private todoService: TodoService,
    private geminiService: GeminiService,
    private authService: AuthService,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.getTasks();
    this.userName = this.authService.currentUserValue?.name || 'User';
  }

  ngAfterViewInit(): void {
    // Initialize custom cursor
    setTimeout(() => {
      this.initCustomCursor();
      this.addCursorHoverEffects();
      this.initWaveEffect();
    }, 500); // Short delay to ensure DOM is fully loaded
  }

  ngOnDestroy(): void {
    // Cancel animation when component is destroyed
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mouseenter', this.onMouseEnter);
    document.removeEventListener('mouseleave', this.onMouseLeave);
  }

  // Initialize wave effect that responds to cursor movement
  private initWaveEffect(): void {
    this.waveBg = document.querySelector('.wave-bg');
    if (!this.waveBg) {
      // Create wave background if it doesn't exist
      this.waveBg = this.renderer.createElement('div');
      this.renderer.addClass(this.waveBg, 'wave-bg');
      this.renderer.setStyle(this.waveBg, 'position', 'fixed');
      this.renderer.setStyle(this.waveBg, 'top', '0');
      this.renderer.setStyle(this.waveBg, 'left', '0');
      this.renderer.setStyle(this.waveBg, 'width', '100%');
      this.renderer.setStyle(this.waveBg, 'height', '100%');
      this.renderer.setStyle(this.waveBg, 'pointer-events', 'none');
      this.renderer.setStyle(this.waveBg, 'z-index', '0');
      this.renderer.appendChild(document.body, this.waveBg);

      // Create wave elements
      for (let i = 0; i < 3; i++) {
        const wave = this.renderer.createElement('div');
        this.renderer.addClass(wave, 'wave');
        this.renderer.addClass(wave, `wave-${i+1}`);
        this.renderer.setStyle(wave, 'position', 'absolute');
        this.renderer.setStyle(wave, 'top', '0');
        this.renderer.setStyle(wave, 'left', '0');
        this.renderer.setStyle(wave, 'width', '100%');
        this.renderer.setStyle(wave, 'height', '100%');
        this.renderer.setStyle(wave, 'background', 'radial-gradient(circle at var(--x) var(--y), rgba(138, 43, 226, 0.05) 0%, transparent 50%)');
        this.renderer.setStyle(wave, 'opacity', '0.6');
        this.renderer.setStyle(wave, 'transform', 'translate(0, 0)');
        this.renderer.setStyle(wave, 'transition', 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)');
        this.renderer.appendChild(this.waveBg, wave);
      }
    }

    // Update wave position based on cursor
    const updateWaveEffect = (e: MouseEvent) => {
      if (!this.waveBg) return;
      
      const waves = this.waveBg.querySelectorAll('.wave');
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      waves.forEach((wave, index) => {
        const delay = index * 0.2;
        const intensity = (3 - index) * 15; // More intense for the first wave
        
        // Update wave position with gentle parallax effect
        setTimeout(() => {
          this.renderer.setStyle(wave, '--x', `${x}%`);
          this.renderer.setStyle(wave, '--y', `${y}%`);
          
          // Subtle movement based on cursor
          const translateX = (x - 50) * ((index + 1) * 0.05);
          const translateY = (y - 50) * ((index + 1) * 0.05);
          this.renderer.setStyle(wave, 'transform', `translate(${translateX}px, ${translateY}px)`);
          
          // Change opacity slightly based on movement
          const opacity = 0.4 + (index * 0.1);
          this.renderer.setStyle(wave, 'opacity', opacity.toString());
        }, delay * 1000);
      });
    };

    // Add event listener for wave effect
    document.addEventListener('mousemove', updateWaveEffect);
  }

  // Custom cursor initialization
  private initCustomCursor(): void {
    // Create custom cursor elements if they don't exist
    if (!document.querySelector('.cursor-dot')) {
      // Main cursor dot
      this.customCursor = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursor, 'cursor-dot');
      this.renderer.appendChild(document.body, this.customCursor);
      
      // Cursor trail
      this.customCursorTrail = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursorTrail, 'cursor-trail');
      this.renderer.appendChild(document.body, this.customCursorTrail);
      
      // Cursor ring
      this.customCursorRing = this.renderer.createElement('div');
      this.renderer.addClass(this.customCursorRing, 'cursor-ring');
      this.renderer.appendChild(document.body, this.customCursorRing);
    } else {
      // Get references if they already exist
      this.customCursor = document.querySelector('.cursor-dot');
      this.customCursorTrail = document.querySelector('.cursor-trail');
      this.customCursorRing = document.querySelector('.cursor-ring');
    }
    
    // Set initial position
    this.updateCursorPosition({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as MouseEvent);
    
    // Define bound event handlers to allow proper removal
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    
    // Add event listeners
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mouseenter', this.onMouseEnter);
    document.addEventListener('mouseleave', this.onMouseLeave);
    
    // Hide system cursor
    document.body.style.cursor = 'none';
    
    // Start animation loop
    this.animateCursor();
  }
  
  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.updateCursorVisibility();
  }
  
  private onMouseDown(e: MouseEvent): void {
    this.updateCursorScale(true);
  }
  
  private onMouseUp(e: MouseEvent): void {
    this.updateCursorScale(false);
  }
  
  private onMouseEnter(e: MouseEvent): void {
    this.cursorVisible = true;
    this.updateCursorVisibility();
  }
  
  private onMouseLeave(e: MouseEvent): void {
    this.cursorVisible = false;
    this.updateCursorVisibility();
  }
  
  private updateCursorPosition(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }
  
  private updateCursorVisibility(): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      if (this.cursorVisible) {
        this.renderer.setStyle(this.customCursor, 'opacity', '1');
        this.renderer.setStyle(this.customCursorTrail, 'opacity', '1');
        this.renderer.setStyle(this.customCursorRing, 'opacity', '1');
      } else {
        this.renderer.setStyle(this.customCursor, 'opacity', '0');
        this.renderer.setStyle(this.customCursorTrail, 'opacity', '0');
        this.renderer.setStyle(this.customCursorRing, 'opacity', '0');
      }
    }
  }
  
  private updateCursorScale(isDown: boolean): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      if (isDown) {
        // Click effect - scale down dot, scale up ring
        this.renderer.setStyle(this.customCursor, 'transform', `translate(-50%, -50%) scale(0.7)`);
        this.renderer.setStyle(this.customCursorRing, 'transform', `translate(-50%, -50%) scale(1.4)`);
        this.renderer.setStyle(this.customCursorTrail, 'transform', `translate(-50%, -50%) scale(1.4)`);
      } else {
        // Release effect
        this.renderer.setStyle(this.customCursor, 'transform', `translate(-50%, -50%) scale(1)`);
        this.renderer.setStyle(this.customCursorRing, 'transform', `translate(-50%, -50%) scale(1)`);
        this.renderer.setStyle(this.customCursorTrail, 'transform', `translate(-50%, -50%) scale(1)`);
      }
    }
  }
  
  private addCursorHoverEffects(): void {
    // Collect all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, .task-card');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.isHovering = true;
        if (this.customCursorRing) {
          this.renderer.setStyle(this.customCursorRing, 'transform', 'translate(-50%, -50%) scale(1.5)');
          this.renderer.setStyle(this.customCursorRing, 'background-color', 'rgba(139, 92, 246, 0.15)');
          this.renderer.setStyle(this.customCursorRing, 'backdrop-filter', 'blur(4px)');
        }
      });
      
      element.addEventListener('mouseleave', () => {
        this.isHovering = false;
        if (this.customCursorRing) {
          this.renderer.setStyle(this.customCursorRing, 'transform', 'translate(-50%, -50%) scale(1)');
          this.renderer.setStyle(this.customCursorRing, 'background-color', 'rgba(139, 92, 246, 0.08)');
          this.renderer.setStyle(this.customCursorRing, 'backdrop-filter', 'blur(0)');
        }
      });
    });
  }
  
  private animateCursor(): void {
    if (this.customCursor && this.customCursorTrail && this.customCursorRing) {
      // Animate main cursor dot exactly at mouse position
      this.renderer.setStyle(this.customCursor, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursor, 'top', `${this.mouseY}px`);
      
      // Animated trail follows with slight delay (elastic effect)
      this.renderer.setStyle(this.customCursorTrail, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursorTrail, 'top', `${this.mouseY}px`);
      
      // Ring follows with even more delay for a nice trail effect
      this.renderer.setStyle(this.customCursorRing, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.customCursorRing, 'top', `${this.mouseY}px`);
    }
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animateCursor());
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