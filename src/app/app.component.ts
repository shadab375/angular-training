// src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    template: '<router-outlet></router-outlet>'
})
export class AppComponent {
    title = 'Task Master Pro';
}