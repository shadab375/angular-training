import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { TodoService } from '../service/todo.service';

// TODO: Add environment import later
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  // Use environment variables
  private apiKey = environment.geminiApiKey;
  private apiUrl = environment.geminiApiUrl;

  constructor(
    private http: HttpClient,
    private todoService: TodoService
  ) {
    // Log current time periods on service initialization
    this.logCurrentTimePeriods();
  }

  // Method to log current time periods
  logCurrentTimePeriods(): void {
    const now = new Date();
    // Set time to noon to avoid timezone issues
    now.setHours(12, 0, 0, 0);
    
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Calculate end of week (Saturday)
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSaturday + 1);
    endOfWeek.setHours(12, 0, 0, 0);

    // Calculate end of month
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1, 12, 0, 0, 0);
    endOfMonth.setDate(endOfMonth.getDate() - 1);
    endOfMonth.setDate(endOfMonth.getDate() + 1);

    // Calculate next week
    const daysUntilMonday = (1 - now.getDay() + 7) % 7;
    const nextWeekStart = new Date(now);
    nextWeekStart.setDate(now.getDate() + daysUntilMonday);
    nextWeekStart.setHours(12, 0, 0, 0);
    
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6 + 1);
    nextWeekEnd.setHours(12, 0, 0, 0);

    // Calculate next month
    const nextMonthStart = new Date(currentYear, currentMonth + 1, 1, 12, 0, 0, 0);
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 1, 12, 0, 0, 0);
    nextMonthEnd.setDate(nextMonthEnd.getDate() - 1);
    nextMonthEnd.setDate(nextMonthEnd.getDate() + 1);

    // Calculate within a week (7 days from now)
    const withinWeek = new Date(now);
    withinWeek.setDate(now.getDate() + 7);
    withinWeek.setHours(12, 0, 0, 0);

    // Calculate within a month (30 days from now)
    const withinMonth = new Date(now);
    withinMonth.setDate(now.getDate() + 30);
    withinMonth.setHours(12, 0, 0, 0);

    console.group('Current Time Periods');
    console.log('Current Date:', now.toLocaleDateString());
    console.log('Current Day:', currentDayName);
    console.log('Current Month:', now.toLocaleDateString('en-US', { month: 'long' }));
    console.log('Current Year:', currentYear);
    console.log('\nTime Periods:');
    console.log('End of Week:', endOfWeek.toLocaleDateString());
    console.log('End of Month:', endOfMonth.toLocaleDateString());
    console.log('Next Week:', nextWeekStart.toLocaleDateString(), 'to', nextWeekEnd.toLocaleDateString());
    console.log('Next Month:', nextMonthStart.toLocaleDateString(), 'to', nextMonthEnd.toLocaleDateString());
    console.log('Within Week:', withinWeek.toLocaleDateString());
    console.log('Within Month:', withinMonth.toLocaleDateString());
    console.groupEnd();

    // Store these values for reference
    this.currentTimePeriods = {
      currentDate: now.toLocaleDateString(),
      currentDay: currentDayName,
      currentMonth: now.toLocaleDateString('en-US', { month: 'long' }),
      currentYear: currentYear,
      endOfWeek: endOfWeek.toLocaleDateString(),
      endOfMonth: endOfMonth.toLocaleDateString(),
      nextWeek: {
        start: nextWeekStart.toLocaleDateString(),
        end: nextWeekEnd.toLocaleDateString()
      },
      nextMonth: {
        start: nextMonthStart.toLocaleDateString(),
        end: nextMonthEnd.toLocaleDateString()
      },
      withinWeek: withinWeek.toLocaleDateString(),
      withinMonth: withinMonth.toLocaleDateString()
    };
  }

  // Property to store current time periods
  private currentTimePeriods: any;

  // Method to get current time periods
  getCurrentTimePeriods(): any {
    return this.currentTimePeriods;
  }

  // Basic function to get response from Gemini
  getGeminiResponse(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const url = `${this.apiUrl}?key=${this.apiKey}`;

    // TODO: Add error handling
    return this.http.post<any>(url, body, { headers });
  }

  // Process user query for CRUD operations
  processTaskOperation(userQuery: string, taskContext: any[]): Observable<any> {
    // First, determine if this is a CRUD operation
    const currentYear = new Date().getFullYear();
    const timeInfo = this.getCurrentTimePeriods();
    
    const prompt = `
You are a task management assistant. Analyze the following user request:

"${userQuery}"

IMPORTANT: Use these EXACT dates for time-based requests:
- For "end of week" or "by end of week" → Use: ${timeInfo.endOfWeek}
- For "end of month" or "by end of month" → Use: ${timeInfo.endOfMonth}
- For "next week" → Use: ${timeInfo.nextWeek.start} to ${timeInfo.nextWeek.end}
- For "next month" → Use: ${timeInfo.nextMonth.start} to ${timeInfo.nextMonth.end}
- For "within a week" or "in a week" → Use: ${timeInfo.currentDate} to ${timeInfo.withinWeek}
- For "within a month" or "in a month" → Use: ${timeInfo.currentDate} to ${timeInfo.withinMonth}

Current time information:
- Today is ${timeInfo.currentDate}
- Current day: ${timeInfo.currentDay}
- Current month: ${timeInfo.currentMonth}
- Current year: ${timeInfo.currentYear}

When setting deadlines:
1. If user mentions "end of week" → Use ${timeInfo.endOfWeek}
2. If user mentions "end of month" → Use ${timeInfo.endOfMonth}
3. If user mentions "next week" → Use ${timeInfo.nextWeek.start}
4. If user mentions "next month" → Use ${timeInfo.nextMonth.start}
5. If user mentions "within a week" or "in a week" → Use ${timeInfo.withinWeek}
6. If user mentions "within a month" or "in a month" → Use ${timeInfo.withinMonth}
7. For any other date, use the current year (${currentYear}) unless explicitly specified otherwise

Determine if this is a request to:
1. Create a new task
2. Update/edit an existing task
3. Mark a task as complete
4. Delete a task
5. Query tasks based on time period
6. None of the above (just a question about tasks)

Respond with ONLY ONE of the following JSON formats:

For task creation:
{
  "operation": "create",
  "details": {
    "name": "task name",
    "desc": "task description",
    "deadline": "YYYY-MM-DD" (MUST use one of the exact dates above for time-based requests),
    "category": "category name" (if mentioned, otherwise "General"),
    "tags": ["tag1", "tag2"] (if mentioned, otherwise [])
  }
}

For task update:
{
  "operation": "update",
  "targetTask": "exact name of the task to update",
  "details": {
    "name": "new task name" (if changing, otherwise null),
    "desc": "new description" (if changing, otherwise null),
    "deadline": "YYYY-MM-DD" (MUST use one of the exact dates above for time-based requests),
    "category": "new category" (if changing, otherwise null),
    "tags": ["tag1", "tag2"] (if changing, otherwise null)
  }
}

For marking as complete:
{
  "operation": "complete",
  "targetTask": "exact name of the task to mark complete"
}

For task deletion:
{
  "operation": "delete",
  "targetTask": "exact name of the task to delete"
}

For time-based queries:
{
  "operation": "timeQuery",
  "timeFrame": {
    "type": "week" | "month" | "endOfWeek" | "endOfMonth" | "withinWeek" | "withinMonth",
    "startDate": "YYYY-MM-DD" (MUST use one of the exact dates above),
    "endDate": "YYYY-MM-DD" (MUST use one of the exact dates above)
  }
}

For regular questions:
{
  "operation": "query",
  "question": "${userQuery}"
}

Return ONLY valid JSON. Base your analysis on these tasks:
${JSON.stringify(taskContext, null, 2)}
    `;

    return this.getGeminiResponse(prompt).pipe(
      map(response => {
        try {
          const candidates = response?.candidates || [];
          if (candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
            const responseText = candidates[0].content.parts[0].text.trim();
            
            // Extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              
              // Ensure dates use the correct time periods
              if (jsonResponse.operation === 'create' || jsonResponse.operation === 'update') {
                const details = jsonResponse.details;
                if (details && details.deadline) {
                  // Convert the deadline to a Date object
                  const deadlineDate = new Date(details.deadline);
                  
                  // Check if the deadline matches any of our time periods
                  const deadlineStr = deadlineDate.toLocaleDateString();
                  if (deadlineStr === timeInfo.endOfWeek) {
                    details.deadline = new Date(timeInfo.endOfWeek).toISOString().split('T')[0];
                  } else if (deadlineStr === timeInfo.endOfMonth) {
                    details.deadline = new Date(timeInfo.endOfMonth).toISOString().split('T')[0];
                  } else if (deadlineStr === timeInfo.nextWeek.start) {
                    details.deadline = new Date(timeInfo.nextWeek.start).toISOString().split('T')[0];
                  } else if (deadlineStr === timeInfo.nextMonth.start) {
                    details.deadline = new Date(timeInfo.nextMonth.start).toISOString().split('T')[0];
                  } else if (deadlineDate.getFullYear() !== currentYear) {
                    deadlineDate.setFullYear(currentYear);
                    details.deadline = deadlineDate.toISOString().split('T')[0];
                  }
                }
              }
              
              return {
                operation: jsonResponse.operation,
                data: jsonResponse,
                rawResponse: null
              };
            }
          }
          
          // If we couldn't parse the response as an operation, treat it as a regular response
          return {
            operation: 'query',
            data: null,
            rawResponse: candidates[0].content.parts[0].text.trim()
          };
        } catch (error) {
          console.error("Error parsing AI operation:", error);
          return {
            operation: 'error',
            data: null,
            rawResponse: 'Failed to parse AI response as a valid operation.'
          };
        }
      })
    );
  }

  // Execute the task operation
  executeTaskOperation(operation: string, data: any, tasks: any[]): Observable<any> {
    switch (operation) {
      case 'create':
        return this.todoService.addTask({
          name: data.details.name,
          desc: data.details.desc || '',
          deadline: data.details.deadline || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
          category: data.details.category || 'General',
          tags: data.details.tags || []
        }).pipe(
          map(() => ({ success: true, message: `Task "${data.details.name}" created successfully.` }))
        );
      
      case 'update':
        const taskToUpdate = tasks.find(task => 
          task.name.toLowerCase() === data.targetTask.toLowerCase()
        );
        
        if (!taskToUpdate) {
          return of({ success: false, message: `Could not find a task named "${data.targetTask}".` });
        }
        
        const updateData: any = {};
        if (data.details.name !== null) updateData.name = data.details.name;
        if (data.details.desc !== null) updateData.desc = data.details.desc;
        if (data.details.deadline !== null) updateData.deadline = data.details.deadline;
        if (data.details.category !== null) updateData.category = data.details.category;
        if (data.details.tags !== null) updateData.tags = data.details.tags;
        
        return this.todoService.updateTask(taskToUpdate.id, updateData).pipe(
          map(() => ({ success: true, message: `Task "${data.targetTask}" updated successfully.` }))
        );
      
      case 'complete':
        const taskToComplete = tasks.find(task => 
          task.name.toLowerCase() === data.targetTask.toLowerCase()
        );
        
        if (!taskToComplete) {
          return of({ success: false, message: `Could not find a task named "${data.targetTask}".` });
        }
        
        return this.todoService.updateTask(taskToComplete.id, { 
          completed: true,
          completedDate: new Date().toISOString()
        }).pipe(
          map(() => ({ success: true, message: `Task "${data.targetTask}" marked as complete.` }))
        );
      
      case 'delete':
        const taskToDelete = tasks.find(task => 
          task.name.toLowerCase() === data.targetTask.toLowerCase()
        );
        
        if (!taskToDelete) {
          return of({ success: false, message: `Could not find a task named "${data.targetTask}".` });
        }
        
        return this.todoService.deleteTask(taskToDelete.id).pipe(
          map(() => ({ success: true, message: `Task "${data.targetTask}" deleted successfully.` }))
        );

      case 'timeQuery':
        const { startDate, endDate } = data.timeFrame;
        const filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.deadline);
          return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
        });
        
        return of({
          success: true,
          tasks: filteredTasks,
          message: `Found ${filteredTasks.length} tasks for the specified time period.`
        });
      
      default:
        return of({ success: false, message: 'Invalid operation.' });
    }
  }

  // Helper method to calculate time periods
  private calculateTimePeriod(type: string): { startDate: string, endDate: string } {
    const now = new Date();
    // Set time to noon to avoid timezone issues
    now.setHours(12, 0, 0, 0);
    
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let startDate: Date, endDate: Date;

    switch (type) {
      case 'week':
        // Start from today
        startDate = new Date(now);
        // End after 7 days
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'month':
        // Start from today
        startDate = new Date(now);
        // End after 30 days
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'endOfWeek':
        // Start from today
        startDate = new Date(now);
        // Calculate days until Saturday (6 is Saturday in getDay())
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        endDate = new Date(now);
        endDate.setDate(now.getDate() + daysUntilSaturday + 1);
        break;

      case 'endOfMonth':
        // Start from today
        startDate = new Date(now);
        // Get the last day of the current month
        endDate = new Date(currentYear, currentMonth + 1, 1, 12, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'nextWeek':
        // Start from next Monday
        const daysUntilMonday = (1 - now.getDay() + 7) % 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + daysUntilMonday);
        // End on next Sunday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6 + 1);
        break;

      case 'nextMonth':
        // Start from first day of next month
        startDate = new Date(currentYear, currentMonth + 1, 1, 12, 0, 0, 0);
        // End on last day of next month
        endDate = new Date(currentYear, currentMonth + 2, 1, 12, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'withinWeek':
        // Start from today
        startDate = new Date(now);
        // End after 7 days
        endDate = new Date(now);
        endDate.setDate(now.getDate() + 7);
        break;

      case 'withinMonth':
        // Start from today
        startDate = new Date(now);
        // End after 30 days
        endDate = new Date(now);
        endDate.setDate(now.getDate() + 30);
        break;

      default:
        throw new Error('Invalid time period type');
    }

    // Ensure all dates are set to noon to avoid timezone issues
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }
} 