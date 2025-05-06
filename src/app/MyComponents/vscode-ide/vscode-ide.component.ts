import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vscode-ide',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './vscode-ide.component.html',
  styleUrls: ['./vscode-ide.component.css']
})
export class VscodeIdeComponent implements OnInit {
  // Active file in the editor
  activeFile: any = null;
  
  // Files in the workspace
  files: any[] = [
    { 
      name: 'examples', 
      type: 'folder',
      isOpen: true,
      children: [
        { name: 'react-example.jsx', type: 'file', content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;' },
        { name: 'python-example.py', type: 'file', content: 'def hello_world():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    hello_world()' },
        { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script src="main.js"></script>\n</body>\n</html>' }
      ]
    },
    { 
      name: 'my-project', 
      type: 'folder',
      isOpen: false,
      children: []
    }
  ];

  // Terminal history
  terminalHistory: string[] = ['Welcome to VSCode IDE Terminal'];
  terminalCommand: string = '';
  
  // Program execution
  isRunning: boolean = false;
  currentProcess: string | null = null;
  outputPreview: string | null = null;
  
  // Development server
  devServerRunning: boolean = false;
  devServerPort: number = 3000;
  
  constructor() { }

  ngOnInit(): void {
  }

  // Handle file selection
  onFileSelect(file: any): void {
    if (file.type === 'file') {
      this.activeFile = file;
    }
  }

  // Handle file content changes
  onContentChange(content: string): void {
    if (this.activeFile) {
      this.activeFile.content = content;
      
      // If dev server is running, update the preview
      if (this.devServerRunning && this.outputPreview) {
        this.updatePreview();
      }
    }
  }
  
  // Update preview for running app
  updatePreview(): void {
    if (!this.activeFile) return;
    
    const fileExt = this.activeFile.name.split('.').pop();
    
    if (fileExt === 'jsx' || fileExt === 'js' || fileExt === 'html') {
      this.outputPreview = `<div class="preview-window">
        <div class="preview-header">
          <span>App Preview (localhost:${this.devServerPort})</span>
        </div>
        <div class="preview-content">
          ${this.activeFile.content.includes('<h1>') ? 
            this.activeFile.content.replace(/<script.*?<\/script>/gs, '') : 
            '<div><h1>Hello World</h1><p>Preview of your application</p></div>'}
        </div>
      </div>`;
    }
  }

  // Handle terminal command execution
  executeCommand(command: string): void {
    this.terminalHistory.push(`$ ${command}`);
    
    // Expanded command processing logic
    if (command.startsWith('echo ')) {
      this.terminalHistory.push(command.substring(5));
    } else if (command === 'clear') {
      this.terminalHistory = [];
    } else if (command === 'ls' || command === 'dir') {
      this.listDirectoryContents();
    } else if (command.startsWith('cd ')) {
      this.terminalHistory.push(`Changed directory to ${command.substring(3)}`);
    } else if (command.startsWith('python ')) {
      this.executePythonScript(command);
    } else if (command.startsWith('npm ')) {
      this.executeNpmCommand(command);
    } else if (command.startsWith('node ')) {
      this.executeNodeScript(command);
    } else if (command.startsWith('mkdir ')) {
      this.createDirectory(command);
    } else if (command.startsWith('touch ') || command.startsWith('new-item ')) {
      this.createFile(command);
    } else if (command === 'stop' || command === 'exit') {
      this.stopCurrentProcess();
    } else {
      this.terminalHistory.push(`Command not recognized: ${command}`);
    }
    
    // Clear the command input
    this.terminalCommand = '';
  }
  
  // List directory contents
  listDirectoryContents(): void {
    let output = '';
    this.files.forEach(item => {
      output += item.type === 'folder' ? `${item.name}/\n` : `${item.name}\n`;
    });
    this.terminalHistory.push(output.trim());
  }
  
  // Execute Python script
  executePythonScript(command: string): void {
    const fileName = command.substring(7).trim();
    let scriptFound = false;
    
    // Search for the file in our virtual file system
    this.files.forEach(folder => {
      if (folder.type === 'folder' && folder.children) {
        folder.children.forEach((file: any) => {
          if (file.name === fileName) {
            scriptFound = true;
            this.isRunning = true;
            this.currentProcess = `Python: ${fileName}`;
            
            // Execute the Python code (simulation)
            setTimeout(() => {
              if (file.content.includes('print(')) {
                // Extract print statements and display output
                const printRegex = /print\(["'](.+?)["']\)/g;
                const matches = [...file.content.matchAll(printRegex)];
                
                if (matches.length > 0) {
                  matches.forEach((match) => {
                    this.terminalHistory.push(match[1]);
                  });
                } else {
                  this.terminalHistory.push('Script executed successfully');
                }
              } else {
                this.terminalHistory.push('Script executed successfully');
              }
              
              this.isRunning = false;
              this.currentProcess = null;
            }, 1000);
          }
        });
      }
    });
    
    if (!scriptFound) {
      this.terminalHistory.push(`Error: File ${fileName} not found`);
    }
  }
  
  // Execute NPM command
  executeNpmCommand(command: string): void {
    const npmCommand = command.substring(4).trim();
    
    if (npmCommand.startsWith('init')) {
      this.terminalHistory.push('Initializing new npm project...');
      setTimeout(() => {
        this.terminalHistory.push('Created package.json');
        // Add package.json to project folder
        this.files[1].children.push({
          name: 'package.json',
          type: 'file',
          content: `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A project created in VSCode IDE",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "dev": "react-scripts start"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`
        });
      }, 1500);
    } else if (npmCommand.startsWith('install') || npmCommand.startsWith('i ')) {
      const packages = npmCommand.split(' ').slice(1).join(', ');
      this.isRunning = true;
      this.currentProcess = `npm install: ${packages}`;
      this.terminalHistory.push(`Installing packages: ${packages}`);
      
      // Simulate npm install
      setTimeout(() => {
        this.terminalHistory.push('+ ' + packages + ' installed');
        this.terminalHistory.push('added 120 packages in 2.5s');
        this.isRunning = false;
        this.currentProcess = null;
      }, 2500);
    } else if (npmCommand === 'start' || npmCommand === 'run start') {
      this.startDevServer();
    } else if (npmCommand === 'run dev' || npmCommand === 'run develop') {
      this.startDevServer();
    } else {
      this.terminalHistory.push(`Executing: npm ${npmCommand}`);
      setTimeout(() => {
        this.terminalHistory.push('Command completed successfully');
      }, 1000);
    }
  }
  
  // Execute Node.js script
  executeNodeScript(command: string): void {
    const fileName = command.substring(5).trim();
    this.terminalHistory.push(`Executing Node.js script: ${fileName}`);
    this.isRunning = true;
    this.currentProcess = `Node: ${fileName}`;
    
    setTimeout(() => {
      this.terminalHistory.push('Script executed successfully');
      this.isRunning = false;
      this.currentProcess = null;
    }, 1500);
  }
  
  // Create directory
  createDirectory(command: string): void {
    const folderName = command.substring(6).trim();
    this.terminalHistory.push(`Created directory: ${folderName}`);
    this.files.push({
      name: folderName,
      type: 'folder',
      isOpen: false,
      children: []
    });
  }
  
  // Create file
  createFile(command: string): void {
    const fileName = command.startsWith('touch ') ? 
                    command.substring(6).trim() : 
                    command.substring(9).trim();
    this.terminalHistory.push(`Created file: ${fileName}`);
    
    // Add to my-project folder
    if (this.files[1].children) {
      this.files[1].children.push({
        name: fileName,
        type: 'file',
        content: ''
      });
    }
  }
  
  // Start development server
  startDevServer(): void {
    if (this.devServerRunning) {
      this.terminalHistory.push('Development server is already running');
      return;
    }
    
    this.isRunning = true;
    this.currentProcess = 'Development Server';
    this.terminalHistory.push('Starting development server...');
    
    setTimeout(() => {
      this.devServerRunning = true;
      this.terminalHistory.push(`Server running at http://localhost:${this.devServerPort}/`);
      this.terminalHistory.push('Use CTRL+C to stop the server');
      this.updatePreview();
      this.isRunning = false;
    }, 2000);
  }
  
  // Stop current process
  stopCurrentProcess(): void {
    if (this.devServerRunning) {
      this.devServerRunning = false;
      this.outputPreview = null;
      this.terminalHistory.push('Development server stopped');
    } else if (this.isRunning) {
      this.isRunning = false;
      this.terminalHistory.push(`Process ${this.currentProcess} terminated`);
      this.currentProcess = null;
    } else {
      this.terminalHistory.push('No process running to stop');
    }
  }
} 