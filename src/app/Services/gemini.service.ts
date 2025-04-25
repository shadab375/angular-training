import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// TODO: Add environment import later
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  // Use environment variables
  private apiKey = environment.geminiApiKey;
  private apiUrl = environment.geminiApiUrl;

  constructor(private http: HttpClient) {}

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

  // We will add a more complex function later to handle task context
} 