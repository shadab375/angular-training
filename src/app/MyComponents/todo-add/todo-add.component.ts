// src\app\MyComponents\todo-add\todo-add.component.ts

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-todo-add',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './todo-add.component.html',
    styleUrls: ['./todo-add.component.css'],
    animations: [
        trigger('formAnimation', [
            transition(':enter', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateY(0)', opacity: 1 }),
                animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
            ])
        ])
    ]
})
export class TodoAddComponent implements OnInit {
    name: string = '';
    desc: string = '';
    deadline: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    priority: string = 'Medium';
    disable: boolean = true;
    @Output() todoAdd: EventEmitter<any> = new EventEmitter();

    ngOnInit(): void {
        this.handleChange();
    }

    handleChange() {
        this.disable = !(this.name.length > 0);
    }

    handleSubmit() {
        this.todoAdd.emit({
            name: this.name,
            desc: this.desc,
            deadline: this.deadline,
            priority: this.priority
        });
        this.name = '';
        this.desc = '';
        this.deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        this.priority = 'Medium';
        this.handleChange();
    }
}