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
  ) {}

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
    const prompt = `
You are a task management assistant. Analyze the following user request:

"${userQuery}"

Determine if this is a request to:
1. Create a new task
2. Update/edit an existing task
3. Mark a task as complete
4. Delete a task
5. None of the above (just a question about tasks)

Respond with ONLY ONE of the following JSON formats:

For task creation:
{
  "operation": "create",
  "details": {
    "name": "task name",
    "desc": "task description",
    "deadline": "YYYY-MM-DD" (if mentioned, otherwise null),
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
    "deadline": "YYYY-MM-DD" (if changing, otherwise null),
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
      
      default:
        return of({ success: true, isQuery: true });
    }
  }
} 