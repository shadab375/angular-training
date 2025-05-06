import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent {
  @Input() history: string[] = [];
  @Input() command: string = '';
  @Output() commandExecute = new EventEmitter<string>();

  executeCommand(): void {
    if (this.command.trim()) {
      this.commandExecute.emit(this.command);
      this.command = '';
    }
  }
} 